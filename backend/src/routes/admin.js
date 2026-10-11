import express from 'express';
import { getDb } from '../db/db.js';
import { authenticateToken, requireRole, enforceClubIsolation } from '../middleware/auth.js';

const router = express.Router();

// GET /api/admin/my-club - Fetch assigned club data, stats, social links, announcements, & events
router.get('/my-club', authenticateToken, requireRole('club_admin', 'super_admin'), async (req, res) => {
  try {
    const db = await getDb();

    let clubId = req.user.club_id;
    if (req.user.role === 'super_admin' && req.query.club_id) {
      clubId = parseInt(req.query.club_id);
    }

    if (!clubId) {
      return res.status(400).json({ error: 'No assigned club ID found for this admin account.' });
    }

    const club = await db.get('SELECT * FROM clubs WHERE id = ?', [clubId]);
    if (!club) {
      return res.status(404).json({ error: 'Assigned club not found' });
    }

    // Profile Views Count
    const viewCount = await db.get('SELECT COUNT(*) as count FROM club_views WHERE club_id = ?', [clubId]);
    
    // Applicants Count
    const appCount = await db.get('SELECT COUNT(*) as count FROM induction_applications WHERE club_id = ?', [clubId]);
    
    // Active Events Count
    const eventCount = await db.get('SELECT COUNT(*) as count FROM events WHERE club_id = ?', [clubId]);

    // Members Count
    const memberCount = await db.get('SELECT COUNT(*) as count FROM club_members WHERE club_id = ?', [clubId]);

    // Social Links
    const social_links = await db.all('SELECT * FROM social_links WHERE club_id = ? ORDER BY id ASC', [clubId]);

    // Announcements
    const announcements = await db.all('SELECT * FROM announcements WHERE club_id = ? ORDER BY created_at DESC', [clubId]);

    // Club Events
    const events = await db.all('SELECT * FROM events WHERE club_id = ? ORDER BY event_date DESC', [clubId]);

    res.json({
      club: {
        ...club,
        stats: {
          views: viewCount ? viewCount.count : 0,
          applications: appCount ? appCount.count : 0,
          events: eventCount ? eventCount.count : 0,
          members: memberCount ? memberCount.count : 0
        },
        social_links,
        announcements,
        events
      }
    });
  } catch (err) {
    console.error('Error fetching admin club profile:', err);
    res.status(500).json({ error: 'Failed to load club admin workspace data' });
  }
});

// PUT /api/admin/my-club - Update permitted club profile fields & recruitment status
router.put('/my-club', authenticateToken, requireRole('club_admin', 'super_admin'), async (req, res) => {
  const { short_description, description, website_url, recruitment_open, logo_url } = req.body;

  let clubId = req.user.club_id;
  if (req.user.role === 'super_admin' && req.body.club_id) {
    clubId = parseInt(req.body.club_id);
  }

  if (!clubId) {
    return res.status(400).json({ error: 'No club ID specified' });
  }

  try {
    const db = await getDb();
    const currentClub = await db.get('SELECT logo_url FROM clubs WHERE id = ?', [clubId]);
    await db.run(
      `UPDATE clubs SET 
        short_description = ?, description = ?, website_url = ?, 
        recruitment_open = ?, logo_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        short_description,
        description,
        website_url,
        recruitment_open ? 1 : 0,
        logo_url !== undefined ? logo_url : (currentClub ? currentClub.logo_url : null),
        clubId
      ]
    );

    // Keep induction_forms.is_active in sync with recruitment_open
    if (recruitment_open !== undefined) {
      const activeVal = recruitment_open ? 1 : 0;
      await db.run('UPDATE induction_forms SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE club_id = ?', [activeVal, clubId]);
    }

    await db.run(
      `INSERT INTO audit_logs (user_id, club_id, action, entity_type, entity_id, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, clubId, 'UPDATE_CLUB_PROFILE', 'club', clubId, JSON.stringify({ recruitment_open })]
    );

    res.json({ message: 'Club profile updated successfully' });
  } catch (err) {
    console.error('Error updating club profile:', err);
    res.status(500).json({ error: 'Failed to update club profile' });
  }
});

