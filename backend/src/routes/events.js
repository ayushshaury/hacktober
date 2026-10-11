import express from 'express';
import { getDb } from '../db/db.js';
import { authenticateToken, requireRole, enforceClubIsolation } from '../middleware/auth.js';

const router = express.Router();

// GET /api/events - List events with optional filters (search, status, category, club_id)
router.get('/', async (req, res) => {
  const { search, status, club_id } = req.query;

  try {
    const db = await getDb();
    let query = `
      SELECT e.*, c.name as club_name, c.slug as club_slug, c.category as club_category, c.logo_url as club_logo
      FROM events e
      JOIN clubs c ON e.club_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (club_id) {
      query += ' AND e.club_id = ?';
      params.push(parseInt(club_id));
    }

    if (status && status !== 'All') {
      query += ' AND e.status = ?';
      params.push(status);
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim().toLowerCase()}%`;
      query += ' AND (LOWER(e.title) LIKE ? OR LOWER(e.description) LIKE ? OR LOWER(e.venue) LIKE ? OR LOWER(c.name) LIKE ?)';
      params.push(term, term, term, term);
    }

    query += ' ORDER BY e.event_date ASC';

    const events = await db.all(query, params);
    res.json({ count: events.length, events });
  } catch (err) {
    console.error('Error listing events:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/:id - Get single event details
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDb();
    const event = await db.get(
      `SELECT e.*, c.name as club_name, c.slug as club_slug, c.category as club_category, c.website_url as club_website, c.logo_url as club_logo
       FROM events e
       JOIN clubs c ON e.club_id = c.id
       WHERE e.id = ?`,
      [id]
    );

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if current user is registered (if auth token provided)
    let is_registered = false;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        if (token) {
          const jwt = (await import('jsonwebtoken')).default;
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
          const reg = await db.get('SELECT id FROM event_registrations WHERE event_id = ? AND student_id = ?', [id, decoded.id]);
          if (reg) is_registered = true;
        }
      } catch (e) {
        // Token invalid, ignore registration status
      }
    }

    res.json({ event: { ...event, is_registered } });
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ error: 'Failed to fetch event detail' });
  }
});

// POST /api/events - Create new event (Club Admin / Super Admin)
router.post('/', authenticateToken, requireRole('club_admin', 'super_admin'), async (req, res) => {
  const { title, description, event_date, start_time, end_time, venue, registration_url, image_url, status, club_id } = req.body;

  if (!title || !event_date) {
    return res.status(400).json({ error: 'Title and event date are required' });
  }

  let targetClubId = club_id;
  if (req.user.role === 'club_admin') {
    targetClubId = req.user.club_id;
  }

  if (!targetClubId) {
    return res.status(400).json({ error: 'Assigned club ID is required' });
  }

  try {
    const db = await getDb();
    const result = await db.run(
      `INSERT INTO events 
        (club_id, title, description, event_date, start_time, end_time, venue, registration_url, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        targetClubId,
        title.trim(),
        description || '',
        event_date,
        start_time || '',
        end_time || '',
        venue || 'BIT Sindri Campus',
        registration_url || '',
        image_url || '',
        status || 'Published'
      ]
    );

    // Record audit log
    await db.run(
      `INSERT INTO audit_logs (user_id, club_id, action, entity_type, entity_id, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, targetClubId, 'CREATE_EVENT', 'event', result.lastID, JSON.stringify({ title })]
    );

    res.status(201).json({
      message: 'Event created successfully',
      event_id: result.lastID
    });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:id - Edit existing event
router.put('/:id', authenticateToken, requireRole('club_admin', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  const { title, description, event_date, start_time, end_time, venue, registration_url, image_url, status } = req.body;

  try {
    const db = await getDb();
    const event = await db.get('SELECT * FROM events WHERE id = ?', [id]);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify club admin ownership
    if (req.user.role === 'club_admin' && req.user.club_id !== event.club_id) {
      return res.status(403).json({ error: 'Forbidden: You can only edit events for your assigned club' });
    }

    await db.run(
      `UPDATE events SET 
        title = ?, description = ?, event_date = ?, start_time = ?, end_time = ?, 
        venue = ?, registration_url = ?, image_url = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title || event.title,
        description !== undefined ? description : event.description,
        event_date || event.event_date,
        start_time !== undefined ? start_time : event.start_time,
        end_time !== undefined ? end_time : event.end_time,
        venue || event.venue,
        registration_url !== undefined ? registration_url : event.registration_url,
        image_url !== undefined ? image_url : event.image_url,
        status || event.status,
        id
      ]
    );

    res.json({ message: 'Event updated successfully' });
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', authenticateToken, requireRole('club_admin', 'super_admin'), async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDb();
    const event = await db.get('SELECT * FROM events WHERE id = ?', [id]);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (req.user.role === 'club_admin' && req.user.club_id !== event.club_id) {
      return res.status(403).json({ error: 'Forbidden: You can only delete events for your assigned club' });
    }

    await db.run('DELETE FROM events WHERE id = ?', [id]);
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// POST /api/events/:id/register - Student registration for event
router.post('/:id/register', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDb();
    const event = await db.get('SELECT * FROM events WHERE id = ?', [id]);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const existing = await db.get(
      'SELECT id FROM event_registrations WHERE event_id = ? AND student_id = ?',
      [id, req.user.id]
    );

    if (existing) {
      return res.status(400).json({ error: 'You are already registered for this event' });
    }

    await db.run(
      'INSERT INTO event_registrations (event_id, student_id) VALUES (?, ?)',
      [id, req.user.id]
    );

    res.status(201).json({ message: 'Registered for event successfully!' });
  } catch (err) {
    console.error('Event registration error:', err);
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

export default router;
