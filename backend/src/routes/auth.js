import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getDb } from '../db/db.js';
import { authenticateToken, requireRole, enforceClubIsolation, resolveClubId } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// POST /api/auth/register - Register a new student account
router.post('/register', async (req, res) => {
  const { email, password, department, roll_number, batch_year, phone } = req.body;
  const name = req.body.name || req.body.full_name;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Full name is required' });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    const db = await getDb();
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(
      `INSERT INTO users (name, email, password_hash, role, department, roll_number, batch_year, phone)
       VALUES (?, ?, ?, 'student', ?, ?, ?, ?)`,
      [
        name.trim(),
        normalizedEmail,
        hashedPassword,
        department ? department.trim() : null,
        roll_number ? roll_number.trim() : null,
        batch_year ? batch_year.trim() : null,
        phone ? phone.trim() : null
      ]
    );

    const user = await db.get(
      'SELECT id, name, email, role, phone, avatar_url, department, roll_number, batch_year, bio, linkedin_url, github_url, created_at FROM users WHERE email = ?',
      [normalizedEmail]
    );

    const token = jwt.sign({ id: user.id, role: 'student' }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Student account registered successfully',
      token,
      user: {
        ...user,
        club_id: null,
        club_name: null,
        club_slug: null,
        clubs: []
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register student account' });
  }
});

// Login (club admins & students)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    let clubs = [];
    let club_id = null;
    let club_name = null;
    let club_slug = null;

    if (user.role === 'club_admin' || user.role === 'super_admin') {
      clubs = await db.all(
        `SELECT ca.club_id, c.name as club_name, c.slug as club_slug
         FROM club_admins ca
         LEFT JOIN clubs c ON ca.club_id = c.id
         WHERE ca.user_id = ?
         ORDER BY ca.id ASC`,
        [user.id]
      );

      club_id = clubs[0] ? clubs[0].club_id : null;
      club_name = clubs[0] ? clubs[0].club_name : null;
      club_slug = clubs[0] ? clubs[0].club_slug : null;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar_url: user.avatar_url,
        department: user.department,
        roll_number: user.roll_number,
        batch_year: user.batch_year,
        bio: user.bio,
        linkedin_url: user.linkedin_url,
        github_url: user.github_url,
        created_at: user.created_at,
        club_id,
        club_name,
        club_slug,
        clubs
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to authenticate user' });
  }
});

// Get Current Authenticated Profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    let clubInfo = null;

    if (req.user.club_id) {
      clubInfo = await db.get('SELECT id, name, slug, club_code, logo_url FROM clubs WHERE id = ?', [req.user.club_id]);
    }

    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        avatar_url: req.user.avatar_url,
        department: req.user.department,
        roll_number: req.user.roll_number,
        batch_year: req.user.batch_year,
        bio: req.user.bio,
        linkedin_url: req.user.linkedin_url,
        github_url: req.user.github_url,
        created_at: req.user.created_at,
        club_id: req.user.club_id,
        club_name: req.user.club_name,
        club_slug: req.user.club_slug,
        club: clubInfo,
        clubs: req.user.clubs
      }
    });
  } catch (err) {
    console.error('Fetch me error:', err);
    res.status(500).json({ error: 'Failed to retrieve user details' });
  }
});

// GET /api/auth/profile - Extended Profile Workspace with Memberships & Applications
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();

    // 1. Fetch user's registered club memberships
    const memberships = await db.all(
      `SELECT cm.id, cm.position, cm.department, cm.batch_year, cm.joined_date, cm.status,
              c.id as club_id, c.name as club_name, c.slug as club_slug, c.logo_url as club_logo, c.category as club_category
       FROM club_members cm
       JOIN clubs c ON cm.club_id = c.id
       WHERE LOWER(cm.email) = LOWER(?) OR cm.user_id = ?
       ORDER BY cm.joined_date DESC`,
      [req.user.email, req.user.id]
    );

    // 2. Fetch induction applications if student
    const applications = await db.all(
      `SELECT a.id, a.status, a.submitted_at,
              c.name as club_name, c.slug as club_slug, c.logo_url as club_logo
       FROM induction_applications a
       JOIN clubs c ON a.club_id = c.id
       WHERE a.student_id = ?
       ORDER BY a.submitted_at DESC`,
      [req.user.id]
    );

    let assignedClub = null;
    if (req.user.club_id) {
      assignedClub = await db.get(
        'SELECT id, name, slug, club_code, logo_url, category FROM clubs WHERE id = ?',
        [req.user.club_id]
      );
    }

    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        avatar_url: req.user.avatar_url,
        department: req.user.department,
        roll_number: req.user.roll_number,
        batch_year: req.user.batch_year,
        bio: req.user.bio,
        linkedin_url: req.user.linkedin_url,
        github_url: req.user.github_url,
        created_at: req.user.created_at,
        club_id: req.user.club_id,
        club_name: req.user.club_name,
        club_slug: req.user.club_slug
      },
      assigned_club: assignedClub,
      assigned_clubs: req.user.clubs,
      club_memberships: memberships || [],
      applications: applications || []
    });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ error: 'Failed to retrieve profile details' });
  }
});

// PUT /api/auth/profile - Update user profile information
router.put('/profile', authenticateToken, async (req, res) => {
  const { 
    name, phone, avatar_url, department, 
    roll_number, batch_year, bio, linkedin_url, github_url 
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Full name is required' });
  }

  try {
    const db = await getDb();

    await db.run(
      `UPDATE users SET
         name = ?, phone = ?, avatar_url = ?, department = ?,
         roll_number = ?, batch_year = ?, bio = ?, linkedin_url = ?,
         github_url = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name.trim(),
        phone ? phone.trim() : null,
        avatar_url ? avatar_url.trim() : null,
        department ? department.trim() : null,
        roll_number ? roll_number.trim() : null,
        batch_year ? batch_year.trim() : null,
        bio ? bio.trim() : null,
        linkedin_url ? linkedin_url.trim() : null,
        github_url ? github_url.trim() : null,
        req.user.id
      ]
    );

    // Sync avatar & contact info in club_members if user is a registered member
    await db.run(
      `UPDATE club_members SET
         name = ?, phone = COALESCE(?, phone), avatar_url = COALESCE(?, avatar_url)
       WHERE user_id = ? OR LOWER(email) = LOWER(?)`,
      [name.trim(), phone ? phone.trim() : null, avatar_url ? avatar_url.trim() : null, req.user.id, req.user.email]
    );

    const updatedUser = await db.get(
      'SELECT id, name, email, role, phone, avatar_url, department, roll_number, batch_year, bio, linkedin_url, github_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        ...updatedUser,
        club_id: req.user.club_id,
        club_name: req.user.club_name,
        club_slug: req.user.club_slug
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PUT /api/auth/change-password - Change account password
router.put('/change-password', authenticateToken, async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (new_password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  try {
    const db = await getDb();
    const userRecord = await db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);

    if (!userRecord) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const isMatch = await bcrypt.compare(current_password, userRecord.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password does not match' });
    }

    const newHashed = await bcrypt.hash(new_password, 10);
    await db.run(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newHashed, req.user.id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Security Test Endpoint: Verify Club Data Isolation Enforcement
router.get('/test-club-access/:clubId', authenticateToken, requireRole('club_admin'), enforceClubIsolation('clubId'), async (req, res) => {
  res.json({
    message: 'Access granted. Server-side isolation check passed.',
    user: {
      id: req.user.id,
      role: req.user.role,
      assigned_club_id: req.user.club_id
    },
    target_club_id: parseInt(req.params.clubId)
  });
});

export default router;
