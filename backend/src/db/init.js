import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getDb } from './db.js';
import { seedClubs } from './seed_clubs.js';
import { seedEvents } from './seed_events.js';
import { seedInductionForms } from './seed_induction.js';
import { seedAdmins } from './seed_admins.js';

dotenv.config();

async function initDb() {
  console.log('Connecting to embedded PostgreSQL (PGlite)...');

  const db = await getDb();

  const schemaPath = path.resolve(process.cwd(), 'src/db/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  await db.exec(schemaSql);
  console.log('Database tables created successfully.');

  await seedClubs();
  console.log('Seeding club admin accounts...');
  await seedAdmins();
  await seedEvents();
  await seedInductionForms();

  console.log('Database initialization & seeding complete.');
  process.exit(0);
}

initDb().catch((err) => {
  console.error('Error initializing database:', err);
  process.exit(1);
});

