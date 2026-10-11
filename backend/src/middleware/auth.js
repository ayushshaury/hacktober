import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getDb } from '../db/db.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Authenticate JWT Token
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await getDb();
    const user = await db.get(
      'SELECT id, name, email, role, phone, avatar_url, department, roll_number, batch_year, bio, linkedin_url, github_url, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({ error: 'User account not found or deactivated.' });
    }

    // Resolve ALL assigned clubs for this admin
    const clubs = await db.all(
      `SELECT ca.club_id, c.name as club_name, c.slug as club_slug
       FROM club_admins ca
       LEFT JOIN clubs c ON ca.club_id = c.id
       WHERE ca.user_id = ?
       ORDER BY ca.id ASC`,
      [user.id]
    );

    user.clubs = clubs;
    user.club_ids = clubs.map((c) => c.club_id);
    user.club_id = clubs[0] ? clubs[0].club_id : null;
    user.club_name = clubs[0] ? clubs[0].club_name : null;
    user.club_slug = clubs[0] ? clubs[0].club_slug : null;

    req.user = user;
    next();
  } catch (err) {
    console.error('authenticateToken error:', err);
    return res.status(403).json({ error: 'Invalid or expired session token.' });
  }
}

// Strict Role Check Middleware (only 'club_admin' exists now)
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions.' });
    }
    next();
  };
}

// Resolve which club the admin is acting on (must be one of their assigned clubs)
export function resolveClubId(req) {
  const allowed = req.user?.club_ids || [];
  if (!allowed.length) return null;

  const raw = req.query?.club_id ?? req.body?.club_id;
  const id = raw !== undefined && raw !== null && raw !== '' ? parseInt(raw) : null;

  if (!id) return allowed[0];
  return allowed.includes(id) ? id : null;
}

// Mandatory Server-Side Club Data Isolation Guard
export function enforceClubIsolation(paramName = 'clubId') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const allowed = req.user.club_ids || [];
    if (!allowed.length) {
      return res.status(403).json({ error: 'Forbidden: No club assigned to your admin account.' });
    }

    const rawParam = req.params[paramName] || req.body[paramName] || req.query[paramName];
    const targetClubId = parseInt(rawParam);

    if (targetClubId && !allowed.includes(targetClubId)) {
      return res.status(403).json({
        error: 'Forbidden: Security Violation. You can only view and manage data for your assigned clubs.'
      });
    }

    return next();
  };
}
