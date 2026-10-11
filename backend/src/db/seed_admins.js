import bcrypt from 'bcryptjs';
import { getDb } from './db.js';

const DEFAULT_PASSWORD = 'password123';

// Every admin is a normal user with access to EXACTLY ONE club.
// Multiple admins can exist for the same club.
const ADMINS = [
  { name: 'rahul', email: 'rahul@example.com', club: 'hncc' },
  { name: 'sneha', email: 'sneha@example.com', club: 'hncc' },
  { name: 'aman', email: 'aman@example.com', club: 'iste-students-chapter' },
  { name: 'priyanka', email: 'priyanka@example.com', club: 'ieee-bit-sindri' }
];

export async function seedAdmins() {
  const db = await getDb();
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const admin of ADMINS) {
    let user = await db.get('SELECT id FROM users WHERE email = ?', [admin.email]);

    if (!user) {
      const result = await db.run(
        `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'club_admin')`,
        [admin.name, admin.email, hashedPassword]
      );
      user = { id: result.lastID };
      console.log(`  + Created admin ${admin.email}`);
    }

    const club = await db.get('SELECT id FROM clubs WHERE slug = ?', [admin.club]);
    if (!club) {
      console.log(`  ! Club "${admin.club}" not found, skipping ${admin.email}`);
      continue;
    }

    const existing = await db.get(
      'SELECT id FROM club_admins WHERE user_id = ? AND club_id = ?',
      [user.id, club.id]
    );
    if (!existing) {
      await db.run('INSERT INTO club_admins (user_id, club_id) VALUES (?, ?)', [user.id, club.id]);
      console.log(`  + Assigned ${admin.email} -> ${admin.club}`);
    }
  }

  console.log('Club admin logins (password: ' + DEFAULT_PASSWORD + '):');
  ADMINS.forEach((a) => console.log(` - ${a.name} / ${a.email} -> ${a.club}`));
}

// Allow running standalone: node src/db/seed_admins.js
if (process.argv[1] && process.argv[1].endsWith('seed_admins.js')) {
  seedAdmins()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error seeding admins:', err);
      process.exit(1);
    });
}
