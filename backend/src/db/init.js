import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';
import { getDb } from './db.js';
import { seedClubs } from './seed_clubs.js';
import { seedEvents } from './seed_events.js';
import { seedInductionForms } from './seed_induction.js';
import { seedAdmins } from './seed_admins.js';

dotenv.config();

const { Client } = pg;

async function ensureDatabaseExists() {
  const targetDbName = process.env.DB_NAME || process.env.PGDATABASE || 'bit_sindri_clubs';
  
  // If full connection string provided, parse or connect directly
  const maintenanceConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL.replace(new RegExp(`/${targetDbName}(\\?.*)?$`), '/postgres$1'),
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
      }
    : {
        host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
        port: parseInt(process.env.DB_PORT || process.env.PGPORT || '5432', 10),
        user: process.env.DB_USER || process.env.PGUSER || 'postgres',
        password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.PGPASSWORD || 'postgres'),
        database: 'postgres',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
      };

  try {
    const client = new Client(maintenanceConfig);
    await client.connect();
    const checkRes = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDbName]);
    if (checkRes.rowCount === 0) {
      console.log(`Database "${targetDbName}" does not exist. Creating it now...`);
      // Database names cannot be parameterized in CREATE DATABASE
      await client.query(`CREATE DATABASE "${targetDbName}"`);
      console.log(`Database "${targetDbName}" created successfully.`);
    }
    await client.end();
  } catch (err) {
    // If connecting to maintenance db failed (e.g. cloud postgres with restricted privileges), log warning and continue
    console.log(`Note: Automatic database creation check skipped (${err.message}). Connecting to target database directly.`);
  }
}

async function initDb() {
  console.log('Ensuring PostgreSQL database exists...');
  await ensureDatabaseExists();

  console.log('Connecting to PostgreSQL database and applying schema...');
  const db = await getDb();
  
  const schemaPath = path.resolve(process.cwd(), 'src/db/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Execute PostgreSQL schema creation
  await db.exec(schemaSql);
  console.log('PostgreSQL database tables created successfully.');

  // Seed Verified Clubs
  await seedClubs();

  // Seed club admin logins (the only role that can log in)
  console.log('Seeding club admin accounts...');
  await seedAdmins();

  // Seed Initial Events
  await seedEvents();

  // Seed Induction Forms
  await seedInductionForms();

  console.log('PostgreSQL database initialization & seeding complete.');
  process.exit(0);
}

initDb().catch((err) => {
  console.error('Error initializing PostgreSQL database:', err);
  process.exit(1);
});
