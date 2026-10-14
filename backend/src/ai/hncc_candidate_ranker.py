#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations
import os
import re
import json
import argparse
from typing import Any, Dict, Iterable, List, Optional
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
WEIGHTS = {"skills": 0.80, "communication": 0.20}

TRACKS: Dict[str, Dict[str, Any]] = {
    "CP / DSA": {
        "description": "Competitive programming, data structures and algorithms, algorithmic problem solving, complexity analysis, graphs, trees, dynamic programming, recursion, sorting, searching and coding contests.",
        "languages": ["c++", "cpp", "java", "c"],
        "keywords": ["data structures", "algorithms", "competitive programming", "problem solving", "dsa", "dynamic programming", "graphs", "trees", "recursion", "complexity analysis", "codeforces", "leetcode", "codechef", "binary search", "sorting", "coding contests"],
    },
    "Web Development": {
        "description": "Web application development including HTML, CSS, JavaScript, React, TypeScript, frontend engineering, backend APIs, Node.js, Express, databases, authentication and full stack applications.",
        "languages": ["javascript", "typescript", "html", "css"],
        "keywords": ["web development", "frontend", "backend", "full stack", "html", "css", "javascript", "react", "vite", "node.js", "express", "rest api", "api development", "postgresql", "mongodb", "web applications", "authentication", "responsive website"],
    },
    "AI / ML": {
        "description": "Artificial intelligence and machine learning including Python, data science, data analysis, supervised learning, deep learning, neural networks, natural language processing, computer vision, model evaluation, transformers and generative AI.",
        "languages": ["python", "r", "julia"],
        "keywords": ["artificial intelligence", "machine learning", "deep learning", "data science", "data analysis", "python", "numpy", "pandas", "scikit-learn", "pytorch", "tensorflow", "neural networks", "natural language processing", "nlp", "computer vision", "opencv", "transformers", "hugging face", "generative ai", "llm", "model training", "classification", "regression"],
    },
}

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), "data")
CSV_PATH = os.path.join(DATA_DIR, "hncc_candidates.csv")
CACHE_JSON_PATH = os.path.join(DATA_DIR, "hncc_ranked_cache.json")

def _clean(value: Any) -> str:
    if value is None:
        return ""
    try:
        if bool(np.isnan(value)):
            return ""
    except (TypeError, ValueError):
        pass
    return str(value).strip().lower()

def _contains(text: str, term: str) -> bool:
    return re.search(r"(?<![\w])" + re.escape(term.lower()) + r"(?![\w])", text, re.I) is not None

