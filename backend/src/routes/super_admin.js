import express from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { logAudit } from '../utils/auditLogger.js';

const router = express.Router();

// Apply global Super Admin protection to all endpoints in this router
router.use(authenticateToken, requireRole('super_admin'));

/**
 * GET /api/super-admin/clubs
 * List all 26 verified/registered clubs with admin details and applicant/event metrics
 */
router.get('/clubs', async (req, res) => {
  try {
    const db = await getDb();
    const clubs = await db.all(`
      SELECT 
        c.*,
        ca.user_id as admin_user_id,
        u.name as admin_name,
        u.email as admin_email,
        (SELECT COUNT(*) FROM events e WHERE e.club_id = c.id) as total_events,
        (SELECT COUNT(*) FROM induction_applications ia WHERE ia.club_id = c.id) as total_applications
      FROM clubs c
      LEFT JOIN club_admins ca ON c.id = ca.club_id
      LEFT JOIN users u ON ca.user_id = u.id
      ORDER BY c.name ASC
    `);

    res.json({ clubs });
  } catch (err) {
    console.error('SuperAdmin GET /clubs error:', err);
    res.status(500).json({ error: 'Failed to fetch clubs list.' });
  }
});

/**
 * PUT /api/super-admin/clubs/:id/verify
 * Toggle verified status of a club
 */
