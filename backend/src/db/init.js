import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getDb } from './db.js';
import { seedClubs } from './seed_clubs.js';
import { seedEvents } from './seed_events.js';
import { seedInductionForms } from './seed_induction.js';
import { seedAdmins } from './seed_admins.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export async function initDbSchemaAndSeeds() {
  const db = await getDb();

  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  await db.exec(schemaSql);
  console.log('[init] Database tables verified & created successfully.');

  await seedClubs();
  console.log('[init] Seeding club admin accounts...');
  await seedAdmins();
  await seedEvents();
  await seedInductionForms();

  console.log('[init] Database initialization & seeding complete.');
}

export default initDbSchemaAndSeeds;

// Allow running standalone: node backend/src/db/init.js
if (process.argv[1] && process.argv[1].endsWith('init.js')) {
  initDbSchemaAndSeeds()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error initializing database:', err);
      process.exit(1);
    });
}
