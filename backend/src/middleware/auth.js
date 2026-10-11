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

    // Resolve assigned club for Club Admins
    if (user.role === 'club_admin') {
      const adminRecord = await db.get(
        `SELECT ca.club_id, c.name as club_name, c.slug as club_slug 
         FROM club_admins ca 
         LEFT JOIN clubs c ON ca.club_id = c.id 
         WHERE ca.user_id = ?`,
        [user.id]
      );
      user.club_id = adminRecord ? adminRecord.club_id : null;
      user.club_name = adminRecord ? adminRecord.club_name : null;
      user.club_slug = adminRecord ? adminRecord.club_slug : null;
    } else {
      user.club_id = null;
      user.club_name = null;
      user.club_slug = null;
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('authenticateToken error:', err);
    return res.status(403).json({ error: 'Invalid or expired session token.' });
  }
}

// Strict Role Check Middleware
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Forbidden: Access restricted to ${allowedRoles.join(', ')} roles.` 
      });
    }
    next();
  };
}

// Mandatory Server-Side Club Data Isolation Guard (Section 12 of Spec)
export function enforceClubIsolation(paramName = 'clubId') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Super Admin has global platform access
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Club Admin can ONLY access their assigned club
    if (req.user.role === 'club_admin') {
      const rawParam = req.params[paramName] || req.body[paramName] || req.query[paramName];
      const targetClubId = parseInt(rawParam);

      if (!req.user.club_id) {
        return res.status(403).json({ error: 'Forbidden: No club assigned to your admin account.' });
      }

      if (targetClubId && req.user.club_id !== targetClubId) {
        return res.status(403).json({ 
          error: 'Forbidden: Security Violation. You can only view and manage data for your assigned club.' 
        });
      }

      return next();
    }

    return res.status(403).json({ error: 'Forbidden: Insufficient permissions.' });
  };
}
