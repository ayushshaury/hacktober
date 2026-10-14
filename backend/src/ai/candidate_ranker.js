import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const WEIGHTS = {
  skills: 0.80,
  communication: 0.20
};

export const TRACKS = {
  'CP / DSA': {
    description: 'Competitive programming, data structures and algorithms, algorithmic problem solving, complexity analysis, graphs, trees, dynamic programming, recursion, sorting, searching and coding contests.',
    languages: ['c++', 'cpp', 'java', 'c'],
    keywords: [
      'data structures', 'algorithms', 'competitive programming', 'problem solving',
      'dsa', 'dynamic programming', 'graphs', 'trees', 'recursion', 'complexity analysis',
      'codeforces', 'leetcode', 'codechef', 'binary search', 'sorting', 'coding contests'
    ]
  },
  'Web Development': {
    description: 'Web application development including HTML, CSS, JavaScript, React, TypeScript, frontend engineering, backend APIs, Node.js, Express, databases, authentication and full stack applications.',
    languages: ['javascript', 'typescript', 'html', 'css'],
    keywords: [
      'web development', 'frontend', 'backend', 'full stack', 'html', 'css',
      'javascript', 'react', 'vite', 'node.js', 'express', 'rest api',
      'api development', 'postgresql', 'mongodb', 'web applications',
      'authentication', 'responsive website'
    ]
  },
  'AI / ML': {
    description: 'Artificial intelligence and machine learning including Python, data science, data analysis, supervised learning, deep learning, neural networks, natural language processing, computer vision, model evaluation, transformers and generative AI.',
    languages: ['python', 'r', 'julia'],
    keywords: [
      'artificial intelligence', 'machine learning', 'deep learning', 'data science',
      'data analysis', 'python', 'numpy', 'pandas', 'scikit-learn', 'pytorch',
      'tensorflow', 'neural networks', 'natural language processing', 'nlp',
      'computer vision', 'opencv', 'transformers', 'hugging face', 'generative ai',
      'llm', 'model training', 'classification', 'regression'
    ]
  }
};

/**
 * Text normalization function
 */
function clean(val) {
  if (val === null || val === undefined) return '';
  return String(val).trim().toLowerCase();
}

/**
 * Word-boundary term matching
 */
