import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import pg from 'pg';
import dotenv from 'dotenv';
import { getDb } from './db.js';
import { seedClubs } from './seed_clubs.js';
import { seedEvents } from './seed_events.js';
import { seedInductionForms } from './seed_induction.js';

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

  // Seed initial system users if empty
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  const count = Number(userCount?.count || 0);

  if (count === 0) {
    console.log('Seeding initial demo users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Super Admin
    await db.run(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      ['Super Admin', 'admin@bitsindri.ac.in', hashedPassword, 'super_admin']
    );

    // 2. Demo Students
    await db.run(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      ['Ayush Shaurya (Student)', 'student@bitsindri.ac.in', hashedPassword, 'student']
    );

    await db.run(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      ['Priya Sharma (Student)', 'priya.sharma@bitsindri.ac.in', hashedPassword, 'student']
    );

    await db.run(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      ['Rohan Verma (Student)', 'rohan.verma@bitsindri.ac.in', hashedPassword, 'student']
    );

    await db.run(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      ['Ananya Gupta (Student)', 'ananya.gupta@bitsindri.ac.in', hashedPassword, 'student']
    );

    // 3. Demo Club Admin (HnCC Admin)
    await db.run(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      ['HnCC Admin', 'hncc.admin@bitsindri.ac.in', hashedPassword, 'club_admin']
    );

    console.log('Demo users seeded:');
    console.log(' - Super Admin: admin@bitsindri.ac.in / password123');
    console.log(' - Student 1: student@bitsindri.ac.in / password123');
    console.log(' - Student 2: priya.sharma@bitsindri.ac.in / password123');
    console.log(' - Student 3: rohan.verma@bitsindri.ac.in / password123');
    console.log(' - Student 4: ananya.gupta@bitsindri.ac.in / password123');
    console.log(' - Club Admin: hncc.admin@bitsindri.ac.in / password123');
  }

  // Seed Verified Clubs
  await seedClubs();

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
