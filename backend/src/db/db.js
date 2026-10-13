import path from 'path';
import { fileURLToPath } from 'url';
import { PGlite } from '@electric-sql/pglite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env before reading process.env (backend/.env locally, repo root .env on Vercel)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.PGLITE_DIR || path.resolve(__dirname, '../../.pglite-data');

let pglitePromise = null;

async function getPGlite() {
  if (!pglitePromise) {
    pglitePromise = (async () => {
      const db = new PGlite(dataDir);
      await db.waitReady;
      return db;
    })();
  }
  return pglitePromise;
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
 * Compatibility wrapper mimicking SQLite helper methods with PGlite (embedded PostgreSQL)
 */
export const dbWrapper = {
  async get(sql, params = []) {
    const db = await getPGlite();
    const res = await db.query(convertPlaceholders(sql), params || []);
    return res.rows[0] !== undefined ? res.rows[0] : undefined;
  },

  async all(sql, params = []) {
    const db = await getPGlite();
    const res = await db.query(convertPlaceholders(sql), params || []);
    return res.rows || [];
  },

  async run(sql, params = []) {
    const db = await getPGlite();
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
    const db = await getPGlite();
    return await db.exec(sql);
  },

  async query(sql, params = []) {
    const db = await getPGlite();
    return await db.query(convertPlaceholders(sql), params || []);
  }
};

export async function getDb() {
  return dbWrapper;
}

export default dbWrapper;
