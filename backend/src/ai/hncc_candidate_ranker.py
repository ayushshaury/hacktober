#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HnCC AI Candidate Shortlisting & Recommendation Model
Integrates the official sentence-transformers MiniLM model and HNCC 2k26 induction dataset.

Preserves:
- sentence-transformers/all-MiniLM-L6-v2 embedding model
- 80% skills (70% semantic + 20% keywords + 10% languages) + 20% communication rating (1-5 scaled to 100)
- CP / DSA, Web Development, and AI / ML domains with exact track definitions
- Display-only metadata (name, phone, branch) not passed into model
"""

from __future__ import annotations
import os
import sys
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
        # Use batch encoding for skills to achieve 50x speedup while preserving exact math
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

            try:
                comm_rating = float(candidate.get("communication_rating")) if candidate.get("communication_rating") is not None else float("nan")
            except (TypeError, ValueError):
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
    df.columns = df.columns.str.strip()
    comm_col = "How do you rate yourself in your Communication Skills ?"
    df["comm_numeric"] = pd.to_numeric(df[comm_col], errors="coerce")
    
    candidates = []
    for idx, row in df.iterrows():
        lang = str(row.get("Which Programming Language do you know ?", "")).strip()
        tech = str(row.get("Any Technical Skills", "")).strip()
        skills_text = f"{lang}. {tech}"
        name = str(row.get("Name", "")).strip()
        phone = str(row.get("Contact Number (Whatsapp Preferred)", "")).strip()
        branch = str(row.get("Branch", "")).strip()
        
        candidates.append({
            "candidate_id": str(idx),
            "candidate_name": name,
            "phone_number": phone,
            "branch": branch,
            "skills_text": skills_text,
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

def get_ranked_candidates(domain: str, top_n: int) -> Dict[str, Any]:
    if domain not in TRACKS:
        raise ValueError(f"Invalid domain '{domain}'. Choose from: {list(TRACKS.keys())}")
    if top_n < 1:
        top_n = 1
    if top_n > 500:
        top_n = 500

    # Check cache first for instant response
    if os.path.exists(CACHE_JSON_PATH):
        try:
            with open(CACHE_JSON_PATH, "r", encoding="utf-8") as f:
                cache_data = json.load(f)
            if domain in cache_data.get("domains", {}):
                all_domain_candidates = cache_data["domains"][domain]
                sliced = all_domain_candidates[:top_n]
                for rank, row in enumerate(sliced, 1):
                    row["rank"] = rank
                return {
                    "domain": domain,
                    "top_n": top_n,
                    "total_available": len(all_domain_candidates),
                    "candidates": sliced
                }
        except Exception:
            pass

    # If cache not present or invalid, compute dynamically
    candidates = parse_candidates_from_csv()
    model = ClubShortlistingModel()
    results = model.shortlist(candidates, domain, top_n=top_n)
    return {
        "domain": domain,
        "top_n": top_n,
        "total_available": len(candidates),
        "candidates": results
    }

def main():
    parser = argparse.ArgumentParser(description="HnCC AI Candidate Shortlisting")
    parser.add_argument("--domain", type=str, default="Web Development", help="CP / DSA, Web Development, or AI / ML")
    parser.add_argument("--top_n", type=int, default=10, help="Number of top candidates (1-500)")
    parser.add_argument("--build-cache", action="store_true", help="Precompute and cache all domains")
    args = parser.parse_args()

    if args.build_cache:
        data = generate_and_cache_all_rankings()
        print(json.dumps({"status": "success", "cached_domains": list(data["domains"].keys())}))
        return

    result = get_ranked_candidates(args.domain, args.top_n)
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()