router.put('/clubs/:id/verify', async (req, res) => {
  try {
    const clubId = parseInt(req.params.id);
    const { verified } = req.body;
    const isVerified = verified ? 1 : 0;

    const db = await getDb();
    const club = await db.get('SELECT id, name FROM clubs WHERE id = ?', [clubId]);
    if (!club) {
      return res.status(404).json({ error: 'Club not found.' });
    }

    await db.run('UPDATE clubs SET verified = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [isVerified, clubId]);

    await logAudit(
      req.user.id,
      clubId,
      isVerified ? 'VERIFY_CLUB' : 'UNVERIFY_CLUB',
      'club',
      clubId,
      { club_name: club.name, status: isVerified }
    );

    res.json({ message: `Club verification updated to ${isVerified ? 'Verified' : 'Unverified'}.`, verified: isVerified });
  } catch (err) {
    console.error('SuperAdmin verify club error:', err);
    res.status(500).json({ error: 'Failed to update club verification status.' });
  }
});

/**
 * PUT /api/super-admin/clubs/:id/recruitment
 * Toggle recruitment open status of a club
 */
router.put('/clubs/:id/recruitment', async (req, res) => {
  try {
    const clubId = parseInt(req.params.id);
    const { recruitment_open } = req.body;
    const isOpen = recruitment_open ? 1 : 0;

    const db = await getDb();
    const club = await db.get('SELECT id, name FROM clubs WHERE id = ?', [clubId]);
    if (!club) {
      return res.status(404).json({ error: 'Club not found.' });
    }

    await db.run('UPDATE clubs SET recruitment_open = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [isOpen, clubId]);

    await logAudit(
      req.user.id,
      clubId,
      isOpen ? 'OPEN_RECRUITMENT' : 'CLOSE_RECRUITMENT',
      'club',
      clubId,
      { club_name: club.name, recruitment_open: isOpen }
    );

    res.json({ message: `Recruitment status updated for ${club.name}.`, recruitment_open: isOpen });
  } catch (err) {
    console.error('SuperAdmin toggle recruitment error:', err);
    res.status(500).json({ error: 'Failed to update recruitment status.' });
  }
});

/**
 * GET /api/super-admin/users
 * Search and view all registered platform users
 */
router.get('/users', async (req, res) => {
  try {
    const { search, role } = req.query;
    const db = await getDb();

    let query = `
      SELECT u.id, u.name, u.email, u.role, u.created_at,
             ca.club_id, c.name as club_name
      FROM users u
      LEFT JOIN club_admins ca ON u.id = ca.user_id
      LEFT JOIN clubs c ON ca.club_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      query += ` AND u.role = ?`;
      params.push(role);
    }

    query += ` ORDER BY u.created_at DESC`;

    const users = await db.all(query, params);
    res.json({ users });
  } catch (err) {
    console.error('SuperAdmin GET /users error:', err);
    res.status(500).json({ error: 'Failed to fetch platform users.' });
  }
});

/**
 * POST /api/super-admin/assign-admin
 * Assign a registered user as Club Admin for a specific club
 */
router.post('/assign-admin', async (req, res) => {
  try {
    const { userId, email, name, password, clubId } = req.body;
    if ((!userId && !email) || !clubId) {
      return res.status(400).json({ error: 'Either userId or email, and clubId are required.' });
    }

    const db = await getDb();
    const targetClub = await db.get('SELECT id, name FROM clubs WHERE id = ?', [clubId]);
    if (!targetClub) {
      return res.status(404).json({ error: 'Club not found.' });
    }

    let targetUser = null;
    const finalPassword = (password && password.trim()) ? password.trim() : 'password123';

    if (userId) {
      targetUser = await db.get('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);
      if (targetUser && password && password.trim()) {
        const hashedPassword = await bcrypt.hash(finalPassword, 10);
        await db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashedPassword, targetUser.id]);
      }
    } else if (email && email.trim()) {
      const cleanEmail = email.toLowerCase().trim();
      targetUser = await db.get('SELECT id, name, email, role FROM users WHERE LOWER(email) = ?', [cleanEmail]);

      // If user does not exist with that email, automatically create a new club_admin account
      if (!targetUser) {
        const emailPrefix = cleanEmail.split('@')[0];
        const autoName = (name && name.trim()) 
          ? name.trim() 
          : emailPrefix.replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const hashedPassword = await bcrypt.hash(finalPassword, 10);
        const createRes = await db.run(
          'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
          [autoName, cleanEmail, hashedPassword, 'club_admin']
        );
        targetUser = {
          id: createRes.lastID,
          name: autoName,
          email: cleanEmail,
          role: 'club_admin'
        };
      } else if (password && password.trim()) {
        // If user already exists and a custom password was provided, update it
        const hashedPassword = await bcrypt.hash(finalPassword, 10);
        await db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashedPassword, targetUser.id]);
      }
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'Target user could not be found or created.' });
    }

    // Clear existing assignment for this club if any
    await db.run('DELETE FROM club_admins WHERE club_id = ?', [clubId]);

    // Insert new assignment
    await db.run('INSERT INTO club_admins (user_id, club_id, role) VALUES (?, ?, ?)', [targetUser.id, clubId, 'admin']);

    // Update user role to club_admin if currently student
    if (targetUser.role === 'student') {
      await db.run("UPDATE users SET role = 'club_admin', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [targetUser.id]);
    }

    await logAudit(
      req.user.id,
      clubId,
      'ASSIGN_CLUB_ADMIN',
      'user',
      targetUser.id,
      { assigned_user: targetUser.email, club_name: targetClub.name }
    );

    res.json({ 
      message: `Successfully assigned ${targetUser.name} (${targetUser.email}) as Admin for ${targetClub.name}.`,
      user: targetUser
    });
  } catch (err) {
    console.error('SuperAdmin assign admin error:', err);
    res.status(500).json({ error: 'Failed to assign club admin.' });
  }
});

/**
 * POST /api/super-admin/revoke-admin
 * Revoke club admin privileges for a user
 */
router.post('/revoke-admin', async (req, res) => {
  try {
    const { userId, clubId } = req.body;
    if (!userId || !clubId) {
      return res.status(400).json({ error: 'Both userId and clubId are required.' });
    }

    const db = await getDb();
    await db.run('DELETE FROM club_admins WHERE user_id = ? AND club_id = ?', [userId, clubId]);

    // Revert role to student if no remaining admin assignments
    const remainingCount = await db.get('SELECT COUNT(*) as count FROM club_admins WHERE user_id = ?', [userId]);
    if (remainingCount.count === 0) {
      await db.run("UPDATE users SET role = 'student', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [userId]);
    }

    await logAudit(
      req.user.id,
      clubId,
      'REVOKE_CLUB_ADMIN',
      'user',
      userId,
      { user_id: userId, club_id: clubId }
    );

    res.json({ message: 'Successfully revoked club admin privileges.' });
  } catch (err) {
    console.error('SuperAdmin revoke admin error:', err);
    res.status(500).json({ error: 'Failed to revoke club admin.' });
  }
});

/**
 * POST /api/super-admin/unrevoke-admin
 * Restore or unrevoke club admin privileges for a user
 */
router.post('/unrevoke-admin', async (req, res) => {
  try {
    const { userId, clubId, password } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    const db = await getDb();
    const targetUser = await db.get('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let finalClubId = clubId;
    if (!finalClubId) {
      const lastRevoke = await db.get(
        "SELECT club_id FROM audit_logs WHERE action = 'REVOKE_CLUB_ADMIN' AND entity_id = ? ORDER BY timestamp DESC LIMIT 1",
        [userId]
      );
      if (lastRevoke && lastRevoke.club_id) {
        finalClubId = lastRevoke.club_id;
      }
    }

    if (!finalClubId) {
      return res.status(400).json({ error: 'Please specify a club to assign the admin to.' });
    }

    const targetClub = await db.get('SELECT id, name FROM clubs WHERE id = ?', [finalClubId]);
    if (!targetClub) {
      return res.status(404).json({ error: 'Target club not found.' });
    }

    // Clear any existing admin for this club
    await db.run('DELETE FROM club_admins WHERE club_id = ?', [finalClubId]);

    // Insert assignment
    await db.run('INSERT INTO club_admins (user_id, club_id, role) VALUES (?, ?, ?)', [targetUser.id, finalClubId, 'admin']);

    // Ensure role is club_admin
    await db.run("UPDATE users SET role = 'club_admin', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [targetUser.id]);

    // Update password if specified
    if (password && password.trim()) {
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      await db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashedPassword, targetUser.id]);
    }

    await logAudit(
      req.user.id,
      finalClubId,
      'UNREVOKE_CLUB_ADMIN',
      'user',
      targetUser.id,
      { assigned_user: targetUser.email, club_name: targetClub.name, action_type: 'unrevoke' }
    );

    res.json({
      message: `Successfully unrevoked and restored ${targetUser.name} (${targetUser.email}) as Admin for ${targetClub.name}.`,
      user: targetUser,
      club: targetClub
    });
  } catch (err) {
    console.error('SuperAdmin unrevoke admin error:', err);
    res.status(500).json({ error: 'Failed to unrevoke club admin privileges.' });
  }
});

/**
 * GET /api/super-admin/audit-logs
 * System audit log trail
 */
router.get('/audit-logs', async (req, res) => {
  try {
    const db = await getDb();
    const logs = await db.all(`
      SELECT 
        al.*,
        u.name as actor_name,
        u.email as actor_email,
        c.name as club_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN clubs c ON al.club_id = c.id
      ORDER BY al.timestamp DESC
      LIMIT 100
    `);

    res.json({ logs });
  } catch (err) {
    console.error('SuperAdmin GET /audit-logs error:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
});

/**
 * GET /api/super-admin/analytics
 * Platform-wide metrics and aggregates
 */
router.get('/analytics', async (req, res) => {
  try {
    const db = await getDb();

    const usersCount = await db.get(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as students,
        SUM(CASE WHEN role = 'club_admin' THEN 1 ELSE 0 END) as club_admins,
        SUM(CASE WHEN role = 'super_admin' THEN 1 ELSE 0 END) as super_admins
      FROM users
    `);

    const clubsCount = await db.get(`
      SELECT 
        COUNT(*) as total_clubs,
        SUM(CASE WHEN verified = 1 THEN 1 ELSE 0 END) as verified_clubs,
        SUM(CASE WHEN recruitment_open = 1 THEN 1 ELSE 0 END) as recruiting_clubs
      FROM clubs
    `);

    const eventsCount = await db.get(`
      SELECT 
        COUNT(*) as total_events,
        SUM(CASE WHEN status = 'Published' OR status = 'Registration Open' THEN 1 ELSE 0 END) as active_events
      FROM events
    `);

    const appStatusBreakdown = await db.all(`
      SELECT status, COUNT(*) as count 
      FROM induction_applications 
      GROUP BY status
    `);

    const topClubsByApps = await db.all(`
      SELECT c.name, COUNT(ia.id) as count
      FROM clubs c
      LEFT JOIN induction_applications ia ON c.id = ia.club_id
      GROUP BY c.id
      ORDER BY count DESC
      LIMIT 6
    `);

    const categoryBreakdown = await db.all(`
      SELECT category, COUNT(*) as count
      FROM clubs
      GROUP BY category
      ORDER BY count DESC
    `);

    res.json({
      analytics: {
        users: usersCount,
        clubs: clubsCount,
        events: eventsCount,
        application_statuses: appStatusBreakdown,
        top_clubs_applications: topClubsByApps,
        categories: categoryBreakdown
      }
    });
  } catch (err) {
    console.error('SuperAdmin GET /analytics error:', err);
    res.status(500).json({ error: 'Failed to compute platform analytics.' });
  }
});

export default router;