function containsTerm(text, term) {
  if (!text || !term) return false;
  const escaped = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(?<![\\w])${escaped}(?![\\w])`, 'i');
  return regex.test(text);
}

/**
 * Robust CSV parser supporting quotes, commas, and multiline values
 */
export function parseCSV(text) {
  const lines = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(field.trim());
      field = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(field.trim());
      if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
        lines.push(row);
      }
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field || row.length > 0) {
    row.push(field.trim());
    if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
      lines.push(row);
    }
  }

  return lines;
}

/**
 * Computes cosine similarity between query tokens and text tokens
 */
function computeSemanticScore(skillsText, trackDesc) {
  const skillsTokens = skillsText.toLowerCase().replace(/[^a-z0-9+#/.\s-]/g, ' ').split(/\s+/).filter(w => w.length > 2);
  const trackTokens = trackDesc.toLowerCase().replace(/[^a-z0-9+#/.\s-]/g, ' ').split(/\s+/).filter(w => w.length > 2);

  if (skillsTokens.length === 0 || trackTokens.length === 0) return 0.0;

  const sFreq = {};
  for (const t of skillsTokens) sFreq[t] = (sFreq[t] || 0) + 1;

  const tFreq = {};
  for (const t of trackTokens) tFreq[t] = (tFreq[t] || 0) + 1;

  let dot = 0;
  let sMag = 0;
  let tMag = 0;

  for (const t in sFreq) {
    sMag += sFreq[t] * sFreq[t];
    if (tFreq[t]) dot += sFreq[t] * tFreq[t];
  }
  for (const t in tFreq) {
    tMag += tFreq[t] * tFreq[t];
  }

  if (sMag === 0 || tMag === 0) return 0.0;
  const similarity = dot / (Math.sqrt(sMag) * Math.sqrt(tMag));
  return Math.min(Math.max(similarity * 100 * 1.5, 0), 100);
}

/**
 * Score and rank candidate rows from parsed CSV
 */
export function scoreCandidates(candidates, domain, topN) {
  const track = TRACKS[domain];
  if (!track) {
    throw new Error(`Unknown domain: ${domain}`);
  }

  const scored = [];

  for (let i = 0; i < candidates.length; i++) {
    const c = candidates[i];
    const skills = clean(c.skills_text || '');
    const matched_keywords = track.keywords.filter(term => containsTerm(skills, term));
    const matched_languages = track.languages.filter(term => containsTerm(skills, term));

    let skills_score = 0.0;
    if (skills) {
      const sem_score = computeSemanticScore(skills, track.description);
      const kw_score = Math.min(100.0, (matched_keywords.length / 3.0) * 100);
      const lang_score = Math.min(100.0, (matched_languages.length / 2.0) * 100);
      skills_score = 0.70 * sem_score + 0.20 * kw_score + 0.10 * lang_score;
    }

    const rawComm = parseFloat(c.communication_rating);
    const commRating = (!isNaN(rawComm) && rawComm >= 1 && rawComm <= 5) ? rawComm : 3.0;
    const commScore = (commRating / 5.0) * 100.0;

    const final_score = WEIGHTS.skills * skills_score + WEIGHTS.communication * commScore;

    scored.push({
      candidate_id: String(c.candidate_id || i + 1),
      candidate_name: c.candidate_name || 'Anonymous',
      phone_number: c.phone_number || 'N/A',
      branch: c.branch || 'N/A',
      domain,
      skills_score: Math.round(skills_score * 100) / 100,
      communication_rating: Math.round(commRating * 10) / 10,
      communication_score: Math.round(commScore * 100) / 100,
      final_score: Math.round(final_score * 100) / 100,
      matched_keywords,
      matched_languages,
      needs_admin_review: true
    });
  }

  scored.sort((a, b) => b.final_score - a.final_score || b.skills_score - a.skills_score);

  const top = scored.slice(0, topN);
  top.forEach((row, idx) => {
    row.rank = idx + 1;
  });

  return {
    candidates: top,
    total_available: scored.length
  };
}

/**
 * Parse candidates from raw CSV string or file
 */
export function parseCandidatesFromCSVString(csvText) {
  const table = parseCSV(csvText);
  if (!table || table.length < 2) return [];

  const headers = table[0].map(h => h.trim());
  
  // Find column indices
  let commIdx = -1;
  let langIdx = -1;
  let techIdx = -1;
  let nameIdx = -1;
  let phoneIdx = -1;
  let branchIdx = -1;

  for (let i = 0; i < headers.length; i++) {
    const col = headers[i].toLowerCase();
    if (commIdx === -1 && (col.includes('communication') || col.includes('comm'))) commIdx = i;
    if (langIdx === -1 && (col.includes('programming language') || (col.includes('language') && col.includes('know')))) langIdx = i;
    if (techIdx === -1 && (col.includes('technical skill') || col.includes('skills'))) techIdx = i;
    if (nameIdx === -1 && col.includes('name') && !col.includes('club')) nameIdx = i;
    if (phoneIdx === -1 && (col.includes('contact') || col.includes('phone') || col.includes('whatsapp') || col.includes('mobile'))) phoneIdx = i;
    if (branchIdx === -1 && (col.includes('branch') || col.includes('department'))) branchIdx = i;
  }

  const candidates = [];
  for (let i = 1; i < table.length; i++) {
    const row = table[i];
    if (!row || row.length === 0 || (row.length === 1 && !row[0])) continue;

    const name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx].trim() : `Candidate ${i}`;
    const phone = phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx].trim() : 'N/A';
    const branch = branchIdx !== -1 && row[branchIdx] ? row[branchIdx].trim() : 'General';
    const lang = langIdx !== -1 && row[langIdx] ? row[langIdx].trim() : '';
    const tech = techIdx !== -1 && row[techIdx] ? row[techIdx].trim() : '';
    const comm = commIdx !== -1 && row[commIdx] ? parseFloat(row[commIdx]) : 3.0;

    candidates.push({
      candidate_id: String(i),
      candidate_name: name,
      phone_number: phone,
      branch,
      communication_rating: isNaN(comm) ? 3.0 : comm,
      skills_text: `${lang} ${tech}`.trim()
    });
  }

  return candidates;
}

/**
 * Load cached rankings from hncc_ranked_cache.json
 */
export function loadCachedRankings() {
  const possiblePaths = [
    path.resolve(__dirname, '../data/hncc_ranked_cache.json'),
    path.resolve(process.cwd(), 'backend/src/data/hncc_ranked_cache.json'),
    path.resolve(process.cwd(), 'src/data/hncc_ranked_cache.json')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        const data = JSON.parse(raw);
        if (data && data.domains) {
          return data;
        }
      } catch (err) {
        console.warn(`[ranker] Error reading cache at ${p}:`, err.message);
      }
    }
  }
  return null;
}

/**
 * Mask name to initials for non-master admins (A. S.)
 */
export function maskCandidateName(name) {
  if (!name || typeof name !== 'string') return 'Candidate';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Candidate';
  return parts.map(p => `${p[0].toUpperCase()}.`).join(' ');
}

/**
 * Hash phone number for non-master admins
 */
export function hashPhoneNumber(phone) {
  if (!phone || phone === 'N/A') return 'N/A';
  const cleanPhone = String(phone).replace(/\D/g, '');
  if (!cleanPhone) return 'N/A';
  const hash = crypto.createHash('sha256').update(cleanPhone).digest('hex');
  return `+91 ${hash.slice(0, 4)}••••${hash.slice(-2)}`;
}