// PUT /api/admin/induction/toggle-status - Direct 1-click toggle for club admin to open/close induction form
router.put('/induction/toggle-status', authenticateToken, requireRole('club_admin', 'super_admin'), async (req, res) => {
  let clubId = req.user.club_id;
  if (req.user.role === 'super_admin' && req.body.club_id) {
    clubId = parseInt(req.body.club_id);
  }

  if (!clubId) {
    return res.status(400).json({ error: 'No club ID specified.' });
  }

  try {
    const db = await getDb();
    const club = await db.get('SELECT id, name, recruitment_open FROM clubs WHERE id = ?', [clubId]);
    if (!club) {
      return res.status(404).json({ error: 'Club not found.' });
    }

    const { open } = req.body;
    const newStatus = open !== undefined ? (open ? 1 : 0) : (club.recruitment_open === 1 ? 0 : 1);

    await db.run('UPDATE clubs SET recruitment_open = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, clubId]);

    // Keep induction_forms in sync
    let form = await db.get('SELECT id FROM induction_forms WHERE club_id = ? LIMIT 1', [clubId]);
    if (form) {
      await db.run('UPDATE induction_forms SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, form.id]);
    } else if (newStatus === 1) {
      await db.run(
        'INSERT INTO induction_forms (club_id, title, description, is_active) VALUES (?, ?, ?, 1)',
        [clubId, `${club.name} Induction Form 2026`, 'Official induction form', 1]
      );
    }

    await db.run(
      `INSERT INTO audit_logs (user_id, club_id, action, entity_type, entity_id, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, clubId, newStatus === 1 ? 'OPEN_INDUCTION_FORM' : 'CLOSE_INDUCTION_FORM', 'club', clubId, JSON.stringify({ recruitment_open: newStatus })]
    );

    res.json({
      message: newStatus === 1 ? 'Induction form is now OPEN and accepting applications.' : 'Induction form is now CLOSED.',
      recruitment_open: newStatus
    });
  } catch (err) {
    console.error('Error toggling induction status:', err);
    res.status(500).json({ error: 'Failed to update induction status.' });
  }
});

// GET /api/admin/applicants - List applicants for assigned club only (Strict Security Isolation)
router.get('/applicants', authenticateToken, requireRole('club_admin', 'super_admin'), async (req, res) => {
  let clubId = req.user.club_id;
  if (req.user.role === 'super_admin' && req.query.club_id) {
    clubId = parseInt(req.query.club_id);
  }

  if (!clubId) {
    return res.status(400).json({ error: 'No assigned club specified.' });
  }

  const { status, search } = req.query;

  try {
    const db = await getDb();
    let query = `
      SELECT app.*, u.name as student_name, u.email as student_email, f.title as form_title
      FROM induction_applications app
      JOIN users u ON app.student_id = u.id
      JOIN induction_forms f ON app.form_id = f.id
      WHERE app.club_id = ?
    `;
    const params = [clubId];

    if (status && status !== 'All') {
      query += ' AND app.status = ?';
      params.push(status);
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim().toLowerCase()}%`;
      query += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ?)';
      params.push(term, term);
    }

    query += ' ORDER BY app.submitted_at DESC';

    const applicants = await db.all(query, params);

    // Attach Q&A answers to each applicant record
    for (const applicant of applicants) {
      const answers = await db.all(
        `SELECT ans.answer, q.question, q.question_type 
         FROM application_answers ans
         JOIN form_questions q ON ans.question_id = q.id
         WHERE ans.application_id = ?`,
        [applicant.id]
      );
      applicant.answers = answers;
    }

    res.json({
      count: applicants.length,
      applicants
    });
  } catch (err) {
    console.error('Error fetching applicants:', err);
    res.status(500).json({ error: 'Failed to retrieve applicants' });
  }
});

// PUT /api/admin/applicants/:id/status - Update application status (Strict Ownership Guard)
router.put('/applicants/:id/status', authenticateToken, requireRole('club_admin', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['Submitted', 'Under Review', 'Shortlisted', 'Selected', 'Rejected', 'Waitlisted'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const db = await getDb();
    const app = await db.get('SELECT * FROM induction_applications WHERE id = ?', [id]);

    if (!app) {
      return res.status(404).json({ error: 'Application record not found' });
    }

    // Enforce club admin isolation: Cannot touch another club's applicants!
    if (req.user.role === 'club_admin' && app.club_id !== req.user.club_id) {
      return res.status(403).json({ error: 'Forbidden: Security Violation. You can only update status for your assigned club applicants.' });
    }

    await db.run(
      'UPDATE induction_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    // Audit log
    await db.run(
      `INSERT INTO audit_logs (user_id, club_id, action, entity_type, entity_id, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, app.club_id, 'UPDATE_APPLICATION_STATUS', 'induction_application', id, JSON.stringify({ old_status: app.status, new_status: status })]
    );

    res.json({
      message: `Applicant status updated to ${status}`,
      application_id: id,
      new_status: status
    });
  } catch (err) {
    console.error('Error updating application status:', err);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// POST /api/admin/social-links - Add official social link
router.post('/social-links', authenticateToken, requireRole('club_admin', 'super_admin'), async (req, res) => {
  const { platform, url } = req.body;
  const clubId = req.user.role === 'super_admin' && req.body.club_id ? parseInt(req.body.club_id) : req.user.club_id;

  if (!platform || !url) {
    return res.status(400).json({ error: 'Platform and URL are required' });
  }

  try {
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO social_links (club_id, platform, url, is_verified) VALUES (?, ?, ?, 1)',
      [clubId, platform.trim(), url.trim()]
    );

    res.status(201).json({
      message: 'Social link added successfully',
      link_id: result.lastID
    });
  } catch (err) {
    console.error('Error adding social link:', err);
    res.status(500).json({ error: 'Failed to add social link' });
  }
});

// DELETE /api/admin/social-links/:id - Delete social link
router.delete('/social-links/:id', authenticateToken, requireRole('club_admin', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  const clubId = req.user.club_id;

  try {
    const db = await getDb();
    const link = await db.get('SELECT * FROM social_links WHERE id = ?', [id]);

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    if (req.user.role === 'club_admin' && link.club_id !== clubId) {
      return res.status(403).json({ error: 'Forbidden: You can only remove links for your assigned club' });
    }

    await db.run('DELETE FROM social_links WHERE id = ?', [id]);
    res.json({ message: 'Social link removed successfully' });
  } catch (err) {
    console.error('Error deleting social link:', err);
    res.status(500).json({ error: 'Failed to delete social link' });
  }
});

// POST /api/admin/announcements - Create announcement
router.post('/announcements', authenticateToken, requireRole('club_admin', 'super_admin'), async (req, res) => {
  const { title, content, is_pinned } = req.body;
  const clubId = req.user.role === 'super_admin' && req.body.club_id ? parseInt(req.body.club_id) : req.user.club_id;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO announcements (club_id, title, content, is_pinned) VALUES (?, ?, ?, ?)',
      [clubId, title.trim(), content.trim(), is_pinned ? 1 : 0]
    );

    res.status(201).json({
      message: 'Announcement published successfully',
      announcement_id: result.lastID
    });
  } catch (err) {
    console.error('Error creating announcement:', err);
    res.status(500).json({ error: 'Failed to publish announcement' });
  }
});

// DELETE /api/admin/announcements/:id - Delete announcement
router.delete('/announcements/:id', authenticateToken, requireRole('club_admin', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  const clubId = req.user.club_id;

  try {
    const db = await getDb();
    const ann = await db.get('SELECT * FROM announcements WHERE id = ?', [id]);

    if (!ann) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    if (req.user.role === 'club_admin' && ann.club_id !== clubId) {
      return res.status(403).json({ error: 'Forbidden: You can only delete announcements for your assigned club' });
    }

    await db.run('DELETE FROM announcements WHERE id = ?', [id]);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    console.error('Error deleting announcement:', err);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

// ==========================================
// CLUB MEMBERS MANAGEMENT
// ==========================================

// GET /api/admin/members - List all members of assigned club
router.get('/members', authenticateToken, requireRole('club_admin', 'super_admin'), async (req, res) => {
  let clubId = req.user.club_id;
  if (req.user.role === 'super_admin' && req.query.club_id) {
    clubId = parseInt(req.query.club_id);
  }

  if (!clubId) {
    return res.status(400).json({ error: 'No club ID specified' });
  }

  const { search, status } = req.query;

  try {
    const db = await getDb();
    let query = 'SELECT * FROM club_members WHERE club_id = ?';
    const params = [clubId];

    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim().toLowerCase()}%`;
      query += ' AND (LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(position) LIKE ? OR LOWER(department) LIKE ?)';
      params.push(term, term, term, term, term);
    }

    query += ` ORDER BY 
      CASE 
        WHEN LOWER(position) LIKE '%president%' THEN 1 
        WHEN LOWER(position) LIKE '%vice%' THEN 2 
        WHEN LOWER(position) LIKE '%lead%' THEN 3 
        WHEN LOWER(position) LIKE '%coordinator%' THEN 4 
        ELSE 5 
      END, id ASC`;

    const members = await db.all(query, params);

    res.json({
      count: members.length,
      members
    });
  } catch (err) {
    console.error('Error fetching club members:', err);
    res.status(500).json({ error: 'Failed to retrieve club members' });
  }
});

// POST /api/admin/members - Add new member to assigned club
router.post('/members', authenticateToken, requireRole('club_admin', 'super_admin'), async (req, res) => {
  const {
    name, email, phone, position, department,
    batch_year, joined_date, avatar_url, status,
    bio, linkedin_url, github_url
  } = req.body;

  let clubId = req.user.club_id;
  if (req.user.role === 'super_admin' && req.body.club_id) {
    clubId = parseInt(req.body.club_id);
  }

  if (!clubId) {
    return res.status(400).json({ error: 'No club ID specified' });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Member full name is required' });
  }

  try {
    const db = await getDb();
    const result = await db.run(`
      INSERT INTO club_members (
        club_id, name, email, phone, position, department,
        batch_year, joined_date, avatar_url, status,
        bio, linkedin_url, github_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      clubId,
      name.trim(),
      email ? email.trim() : null,
      phone ? phone.trim() : null,
      position ? position.trim() : 'Core Member',
      department ? department.trim() : null,
      batch_year ? batch_year.trim() : null,
      joined_date ? joined_date.trim() : new Date().toISOString().split('T')[0],
      avatar_url ? avatar_url.trim() : null,
      status || 'Active',
      bio ? bio.trim() : null,
      linkedin_url ? linkedin_url.trim() : null,
      github_url ? github_url.trim() : null
    ]);

    const memberId = result.lastID;

    await db.run(
      'INSERT INTO audit_logs (user_id, club_id, action, entity_type, entity_id, metadata) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, clubId, 'ADD_CLUB_MEMBER', 'member', memberId, JSON.stringify({ name, position })]
    );

    res.status(201).json({
      message: 'Club member added successfully',
      member_id: memberId
    });
  } catch (err) {
    console.error('Error adding club member:', err);
    res.status(500).json({ error: 'Failed to add club member' });
  }
});

// PUT /api/admin/members/:id - Update member details
router.put('/members/:id', authenticateToken, requireRole('club_admin', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  const {
    name, email, phone, position, department,
    batch_year, joined_date, avatar_url, status,
    bio, linkedin_url, github_url
  } = req.body;

  let clubId = req.user.club_id;
  if (req.user.role === 'super_admin' && req.body.club_id) {
    clubId = parseInt(req.body.club_id);
  }

  try {
    const db = await getDb();
    const existing = await db.get('SELECT * FROM club_members WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (req.user.role === 'club_admin' && existing.club_id !== clubId) {
      return res.status(403).json({ error: 'Forbidden: You can only edit members of your assigned club' });
    }

    await db.run(`
      UPDATE club_members SET
        name = ?, email = ?, phone = ?, position = ?, department = ?,
        batch_year = ?, joined_date = ?, avatar_url = ?, status = ?,
        bio = ?, linkedin_url = ?, github_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name !== undefined ? name.trim() : existing.name,
      email !== undefined ? (email ? email.trim() : null) : existing.email,
      phone !== undefined ? (phone ? phone.trim() : null) : existing.phone,
      position !== undefined ? (position ? position.trim() : 'Core Member') : existing.position,
      department !== undefined ? (department ? department.trim() : null) : existing.department,
      batch_year !== undefined ? (batch_year ? batch_year.trim() : null) : existing.batch_year,
      joined_date !== undefined ? (joined_date ? joined_date.trim() : null) : existing.joined_date,
      avatar_url !== undefined ? (avatar_url ? avatar_url.trim() : null) : existing.avatar_url,
      status !== undefined ? status : existing.status,
      bio !== undefined ? (bio ? bio.trim() : null) : existing.bio,
      linkedin_url !== undefined ? (linkedin_url ? linkedin_url.trim() : null) : existing.linkedin_url,
      github_url !== undefined ? (github_url ? github_url.trim() : null) : existing.github_url,
      id
    ]);

    await db.run(
      'INSERT INTO audit_logs (user_id, club_id, action, entity_type, entity_id, metadata) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, existing.club_id, 'UPDATE_CLUB_MEMBER', 'member', id, JSON.stringify({ name, position, status })]
    );

    res.json({ message: 'Club member updated successfully' });
  } catch (err) {
    console.error('Error updating club member:', err);
    res.status(500).json({ error: 'Failed to update club member' });
  }
});

// DELETE /api/admin/members/:id - Delete member
router.delete('/members/:id', authenticateToken, requireRole('club_admin', 'super_admin'), async (req, res) => {
  const { id } = req.params;
  const clubId = req.user.club_id;

  try {
    const db = await getDb();
    const existing = await db.get('SELECT * FROM club_members WHERE id = ?', [id]);

    if (!existing) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (req.user.role === 'club_admin' && existing.club_id !== clubId) {
      return res.status(403).json({ error: 'Forbidden: You can only remove members from your assigned club' });
    }

    await db.run('DELETE FROM club_members WHERE id = ?', [id]);

    await db.run(
      'INSERT INTO audit_logs (user_id, club_id, action, entity_type, entity_id, metadata) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, existing.club_id, 'REMOVE_CLUB_MEMBER', 'member', id, JSON.stringify({ name: existing.name })]
    );

    res.json({ message: 'Club member removed successfully' });
  } catch (err) {
    console.error('Error deleting club member:', err);
    res.status(500).json({ error: 'Failed to delete club member' });
  }
});

export default router;
