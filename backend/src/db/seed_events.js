import { getDb } from './db.js';

const initialEvents = [
  {
    club_slug: 'hncc',
    title: 'Hackatron 4.0 — National 36-Hour Hackathon',
    description: 'Flagship national level 36-hour hackathon organized by HnCC, BIT Sindri. Solve real-world challenges in AI/ML, Web Dev, Open Source, and Mobile Apps with cash prizes & swags.',
    event_date: '2026-11-15',
    start_time: '09:00 AM',
    end_time: '09:00 PM',
    venue: 'Deshpande Auditorium & IT Building',
    registration_url: 'https://www.hnccbits.com/',
    status: 'Registration Open'
  },
  {
    club_slug: 'hncc',
    title: 'BIT Code — Monthly Campus Coding Contest',
    description: 'Monthly competitive programming contest on CodeChef/HackerRank platform hosted by HnCC to improve DSA & problem-solving skills.',
    event_date: '2026-10-25',
    start_time: '06:00 PM',
    end_time: '08:30 PM',
    venue: 'Online (CodeChef)',
    registration_url: 'https://www.hnccbits.com/',
    status: 'Published'
  },
  {
    club_slug: 'model-club',
    title: 'Sandhaan 2026 — Mega Techno-Management Fest',
    description: 'Annual mega tech fest featuring paper presentations, robotics challenges, guest lectures by top industry leaders, and drone racing.',
    event_date: '2026-12-05',
    start_time: '10:00 AM',
    end_time: '07:00 PM',
    venue: 'BIT Sindri Main Campus',
    registration_url: 'https://www.bitsindri.ac.in/',
    status: 'Registration Open'
  },
  {
    club_slug: 'iic',
    title: 'E-Summit 2026 — Annual Entrepreneurship & Innovation Summit',
    description: 'Pitch your startup ideas to angel investors, participate in Navonmesh pitch deck competition, and interact with founder alumni.',
    event_date: '2026-11-02',
    start_time: '09:30 AM',
    end_time: '05:00 PM',
    venue: 'Placement Cell Auditorium',
    registration_url: 'https://www.bitsindri.ac.in/start-up-cell/',
    status: 'Registration Open'
  },
  {
    club_slug: 'eco-club',
    title: 'Van Mahotsav & Green Campus Tree Plantation Drive',
    description: 'Annual environmental awareness and mass tree sapling plantation drive across hostels and campus gardens.',
    event_date: '2026-10-30',
    start_time: '07:00 AM',
    end_time: '11:00 AM',
    venue: 'Campus Sports Ground',
    registration_url: 'https://www.bitsindri.ac.in/eco-club/',
    status: 'Published'
  }
];

export async function seedEvents() {
  console.log('Seeding initial campus events...');
  const db = await getDb();

  for (const ev of initialEvents) {
    const club = await db.get('SELECT id FROM clubs WHERE slug = ?', [ev.club_slug]);
    if (club) {
      const existing = await db.get('SELECT id FROM events WHERE title = ? AND club_id = ?', [ev.title, club.id]);
      if (!existing) {
        await db.run(
          `INSERT INTO events 
            (club_id, title, description, event_date, start_time, end_time, venue, registration_url, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [club.id, ev.title, ev.description, ev.event_date, ev.start_time, ev.end_time, ev.venue, ev.registration_url, ev.status]
        );
      }
    }
  }

  console.log('Campus events seeded successfully.');
}
