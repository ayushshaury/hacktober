import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env before reading process.env (backend/.env locally, repo root .env on Vercel)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Pool, types } = pg;

// Parse int8 (BIGINT, COUNT(*) in Postgres) as Javascript number
types.setTypeParser(types.builtins.INT8, (val) => (val === null ? null : parseInt(val, 10)));

const RAW_DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.SUPABASE_DB_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRESQL_URL ||
  '';

export const hasDatabaseUrl = Boolean(RAW_DATABASE_URL);

// Strip ORM/pooler hint params node-postgres doesn't understand; keep sslmode.
const DATABASE_URL = RAW_DATABASE_URL
  .replace(/([?&])(pgbouncer|connection_limit|prepareThreshold|prepared_statement_cache)=([^&]*)/g, '$1')
  .replace(/\?&/, '?')
  .replace(/[?&]$/, '');

if (!hasDatabaseUrl) {
  console.warn(
    '[db] DATABASE_URL is not set - falling back to localhost PostgreSQL. ' +
    'Set DATABASE_URL (Supabase pooler URI) in Vercel -> Settings -> Environment Variables.'
  );
}

const isSupabase = /\.supabase\.|supabase\.co/i.test(DATABASE_URL) ||
  Boolean(process.env.SUPABASE_URL && (process.env.DB_HOST || '').includes('supabase'));

const wantsSsl =
  process.env.DB_SSL === 'true' ||
  /sslmode=require/i.test(DATABASE_URL) ||
  isSupabase ||
  Boolean(process.env.DATABASE_URL);

const poolConfig = DATABASE_URL
  ? {
      connectionString: DATABASE_URL,
      ssl: wantsSsl ? { rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED === 'true' } : undefined
    }
  : {
      host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
      port: parseInt(process.env.DB_PORT || process.env.PGPORT || '5432', 10),
      user: process.env.DB_USER || process.env.PGUSER || 'postgres',
      password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.PGPASSWORD || 'postgres'),
      database: process.env.DB_NAME || process.env.PGDATABASE || 'bit_sindri_clubs',
      ssl: wantsSsl ? { rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED === 'true' } : undefined
    };

// Serverless (Vercel) friendly pool: tiny, self-draining, with a hard statement timeout
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
poolConfig.max = parseInt(process.env.DB_POOL_MAX || (isServerless ? '1' : '10'), 10);
poolConfig.connectionTimeoutMillis = parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '10000', 10);
poolConfig.idleTimeoutMillis = parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10);
poolConfig.statement_timeout = parseInt(process.env.DB_STATEMENT_TIMEOUT_MS || '15000', 10);
if (isServerless) {
  poolConfig.allowExitOnIdle = true;
}

export const pool = new Pool(poolConfig);
pool.on('error', (err) => {
  console.error('Postgres pool error:', err.message);
});

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
