import { getDb } from '../db/db.js';

/**
 * Helper to record system audit logs for administrative operations
 */
export async function logAudit(userId, clubId, action, entityType, entityId = null, metadata = null) {
  try {
    const db = await getDb();
    const metaStr = metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : null;
    await db.run(
      `INSERT INTO audit_logs (user_id, club_id, action, entity_type, entity_id, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, clubId || null, action, entityType, entityId || null, metaStr]
    );
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