class ClubShortlistingModel:
    def __init__(self, model: Optional[Any] = None):
        self.model = model if model is not None else SentenceTransformer(MODEL_NAME)

    def score_candidate(self, skills_text: str, communication_rating: Optional[float], domain: str) -> Dict[str, Any]:
        if domain not in TRACKS:
            raise ValueError(f"Unknown domain {domain!r}; choose from {list(TRACKS)}")
        track = TRACKS[domain]
        skills = _clean(skills_text)
        matched_keywords = [term for term in track["keywords"] if _contains(skills, term)]
        matched_languages = [term for term in track["languages"] if _contains(skills, term)]
        if skills:
            vectors = self.model.encode([skills, track["description"]], normalize_embeddings=True)
            semantic_score = float(np.clip(np.dot(vectors[0], vectors[1]), 0, 1) * 100)
            keyword_score = min(100.0, len(matched_keywords) / 3.0 * 100)
            language_score = min(100.0, len(matched_languages) / 2.0 * 100)
            skills_score = 0.70 * semantic_score + 0.20 * keyword_score + 0.10 * language_score
        else:
            semantic_score = keyword_score = language_score = skills_score = 0.0
        try:
            rating = float(communication_rating) if communication_rating is not None else float("nan")
        except (TypeError, ValueError):
            rating = float("nan")
        if not np.isfinite(rating) or not 1 <= rating <= 5:
            comm_score = final_score = None
        else:
            comm_score = rating / 5.0 * 100.0
            final_score = WEIGHTS["skills"] * skills_score + WEIGHTS["communication"] * comm_score
        return {
            "domain": domain,
            "skills_score": round(float(skills_score), 2),
            "communication_rating": rating if np.isfinite(rating) else None,
            "communication_score": round(float(comm_score), 2) if comm_score is not None else None,
            "final_score": round(float(final_score), 2) if final_score is not None else None,
            "matched_keywords": matched_keywords,
            "matched_languages": matched_languages,
            "needs_admin_review": True,
        }

    def shortlist(self, candidates: Iterable[Dict[str, Any]], domain: str, top_n: int) -> List[Dict[str, Any]]:
        if domain not in TRACKS:
            raise ValueError(f"Unknown domain {domain!r}; choose from {list(TRACKS)}")
        if isinstance(top_n, bool) or not isinstance(top_n, int) or not 1 <= top_n <= 500:
            raise ValueError("top_n must be an integer between 1 and 500")
        
        candidates_list = list(candidates)
        
        track = TRACKS[domain]
        all_skills = [_clean(c.get("skills_text", "")) for c in candidates_list]
        non_empty_indices = [i for i, s in enumerate(all_skills) if s]
        
        track_vector = self.model.encode([track["description"]], normalize_embeddings=True)[0]
        
        semantic_scores = [0.0] * len(candidates_list)
        if non_empty_indices:
            non_empty_skills = [all_skills[i] for i in non_empty_indices]
            skill_vectors = self.model.encode(non_empty_skills, normalize_embeddings=True, batch_size=64)
            sims = np.clip(np.dot(skill_vectors, track_vector), 0, 1) * 100
            for idx, orig_i in enumerate(non_empty_indices):
                semantic_scores[orig_i] = float(sims[idx])

        scored = []
        for i, candidate in enumerate(candidates_list):
            skills = all_skills[i]
            matched_keywords = [term for term in track["keywords"] if _contains(skills, term)]
            matched_languages = [term for term in track["languages"] if _contains(skills, term)]
            
            if skills:
                sem_score = semantic_scores[i]
                kw_score = min(100.0, len(matched_keywords) / 3.0 * 100)
                lang_score = min(100.0, len(matched_languages) / 2.0 * 100)
                skills_score = 0.70 * sem_score + 0.20 * kw_score + 0.10 * lang_score
            else:
                skills_score = 0.0

            raw_comm = candidate.get("communication_rating")
            if raw_comm is not None:
                try:
                    comm_rating = float(raw_comm)
                except (TypeError, ValueError):
                    comm_rating = float("nan")
            else:
                comm_rating = float("nan")

            if not np.isfinite(comm_rating) or not 1 <= comm_rating <= 5:
                continue

            comm_score = (comm_rating / 5.0) * 100.0
            final_score = WEIGHTS["skills"] * skills_score + WEIGHTS["communication"] * comm_score

            scored.append({
                "candidate_id": str(candidate.get("candidate_id", i)),
                "candidate_name": candidate.get("candidate_name", "Anonymous"),
                "phone_number": candidate.get("phone_number", "N/A"),
                "branch": candidate.get("branch", "N/A"),
                "domain": domain,
                "skills_score": round(float(skills_score), 2),
                "communication_rating": round(float(comm_rating), 1),
                "communication_score": round(float(comm_score), 2),
                "final_score": round(float(final_score), 2),
                "matched_keywords": matched_keywords,
                "matched_languages": matched_languages,
                "needs_admin_review": True
            })

        scored.sort(key=lambda row: (row["final_score"], row["skills_score"]), reverse=True)
        top = scored[:top_n]
        for rank, row in enumerate(top, 1):
            row["rank"] = rank
        return top

