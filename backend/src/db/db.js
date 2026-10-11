import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool, types } = pg;

// Parse int8 (BIGINT, COUNT(*) in Postgres) as Javascript number
types.setTypeParser(types.builtins.INT8, (val) => (val === null ? null : parseInt(val, 10)));

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    }
  : {
      host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
      port: parseInt(process.env.DB_PORT || process.env.PGPORT || '5432', 10),
      user: process.env.DB_USER || process.env.PGUSER || 'postgres',
      password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.PGPASSWORD || 'postgres'),
      database: process.env.DB_NAME || process.env.PGDATABASE || 'bit_sindri_clubs',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    };

export const pool = new Pool(poolConfig);

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
 * Compatibility wrapper mimicking SQLite helper methods with PostgreSQL backing
 */
export const dbWrapper = {
  pool,

  async get(sql, params = []) {
    const pgSql = convertPlaceholders(sql);
    const res = await pool.query(pgSql, params || []);
    return res.rows[0] !== undefined ? res.rows[0] : undefined;
  },

  async all(sql, params = []) {
    const pgSql = convertPlaceholders(sql);
    const res = await pool.query(pgSql, params || []);
    return res.rows || [];
  },

  async run(sql, params = []) {
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

    const pgSql = convertPlaceholders(executeSql);

    try {
      const res = await pool.query(pgSql, params || []);
      const lastID = res.rows && res.rows[0] && res.rows[0].id !== undefined ? res.rows[0].id : undefined;
      return {
        lastID,
        changes: res.rowCount,
        rowCount: res.rowCount
      };
    } catch (err) {
      // If table has no 'id' column or RETURNING id failed, retry original query
      if (tryReturningId && err.message && err.message.includes('id')) {
        const fallbackSql = convertPlaceholders(cleanSql);
        const res = await pool.query(fallbackSql, params || []);
        return {
          lastID: undefined,
          changes: res.rowCount,
          rowCount: res.rowCount
        };
      }
      throw err;
    }
  },

  async exec(sql) {
    return await pool.query(sql);
  },

  async query(sql, params = []) {
    const pgSql = convertPlaceholders(sql);
    return await pool.query(pgSql, params || []);
  }
};

export async function getDb() {
  return dbWrapper;
}

export default dbWrapper;
