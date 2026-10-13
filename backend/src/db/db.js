import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

const { Pool, types } = pg;
// Parse int8 (BIGINT, COUNT(*) in Postgres) as Javascript number
types.setTypeParser(types.builtins.INT8, (val) => (val === null ? null : parseInt(val, 10)));

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env before reading process.env (backend/.env locally, repo root .env on Vercel)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const RAW_DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRESQL_URL ||
  '';

export const hasDatabaseUrl = Boolean(RAW_DATABASE_URL);

const DATABASE_URL = RAW_DATABASE_URL
  .replace(/([?&])(pgbouncer|connection_limit|prepareThreshold|prepared_statement_cache)=([^&]*)/g, '$1')
  .replace(/\?&/, '?')
  .replace(/[?&]$/, '');

// On Vercel, the filesystem is read-only except /tmp
const dataDir = process.env.PGLITE_DIR || (process.env.VERCEL ? '/tmp/.pglite-data' : path.resolve(__dirname, '../../.pglite-data'));

let pglitePromise = null;
let pgPool = null;
let isReady = false;
let initPromise = null;

async function getPGlite() {
  if (!pglitePromise) {
    pglitePromise = (async () => {
      try {
        const { PGlite } = await import('@electric-sql/pglite');
        const db = new PGlite(dataDir);
        await db.waitReady;
        return db;
      } catch (err) {
        console.error('[db] Error loading @electric-sql/pglite:', err.message);
        throw err;
      }
    })();
  }
  return pglitePromise;
}

function getPool() {
  if (!pgPool) {
    pgPool = new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false }
    });
  }
  return pgPool;
}

let isInitializing = false;

/**
 * Automatically ensures tables and initial seed data exist on startup.
 */
async function ensureTables() {
  if (isReady || isInitializing) return;
  isInitializing = true;
  try {
    let count = 0;
    try {
      if (hasDatabaseUrl) {
        const pool = getPool();
        const res = await pool.query("SELECT COUNT(*) as count FROM clubs");
        count = parseInt(res.rows[0]?.count || 0, 10);
      } else {
        const db = await getPGlite();
        const res = await db.query("SELECT COUNT(*) as count FROM clubs");
        count = parseInt(res.rows[0]?.count || 0, 10);
      }
    } catch {
      count = 0;
    }

    if (count === 0) {
      console.log('[db] Initializing schema and seed data...');
      const { initDbSchemaAndSeeds } = await import('./init.js');
      await initDbSchemaAndSeeds();
    }
    isReady = true;
  } catch (err) {
    console.warn('[db] Auto-init notice:', err.message);
    isReady = true;
  } finally {
    isInitializing = false;
  }
}

/**
 * Converts SQLite style '?' positional placeholders to PostgreSQL '$1', '$2', ...
 * Ignores question marks inside string literals.
 */
export function convertPlaceholders(sql) {
  let paramIndex = 1;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let result = '';
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    if (char === "'" && (i === 0 || sql[i - 1] !== '\\')) {
      inSingleQuote = !inSingleQuote;
      result += char;
    } else if (char === '"' && (i === 0 || sql[i - 1] !== '\\')) {
      inDoubleQuote = !inDoubleQuote;
      result += char;
    } else if (char === '?' && !inSingleQuote && !inDoubleQuote) {
      result += `$${paramIndex++}`;
    } else {
      result += char;
    }
  }
  return result;
}

/**
 * Universal Database Wrapper supporting both Supabase/PostgreSQL (when DATABASE_URL is provided)
 * and PGlite embedded database (for instant zero-config local development).
 */
export const dbWrapper = {
  async get(sql, params = []) {
    await ensureTables();
    if (hasDatabaseUrl) {
      const pool = getPool();
      const res = await pool.query(convertPlaceholders(sql), params || []);
      return res.rows[0];
    }
    const db = await getPGlite();
    const res = await db.query(convertPlaceholders(sql), params || []);
    return res.rows[0] !== undefined ? res.rows[0] : undefined;
  },

  async all(sql, params = []) {
    await ensureTables();
    if (hasDatabaseUrl) {
      const pool = getPool();
      const res = await pool.query(convertPlaceholders(sql), params || []);
      return res.rows || [];
    }
    const db = await getPGlite();
    const res = await db.query(convertPlaceholders(sql), params || []);
    return res.rows || [];
  },

  async run(sql, params = []) {
    await ensureTables();
    let cleanSql = sql.trim();
    const isInsert = /^\s*insert\s+into\s+/i.test(cleanSql);
    const hasReturning = /\breturning\b/i.test(cleanSql);

    let executeSql = cleanSql;
    let tryReturningId = false;

    if (isInsert && !hasReturning) {
      if (executeSql.endsWith(';')) {
        executeSql = executeSql.slice(0, -1).trim();
      }
      executeSql += ' RETURNING id';
      tryReturningId = true;
    }

    if (hasDatabaseUrl) {
      const pool = getPool();
      try {
        const res = await pool.query(convertPlaceholders(executeSql), params || []);
        const lastID = res.rows && res.rows[0] && res.rows[0].id !== undefined ? res.rows[0].id : undefined;
        return {
          lastID,
          changes: res.rowCount ?? 0,
          rowCount: res.rowCount ?? 0
        };
      } catch (err) {
        if (tryReturningId && err.message && err.message.includes('id')) {
          const res = await pool.query(convertPlaceholders(cleanSql), params || []);
          return {
            lastID: undefined,
            changes: res.rowCount ?? 0,
            rowCount: res.rowCount ?? 0
          };
        }
        throw err;
      }
    }

    const db = await getPGlite();
    try {
      const res = await db.query(convertPlaceholders(executeSql), params || []);
      const lastID = res.rows && res.rows[0] && res.rows[0].id !== undefined ? res.rows[0].id : undefined;
      return {
        lastID,
        changes: res.affectedRows ?? res.rows?.length ?? 0,
        rowCount: res.affectedRows ?? res.rows?.length ?? 0
      };
    } catch (err) {
      if (tryReturningId && err.message && err.message.includes('id')) {
        const res = await db.query(convertPlaceholders(cleanSql), params || []);
        return {
          lastID: undefined,
          changes: res.affectedRows ?? 0,
          rowCount: res.affectedRows ?? 0
        };
      }
      throw err;
    }
  },

  async exec(sql) {
    if (hasDatabaseUrl) {
      const pool = getPool();
      return await pool.query(sql);
    }
    const db = await getPGlite();
    return await db.exec(sql);
  },

  async query(sql, params = []) {
    await ensureTables();
    if (hasDatabaseUrl) {
      const pool = getPool();
      return await pool.query(convertPlaceholders(sql), params || []);
    }
    const db = await getPGlite();
    return await db.query(convertPlaceholders(sql), params || []);
  }
};

export async function getDb() {
  return dbWrapper;
}

export default dbWrapper;
