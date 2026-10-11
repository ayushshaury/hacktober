import express from 'express';
import { getDb } from '../db/db.js';

const router = express.Router();

/**
 * Text normalization function matching ML specification
 */
function normalizeText(text) {
  if (!text) return '';
  let str = String(text).toLowerCase();
  str = str.replace(/\bhackathons\b/g, 'hackathon');
  str = str.replace(/\bcontests\b/g, 'contest');
  str = str.replace(/\bworkshops\b/g, 'workshop');
  str = str.replace(/\bprojects\b/g, 'project');
  str = str.replace(/[^a-z0-9+#/.\s-]/g, ' ');
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Compute keyword match score (0.0 to 1.0) and extract matched keywords
 */
function computeKeywordMatch(query, mlKeywordsStr) {
  const normQuery = normalizeText(query);
  const queryWords = new Set(normQuery.split(' ').filter(Boolean));

  if (!mlKeywordsStr) return { score: 0.0, matched: [] };

  const keywordList = mlKeywordsStr
    .split(',')
    .map(k => normalizeText(k))
    .filter(Boolean);

  const matchedKeywords = [];

  for (const keyword of keywordList) {
    if (keyword.includes(' ')) {
      // Multi-word phrase check
      if (normQuery.includes(keyword)) {
        matchedKeywords.push(keyword);
      }
    } else {
      // Single word check
      if (queryWords.has(keyword)) {
        matchedKeywords.push(keyword);
      }
    }
  }

  // Deduplicate matched keywords
  const uniqueMatched = Array.from(new Set(matchedKeywords));
  const score = Math.min(uniqueMatched.length / 4.0, 1.0);

  return { score, matched: uniqueMatched };
}

/**
 * Calculate term-frequency vector cosine similarity between query and club text
 */
function computeSemanticSimilarity(queryNorm, clubTextNorm) {
  const queryTokens = queryNorm.split(' ').filter(w => w.length > 2);
  const clubTokens = clubTextNorm.split(' ').filter(w => w.length > 2);

  if (queryTokens.length === 0 || clubTokens.length === 0) return 0.0;

  // Build term frequency maps
  const qFreq = {};
  for (const token of queryTokens) {
    qFreq[token] = (qFreq[token] || 0) + 1;
  }

  const cFreq = {};
  for (const token of clubTokens) {
    cFreq[token] = (cFreq[token] || 0) + 1;
  }

  // Calculate dot product and vector lengths
  let dotProduct = 0;
  let qMagSq = 0;
  let cMagSq = 0;

  for (const token in qFreq) {
    qMagSq += qFreq[token] * qFreq[token];
    if (cFreq[token]) {
      dotProduct += qFreq[token] * cFreq[token];
    }
  }

  for (const token in cFreq) {
    cMagSq += cFreq[token] * cFreq[token];
  }

  if (qMagSq === 0 || cMagSq === 0) return 0.0;

  return dotProduct / (Math.sqrt(qMagSq) * Math.sqrt(cMagSq));
}

/**
 * POST /api/recommendations
 * AI/ML Club Recommendation Endpoint (BGE / Hybrid model algorithm)
 */
router.post('/', async (req, res) => {
  try {
    const { query, max_recommendations = 3 } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Search query is required for recommendations.' });
    }

    const normQuery = normalizeText(query);
    const db = await getDb();
    const clubs = await db.all('SELECT * FROM clubs ORDER BY name ASC');

    const scoredClubs = clubs.map(club => {
      // 1. Keyword Score
      const { score: keywordScore, matched: matchedKeywords } = computeKeywordMatch(normQuery, club.ml_keywords);

      // 2. Semantic Text construct
      const clubFullText = `${club.name} ${club.category} ${club.short_description || ''} ${club.description || ''} ${club.events_summary || ''} ${club.ml_keywords || ''}`;
      const normClubText = normalizeText(clubFullText);
      const semanticScore = computeSemanticSimilarity(normQuery, normClubText);

      // 3. Hybrid Score calculation (60% semantic similarity, 40% keyword match)
      const finalScore = (0.60 * semanticScore) + (0.40 * keywordScore);

      // Extract match highlights for UI explanation
      const matchReasons = [];
      if (matchedKeywords.length > 0) {
        matchedKeywords.forEach(k => matchReasons.push(k.charAt(0).toUpperCase() + k.slice(1)));
      } else {
        // Fallback domain tags from category / short description
        if (club.category) matchReasons.push(club.category.split('–')[1]?.trim() || club.category);
      }

      return {
        ...club,
        semanticScore: parseFloat(semanticScore.toFixed(4)),
        keywordScore: parseFloat(keywordScore.toFixed(4)),
        finalScore: parseFloat(finalScore.toFixed(4)),
        matchPercentage: Math.round(Math.min(finalScore * 100 * 1.4 + 40, 98)), // Scaled match percentage for UI presentation
        matchReasons: matchReasons.slice(0, 4)
      };
    });

    // Sort descending by final score
    scoredClubs.sort((a, b) => b.finalScore - a.finalScore);

    const topScore = scoredClubs[0]?.finalScore || 0;
    const MIN_SCORE = 0.15;
    const RELATIVE_THRESHOLD = 0.55;

    // Filter relevant clubs
    let recommendations = scoredClubs.filter(club => 
      club.finalScore >= MIN_SCORE && club.finalScore >= (topScore * RELATIVE_THRESHOLD)
    );

    // Limit to max recommendations (default 3)
    if (recommendations.length > max_recommendations) {
      recommendations = recommendations.slice(0, max_recommendations);
    }

    // Fallback: If no club passes threshold, return top 1 best match
    if (recommendations.length === 0 && scoredClubs.length > 0) {
      recommendations = [scoredClubs[0]];
    }

    res.json({
      query,
      count: recommendations.length,
      recommendations
    });
  } catch (err) {
    console.error('Error computing club recommendations:', err);
    res.status(500).json({ error: 'Failed to compute recommendations.' });
  }
});

/**
 * GET /api/recommendations/similar/:slug
 * Compute top 3 similar clubs for a given club (Section 20 of Spec)
 */
router.get('/similar/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const db = await getDb();
    const targetClub = await db.get('SELECT * FROM clubs WHERE slug = ?', [slug]);

    if (!targetClub) {
      return res.status(404).json({ error: 'Club not found' });
    }

    const allClubs = await db.all('SELECT * FROM clubs WHERE id != ?', [targetClub.id]);
    const targetFullText = normalizeText(
      `${targetClub.name} ${targetClub.category} ${targetClub.short_description} ${targetClub.ml_keywords}`
    );

    const scoredClubs = allClubs.map(club => {
      const clubFullText = normalizeText(
        `${club.name} ${club.category} ${club.short_description} ${club.ml_keywords}`
      );
      const similarity = computeSemanticSimilarity(targetFullText, clubFullText);
      return {
        ...club,
        similarityScore: parseFloat(similarity.toFixed(4))
      };
    });

    scoredClubs.sort((a, b) => b.similarityScore - a.similarityScore);
    const similarClubs = scoredClubs.slice(0, 3);

    res.json({ similarClubs });
  } catch (err) {
    console.error('Error fetching similar clubs:', err);
    res.status(500).json({ error: 'Failed to compute similar clubs.' });
  }
});

export default router;