def parse_candidates_from_csv(csv_path: str = CSV_PATH) -> List[Dict[str, Any]]:
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Candidate dataset not found at {csv_path}")
    df = pd.read_csv(csv_path)
    df.columns = [str(c).strip() for c in df.columns]

    
    comm_col = "How do you rate yourself in your Communication Skills ?"
    if comm_col not in df.columns:
        for c in df.columns:
            if "communication" in c.lower() or "comm" in c.lower():
                comm_col = c
                break

    if comm_col in df.columns:
        df["comm_numeric"] = pd.to_numeric(df[comm_col], errors="coerce")
    else:
        df["comm_numeric"] = 3.0  
    lang_col = "Which Programming Language do you know ?"
    if lang_col not in df.columns:
        for c in df.columns:
            if "programming language" in c.lower() or ("language" in c.lower() and "know" in c.lower()):
                lang_col = c
                break

    tech_col = "Any Technical Skills"
    if tech_col not in df.columns:
        for c in df.columns:
            if "technical skill" in c.lower() or "skills" in c.lower():
                tech_col = c
                break

    name_col = "Name"
    if name_col not in df.columns:
        for c in df.columns:
            if "name" in c.lower() and "club" not in c.lower():
                name_col = c
                break

    phone_col = "Contact Number (Whatsapp Preferred)"
    if phone_col not in df.columns:
        for c in df.columns:
            if "contact" in c.lower() or "phone" in c.lower() or "whatsapp" in c.lower() or "mobile" in c.lower():
                phone_col = c
                break

    branch_col = "Branch"
    if branch_col not in df.columns:
        for c in df.columns:
            if "branch" in c.lower() or "department" in c.lower():
                branch_col = c
                break

    candidates = []
    for idx, row in df.iterrows():
        cand_num = int(idx) + 1 if isinstance(idx, int) else (len(candidates) + 1)
        lang = str(row.get(lang_col, "")) if lang_col in df.columns else ""
        tech = str(row.get(tech_col, "")) if tech_col in df.columns else ""
        if lang and tech and lang != "nan" and tech != "nan":
            skills_text = f"{lang}. {tech}"
        elif lang and lang != "nan":
            skills_text = str(lang)
        elif tech and tech != "nan":
            skills_text = str(tech)
        else:
            skills_text = ""

        raw_name = str(row.get(name_col, f"Candidate #{cand_num}")) if name_col in df.columns else f"Candidate #{cand_num}"
        name = "Anonymous" if raw_name == "nan" or not raw_name.strip() else raw_name.strip()

        raw_phone = str(row.get(phone_col, "N/A")) if phone_col in df.columns else "N/A"
        phone = "N/A" if raw_phone == "nan" or not raw_phone.strip() else raw_phone.strip()

        raw_branch = str(row.get(branch_col, "N/A")) if branch_col in df.columns else "N/A"
        branch = "N/A" if raw_branch == "nan" or not raw_branch.strip() else raw_branch.strip()

        candidates.append({
            "candidate_id": str(idx),
            "candidate_name": name,
            "phone_number": phone,
            "branch": branch,
            "skills_text": skills_text.strip(),
            "communication_rating": row["comm_numeric"]
        })
    return candidates

