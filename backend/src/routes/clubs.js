import express from 'express';
import { getDb } from '../db/db.js';

const router = express.Router();

// GET /api/clubs - List all clubs with search & category filters
router.get('/', async (req, res) => {
  const { search, category, recruitment_open } = req.query;

  try {
    const db = await getDb();
    let query = 'SELECT * FROM clubs WHERE verified = 1';
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category LIKE ?';
      params.push(`%${category.trim()}%`);
    }

    if (recruitment_open === '1' || recruitment_open === 'true') {
      query += ' AND recruitment_open = 1';
    }

    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim().toLowerCase()}%`;
      query += ` AND (
        LOWER(name) LIKE ? OR 
        LOWER(category) LIKE ? OR 
        LOWER(short_description) LIKE ? OR 
        LOWER(ml_keywords) LIKE ? OR 
        LOWER(events_summary) LIKE ?
      )`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY id ASC';

    const clubs = await db.all(query, params);

    // Fetch verified social links for each club
    for (const club of clubs) {
      const socialLinks = await db.all(
        'SELECT platform, url FROM social_links WHERE club_id = ? AND is_verified = 1',
        [club.id]
      );
      club.social_links = socialLinks;
    }

    res.json({
      count: clubs.length,
      clubs
    });
  } catch (err) {
    console.error('Error fetching clubs:', err);
    res.status(500).json({ error: 'Failed to retrieve clubs directory' });
  }
});

// GET /api/clubs/categories - Return all available club categories
router.get('/categories', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT DISTINCT category FROM clubs WHERE verified = 1 ORDER BY category ASC');
    const categories = ['All', ...rows.map(r => r.category)];
    res.json({ categories });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

// GET /api/clubs/:slug - Get single club detail by slug or code
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const db = await getDb();
    const querySlug = slug.toLowerCase();
    const effectiveSlug = querySlug === 'start-up-cell' ? 'iic' : querySlug;

    const club = await db.get(
      'SELECT * FROM clubs WHERE slug = ? OR LOWER(club_code) = ? OR id = ?',
      [effectiveSlug, querySlug, parseInt(slug) || 0]
    );

    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    // Record club profile view counter
    await db.run('INSERT INTO club_views (club_id) VALUES (?)', [club.id]);

    // Fetch social links
    const social_links = await db.all(
      'SELECT platform, url FROM social_links WHERE club_id = ? AND is_verified = 1',
      [club.id]
    );

    // Fetch events conducted by this club
    const events = await db.all(
      'SELECT * FROM events WHERE club_id = ? ORDER BY event_date DESC',
      [club.id]
    );

    // Fetch similar clubs (in same category or matching keywords)
    const categoryPrefix = club.category.split('–')[0].trim();
    const similarClubs = await db.all(
      'SELECT id, name, slug, category, short_description, logo_url, recruitment_open FROM clubs WHERE category LIKE ? AND id != ? LIMIT 3',
      [`%${categoryPrefix}%`, club.id]
    );

    // Fetch club members
    const members = await db.all(
      'SELECT id, name, position, department, batch_year, joined_date, avatar_url, status, bio, linkedin_url, github_url FROM club_members WHERE club_id = ? ORDER BY id ASC',
      [club.id]
    );

    res.json({
      club: {
        ...club,
        social_links,
        events,
        members,
        similar_clubs: similarClubs
      }
    });
  } catch (err) {
    console.error('Error fetching club detail:', err);
    res.status(500).json({ error: 'Failed to retrieve club details' });
  }
});

// GET /api/clubs/:slug/members - Public endpoint to retrieve all members of a club
router.get('/:slug/members', async (req, res) => {
  const { slug } = req.params;

  try {
    const db = await getDb();
    const querySlug = slug.toLowerCase();
    const effectiveSlug = querySlug === 'start-up-cell' ? 'iic' : querySlug;

    const club = await db.get(
      'SELECT id, name, slug, club_code FROM clubs WHERE slug = ? OR LOWER(club_code) = ? OR id = ?',
      [effectiveSlug, querySlug, parseInt(slug) || 0]
    );

    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    const members = await db.all(
      'SELECT id, name, position, department, batch_year, joined_date, avatar_url, status, bio, linkedin_url, github_url FROM club_members WHERE club_id = ? ORDER BY id ASC',
      [club.id]
    );

    res.json({
      club: { id: club.id, name: club.name, slug: club.slug },
      count: members.length,
      members
    });
  } catch (err) {
    console.error('Error fetching club members:', err);
    res.status(500).json({ error: 'Failed to retrieve club members' });
  }
});

export default router;