def generate_and_cache_all_rankings():
    """Generates rankings for all 3 tracks across all candidates and saves to CACHE_JSON_PATH."""
    candidates = parse_candidates_from_csv()
    model = ClubShortlistingModel()
    
    cache_data = {
        "total_candidates": len(candidates),
        "domains": {}
    }
    
    for domain in TRACKS.keys():
        ranked_all = model.shortlist(candidates, domain, top_n=500)
        cache_data["domains"][domain] = ranked_all

    with open(CACHE_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(cache_data, f, indent=2, ensure_ascii=False)
    return cache_data

def mask_candidate_name(name: str) -> str:
    """Masks candidate name to first letter of name + first letter of surname (e.g. Ayush Kumar -> AK)."""
    if not name or str(name).strip() in ("N/A", "nan", "Anonymous", ""):
        return "Anonymous"
    parts = [p.strip() for p in str(name).strip().split() if p.strip()]
    if not parts:
        return "Anonymous"
    if len(parts) == 1:
        return parts[0][0].upper()
    return f"{parts[0][0].upper()}{parts[-1][0].upper()}"

def hash_phone_number(phone: str) -> str:
    """Hashes/masks phone number for non-master admins on seeded data (e.g. 8409374177 -> ******4177)."""
    if not phone or str(phone).strip() in ("N/A", "nan", ""):
        return "N/A"
    clean = str(phone).strip()
    prefix = ""
    if clean.startswith("+91"):
        prefix = "+91 "
        clean = clean[3:].strip()
    elif clean.startswith("+"):
        prefix = clean[:3] + " "
        clean = clean[3:].strip()
    
    digits = "".join(ch for ch in clean if ch.isdigit())
    if len(digits) >= 4:
        masked_digits = ("*" * max(6, len(digits) - 4)) + digits[-4:]
        return f"{prefix}{masked_digits}"
    return f"{prefix}******"

def get_ranked_candidates(domain: str, top_n: int, csv_path: Optional[str] = None, admin_email: Optional[str] = None) -> Dict[str, Any]:
    if domain not in TRACKS:
        raise ValueError(f"Invalid domain '{domain}'. Choose from: {list(TRACKS.keys())}")
    if top_n < 1:
        top_n = 1
    if top_n > 500:
        top_n = 500

    is_master_admin = (admin_email or "").strip().lower() == "hncc.admin@bitsindri.ac.in"

    # If custom CSV provided, compute directly from that CSV (Neither names nor phone numbers are masked for custom user CSVs)
    if csv_path and os.path.exists(csv_path):
        candidates = parse_candidates_from_csv(csv_path)
        model = ClubShortlistingModel()
        results = model.shortlist(candidates, domain, top_n=top_n)
        return {
            "domain": domain,
            "top_n": top_n,
            "total_available": len(candidates),
            "custom_source": True,
            "candidates": results
        }

    # Otherwise check cache first for instant response (Seeded official data)
    if os.path.exists(CACHE_JSON_PATH):
        try:
            with open(CACHE_JSON_PATH, "r", encoding="utf-8") as f:
                cache_data = json.load(f)
            if domain in cache_data.get("domains", {}):
                all_domain_candidates = cache_data["domains"][domain]
                sliced = [dict(c) for c in all_domain_candidates[:top_n]]
                for rank, row in enumerate(sliced, 1):
                    row["rank"] = rank
                    # Hash phone number and mask name to initials (e.g. Ayush Kumar -> AK) for non-master admins on seeded data
                    if not is_master_admin:
                        row["phone_number"] = hash_phone_number(row.get("phone_number", "N/A"))
                        row["candidate_name"] = mask_candidate_name(row.get("candidate_name", ""))
                return {
                    "domain": domain,
                    "top_n": top_n,
                    "total_available": len(all_domain_candidates),
                    "custom_source": False,
                    "candidates": sliced
                }
        except Exception:
            pass

    # Fallback compute dynamically from default dataset
    candidates = parse_candidates_from_csv()
    model = ClubShortlistingModel()
    results = model.shortlist(candidates, domain, top_n=top_n)
    
    # Hash phone number and mask name to initials for non-master admins on seeded data
    if not is_master_admin:
        for r in results:
            r["phone_number"] = hash_phone_number(r.get("phone_number", "N/A"))
            r["candidate_name"] = mask_candidate_name(r.get("candidate_name", ""))

    return {
        "domain": domain,
        "top_n": top_n,
        "total_available": len(candidates),
        "custom_source": False,
        "candidates": results
    }

def main():
    parser = argparse.ArgumentParser(description="HnCC AI Candidate Shortlisting")
    parser.add_argument("--domain", type=str, default="Web Development", help="CP / DSA, Web Development, or AI / ML")
    parser.add_argument("--top_n", type=int, default=10, help="Number of top candidates (1-500)")
    parser.add_argument("--csv_path", type=str, default=None, help="Optional path to custom candidate CSV")
    parser.add_argument("--admin_email", type=str, default=None, help="Email of requesting administrator")
    parser.add_argument("--build-cache", action="store_true", help="Precompute and cache all domains")
    args = parser.parse_args()

    if args.build_cache:
        data = generate_and_cache_all_rankings()
        print(json.dumps({"status": "success", "cached_domains": list(data["domains"].keys())}))
        return

    result = get_ranked_candidates(args.domain, args.top_n, csv_path=args.csv_path, admin_email=args.admin_email)
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()

