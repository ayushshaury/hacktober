import { getDb } from './db.js';

const verifiedClubs = [
  {
    club_code: 'BIT-001',
    name: 'Hackathon and Coding Club (HnCC)',
    slug: 'hncc',
    category: 'Technical – Coding, Development & Competitive Programming',
    short_description: 'Official coding and development club of BIT Sindri and the institute’s most prestigious technical club; focuses on competitive programming, software development, open source, AI/ML, web/app development, workshops and hackathons.',
    description: 'Hackathon and Coding Club (HnCC) is the official technical coding club of BIT Sindri. HnCC fosters a strong software development and competitive programming culture across the campus through flagship events such as Hackatron, monthly BIT Code contests, CodeCamp, SIH Internal Hackathons, and technical workshops.',
    events_summary: 'Hackatron; BIT Code (Monthly Coding Contest); CodeCamp; SIH Internal Hackathon; UXATHON; CodeQuest; Hacktrail; Exploring Git & GitHub; Linux Installation Drive; Hacktoberfest; GFG x HnCC; Tech Fest (Developer of the Year); Technical Workshops/Webinars',
    ml_keywords: 'coding, programming, competitive programming, software development, web development, app development, backend development, game development, artificial intelligence, AI, machine learning, deep learning, open source, Git, GitHub, hackathons, Smart India Hackathon, SIH, Hackatron, Hack-O-Verse, Hacktoberfest, BIT Code, CodeCamp, War of Web, Linux, C++, Java, Python, UI/UX',
    website_url: 'https://www.hnccbits.com/',
    recruitment_open: 1
  },
  {
    club_code: 'BIT-002',
    name: 'Model Club',
    slug: 'model-club',
    category: 'Technical – Techno-Management',
    short_description: 'Official techno-management club promoting science, technology, technical events, workshops and talks.',
    description: 'Model Club is the premier techno-management club of BIT Sindri. It hosts Sandhaan (the annual mega tech-fest), e-innovation hackathons, guest lectures, and student talks.',
    events_summary: 'Sandhaan Tech Fest; Nav Ujjwal E-Innovation Hackathon; Workshops; Seminars; Guest Lectures; Invited Talks',
    ml_keywords: 'science, technology, techno-management, technical innovation, engineering, technical events, workshops, seminars, guest lectures, talks, hackathons, e-innovation, robotics, drones, Sandhaan',
    website_url: 'https://www.bitsindri.ac.in/mechanical-engineering-society/',
    recruitment_open: 1
  },
  {
    club_code: 'BIT-003',
    name: "IETE Students' Forum",
    slug: 'iete-students-forum',
    category: 'Technical – Techno-Management',
    short_description: 'Techno-management forum focused on technical education, skill development, programming and technology.',
    description: 'IETE Students Forum promotes technical learning and hands-on skill development through Tech Udbhav, Robo Soccer, hackathons, and electronics workshops.',
    events_summary: 'Hacklane; Udyamita; Explicar; Inquizitive; Encipher; Insight; Byte the Bits; Tech Expo; Tech Udbhav; Robo Soccer; Cloak Coding; Minefield Rescue; SensorSync',
    ml_keywords: 'electronics, telecommunications, technology, techno-management, programming, web development, competitive programming, coding, robotics, sensors, technical education, Tech Udbhav',
    website_url: 'https://www.bitsindri.ac.in/iete-students-forum/',
    recruitment_open: 0
  },
  {
    club_code: 'BIT-004',
    name: "ISTE Students' Chapter",
    slug: 'iste-students-chapter',
    category: 'Technical – Techno-Management',
    short_description: 'Nationally affiliated techno-management society focused on technical skills, personality development and managerial skills.',
    description: 'ISTE Students Chapter organizes nationwide technical competitions, smart city challenges, exhibition fests, and managerial workshops.',
    events_summary: 'Smart City Challenge; QI-Festa; AD-Venture; Spider-The Web Crawler; Aavishkar; Postulate; The Solution Desk; TRIVENI; Exhibito; Axelerate; Technoshot',
    ml_keywords: 'technical education, technology, techno-management, personality development, managerial skills, leadership, programming, web development, robotics, smart city',
    website_url: 'https://www.bitsindri.ac.in/iste-students-chapter/',
    recruitment_open: 1
  },
  {
    club_code: 'BIT-006',
    name: 'IEEE BIT-Sindri Student Branch',
    slug: 'ieee-bit-sindri',
    category: 'Technical – Engineering & Professional',
    short_description: 'IEEE student branch supporting technical learning, professional development, innovation and student activities.',
    description: 'IEEE BIT Sindri Student Branch connects students to global IEEE engineering networks, technical publications, research webinars, and development programs.',
    events_summary: 'Distinguished Lectures; Workshops; Seminars/Webinars; Faculty Development Programs; Short Technical Courses; Photography Lessons',
    ml_keywords: 'electrical engineering, electronics, technology, technical learning, professional development, innovation, research, workshops, seminars, webinars, IEEE',
    website_url: 'https://www.bitsindri.ac.in/ieee-bit-sindri-student-branch/',
    recruitment_open: 0
  },
  {
    club_code: 'BIT-007',
    name: 'SAE India BIT Sindri',
    slug: 'sae-india-bit-sindri',
    category: 'Technical – Automotive Engineering',
    short_description: 'Collegiate automotive engineering chapter focused on designing, developing, manufacturing and testing vehicles.',
    description: 'SAE India BIT Sindri designs and builds real all-terrain vehicles (BAJA), formula vehicles (SUPRA), and hybrid vehicles (EFFICYCLE).',
    events_summary: 'BAJA; SUPRA; EFFICYCLE; Technical Workshops; Seminars; Technical Symposiums; Paper Presentations',
    ml_keywords: 'automotive engineering, automobile, vehicle design, vehicle development, manufacturing, testing, mobility, mechanical engineering, BAJA, SUPRA, EFFICYCLE, EV',
    website_url: 'https://www.bitsindri.ac.in/sae-india/',
    recruitment_open: 1
  },
  {
    club_code: 'BIT-008',
    name: 'Mechanical Engineering Society',
    slug: 'mechanical-engineering-society',
    category: 'Technical – Mechanical Engineering',
    short_description: 'Technical society representing the Mechanical Engineering branch and supporting technical, managerial and industry-oriented development.',
    description: 'MES organizes YANTRIKA fest, CAD designing contests (SolidWorks, ANSYS, MATLAB), water rocket challenges, and industrial symposia.',
    events_summary: 'YANTRIKA; Exhibizone; Mechie of the Year; Mech-A-Hunt; Water Rocket Challenge; Green Olympiad; Smart Campus; MAD CAD',
    ml_keywords: 'mechanical engineering, machine design, CAD, SolidWorks, ANSYS, MATLAB, thermal engineering, fluid dynamics, robotics, Yantrika, MAD CAD',
    website_url: 'https://www.bitsindri.ac.in/mechanical-engineering-society-bit-sindri/',
    recruitment_open: 0
  },
  {
    club_code: 'BIT-009',
    name: 'Association of Civil Engineers',
    slug: 'association-of-civil-engineers',
    category: 'Technical – Civil Engineering',
    short_description: 'Civil engineering association focused on current trends, student development, workshops and technical events.',
    description: 'ACE conducts AVLOKAN fest, Game of Truss, Survey Treasure Hunts, and structural model exhibitions.',
    events_summary: 'AVLOKAN 2026; Conclave; Technical Paper Presentations; Neuro Nexus; Game of Truss; Survey Treasure Hunt; Model Exhibitions; Workshops',
    ml_keywords: 'civil engineering, structural engineering, construction, infrastructure, surveying, truss, civil technology, AVLOKAN, Game of Truss',
    website_url: 'https://www.bitsindri.ac.in/association-of-civil-engineers/',
    recruitment_open: 1
  },
  {
    club_code: 'BIT-010',
    name: 'SME BIT Sindri Students Chapter',
    slug: 'sme-bit-sindri',
    category: 'Technical & Social – Mining Engineering',
    short_description: 'Social and technical organisation connecting mining students with mining-industry professionals.',
    description: 'SME BIT Sindri represents mining engineering students, conducting AAGHAZ fest, Mine Blast quizzes, and industry expert webinars.',
    events_summary: 'AAGHAZ; Mine Blast Quiz; Mine-O-Maze; Webinar Series',
    ml_keywords: 'mining engineering, mining, metallurgy, mining industry, mining professionals, mine blasting, mining quiz, Mine-O-Maze, AAGHAZ',
    website_url: 'https://www.bitsindri.ac.in/sme-bit-sindri-students-chapter/',
    recruitment_open: 0
  },
  {
    club_code: 'BIT-011',
    name: 'Electrical Engineering Society (EES)',
    slug: 'electrical-engineering-society',
    category: 'Technical – Electrical Engineering',
    short_description: 'Student-led branch society promoting technical excellence, innovation, practical learning, networking and leadership.',
    description: 'EES hosts VID-YOUTH, VOLT-EDGE EXPO (URJA, DARPAN), power system workshops, and industrial visits.',
    events_summary: 'VID-YOUTH (Shrushti, Model United Nations, Master of Minds); VOLT-EDGE EXPO (URJA, DARPAN); Workshops; Expert Talks; Industrial Visits',
    ml_keywords: 'electrical engineering, electrical technology, technical excellence, innovation, practical learning, research, URJA, DARPAN, Model United Nations',
    website_url: 'https://ees.bitsindri.ac.in/index.html',
    recruitment_open: 1
  },
  {
    club_code: 'BIT-012',
    name: 'ECE Society',
    slug: 'ece-society',
    category: 'Technical – Electronics & Communication',
    short_description: 'Official ECE department society promoting scientific thinking, emerging technologies and real-world software/electronics solutions.',
    description: 'ECE Society conducts embedded system workshops, communication technology seminars, and alumni sessions.',
    events_summary: 'Webinars; Alumni Talks; Technical/Departmental Activities',
    ml_keywords: 'electronics and communication engineering, electronics, communication, embedded systems, emerging technology, software solutions, ECE',
    website_url: 'https://ecesociety.bitsindri.ac.in/',
    recruitment_open: 0
  },
  {
    club_code: 'BIT-013',
    name: 'Production and Industrial Engineering Society',
    slug: 'production-industrial-engineering-society',
    category: 'Technical – Industrial & Manufacturing',
    short_description: 'Branch society focused on industrial management, advanced materials, modern manufacturing and industry interaction.',
    description: 'PIE Society focuses on Industry 4.0, additive manufacturing, IoT, supply chain optimization, and robotics automation.',
    events_summary: 'Technical Seminars; Quizzes; Discussions; Webinars on Industry 4.0; IoT; Additive Manufacturing; Robotics & Automation; Industrial Visits',
    ml_keywords: 'production engineering, industrial engineering, industrial management, manufacturing, Industry 4.0, IoT, robotics, automation, industrial systems',
    website_url: 'https://www.bitsindri.ac.in/production-and-industrial-engineering-society/',
    recruitment_open: 1
  },
  {
    club_code: 'BIT-014',
    name: 'Quimica',
    slug: 'quimica',
    category: 'Technical – Chemical Engineering',
    short_description: 'Official Chemical Engineering society and annual technical colloquium/fest promoting chemical engineering interests.',
    description: 'Quimica holds the annual QUIMICA chemical fest, technical colloquia, Innoverse, and process simulation challenges.',
    events_summary: 'QUIMICA\'26; QUIMICA\'25; QUIMICA\'23; Innoverse; SmartScape; EllementaX; Jeopardy; Shastra; Tech Kriti; Advaita',
    ml_keywords: 'chemical engineering, chemical processes, engineering fundamentals, chemical technology, technical colloquium, QUIMICA, Innoverse',
    website_url: 'https://quimica.bitsindri.ac.in/',
    recruitment_open: 0
  },
  {
    club_code: 'BIT-015',
    name: 'Dhatvika',
    slug: 'dhatvika',
    category: 'Technical – Metallurgy & Materials',
    short_description: 'Annual Metallurgical fest focused on academic learning, research, industrial practices and materials engineering.',
    description: 'Dhatvika promotes metallurgical innovation, materials science workshops, metal-o-grafie contests, and industrial practice seminars.',
    events_summary: 'DHATVIKA\'26; AVSAR; AARAMBH; PARIVARTAN; AALANKAN; METAL-O-GRAFIE; AYAS; MISHRAN; STHANANN',
    ml_keywords: 'metallurgical engineering, metallurgy, materials science, materials engineering, metals, research, DHATVIKA, METAL-O-GRAFIE',
    website_url: 'https://dhatvika.in/',
    recruitment_open: 1
  },
  {
    club_code: 'BIT-016',
    name: 'Sarjana',
    slug: 'sarjana',
    category: 'Media & Literary',
    short_description: 'Official institute magazine editorial board and student media body involving writing, journalism, graphic design and literary activities.',
    description: 'Sarjana is the official editorial board of BIT Sindri publishing annual magazines, alumnus interview series, and journalism drives.',
    events_summary: 'Hindi Pakhwada; Kalrav; Annual Creative Writing Competition; Institute Magazine Activities; Alumni/Personality Interviews',
    ml_keywords: 'writing, journalism, student media, editorial, institute magazine, graphic design, literature, creative writing, interviews, Hindi, English',
    website_url: 'https://www.bitsindri.ac.in/sarjana/',
    recruitment_open: 1
  },
  {
    club_code: 'BIT-017',
    name: 'IIC (Institution Innovation Council)',
    slug: 'iic',
    category: 'Entrepreneurship & Innovation',
    short_description: 'Campus pre-incubator supporting innovative students and faculty in converting ideas into technology solutions and startups.',
    description: 'Institution Innovation Council (IIC) provides pre-incubation, funding guidance, pitch competitions (E-Summit, Navonmesh, Vishleshan), and mentorship for student entrepreneurs and innovators.',
    events_summary: 'E-Summit; Navonmesh; Vishleshan; Incubation/Startup Activities; Business Pitching; Innovation Hackathons',
    ml_keywords: 'IIC, Institution Innovation Council, start-up cell, entrepreneurship, startups, innovation, technology solutions, business ideas, incubation, E-Summit, Navonmesh, Vishleshan, pitch deck, venture capital',
    website_url: 'https://www.bitsindri.ac.in/start-up-cell/',
    recruitment_open: 1
  },
  {
    club_code: 'BIT-018',
    name: 'Arts Club',
    slug: 'arts-club',
    category: 'Cultural & Performing Arts',
    short_description: 'One of BIT Sindri\'s oldest cultural clubs covering choreography, dramatics, vocals/instrumentals, and media/graphics.',
    description: 'Arts Club is BIT Sindri\'s leading cultural society for dance, nukkad natak, music, vocals, dramatics, and flash mobs.',
    events_summary: 'ARTOत्सव; Glimpse Art; Flash Mobs; Nukkad Natak; Cultural Performances',
    ml_keywords: 'dance, choreography, dramatics, drama, theatre, vocals, singing, instrumental music, flash mobs, nukkad natak, cultural fests',
    website_url: 'https://www.bitsindri.ac.in/the-arts-club/',
    recruitment_open: 0
  },
  {
    club_code: 'BIT-019',
    name: 'Eco Club',
    slug: 'eco-club',
    category: 'Environmental & Socio-Cultural',
    short_description: 'Environment-cum-socio-cultural club working on environmental awareness, plantation, cleanliness and social upliftment.',
    description: 'Eco Club drives green campus sustainability, Van Mahotsav tree plantation, cleanliness drives, and Vidur Utsav socio-cultural fest.',
    events_summary: 'Vidur Utsav; ECO Enthusia; Van Mahotsav; Smriti Taru; Plantation Drives; Cleanliness Drives; Sandharan; ECO Wheel',
    ml_keywords: 'environment, sustainability, environmental awareness, plantation, tree planting, cleanliness, green campus, Vidur Utsav, ECO Enthusia',
    website_url: 'https://www.bitsindri.ac.in/eco-club/',
    recruitment_open: 1
  },
  {
    club_code: 'BIT-020',
    name: 'Gandhi Rachnatmak Samiti',
    slug: 'gandhi-rachnatmak-samiti',
    category: 'Socio-Cultural & Community',
    short_description: 'Socio-cultural club promoting public service, communication, social skills, cultural engagement and student development.',
    description: 'GRS conducts Nishkarsh, Director\'s Cut, alumni meets, Republic & Independence Day celebrations, and soft skills workshops.',
    events_summary: 'Nishkarsh; Director\'s Cut; Place-COM; Republic Day; Independence Day; Alumni Meets; Cultural/Social Events',
    ml_keywords: 'public service, social service, socio-cultural, communication skills, social skills, leadership, Nishkarsh, Director\'s Cut, GRS',
    website_url: 'https://grsbitsindri.com/',
    recruitment_open: 0
  },
  {
    club_code: 'BIT-021',
    name: 'LEOs Society / LEO Club',
    slug: 'leos-society',
    category: 'Socio-Cultural & Community Service',
    short_description: 'Youth organisation associated with Lions International, combining cultural, leadership and community-service activities.',
    description: 'LEOs Society organizes Fresher of the Year Contest (FOYC), BITAANSH, blood donation drives, and eye relief camps.',
    events_summary: 'Fresher of the Year Contest (FOYC); BITAANSH; Blood Donation Camps; Book Drives; Eye Relief Activities',
    ml_keywords: 'leadership, youth leadership, community service, social service, blood donation, FOYC, BITAANSH, LEOs',
    website_url: 'https://in.linkedin.com/company/leobits',
    recruitment_open: 1
  },
  {
    club_code: 'BIT-022',
    name: 'Literary Society',
    slug: 'literary-society',
    category: 'Literary & Cultural',
    short_description: 'Literature-cum-cultural club supporting communication, speaking, listening, leadership and personality development.',
    description: 'Literary Society hosts DHWANI, PALAASH, open mic sessions, debating, slam poetry, and creative writing events.',
    events_summary: 'DHWANI; PALAASH; SPANDAN; EZMANIA; Literary/Open-Mic Activities',
    ml_keywords: 'literature, literary activities, public speaking, communication, writing, open mic, poetry, debating, DHWANI, PALAASH',
    website_url: 'https://www.bitsindri.ac.in/literary-society/',
    recruitment_open: 0
  },
  {
    club_code: 'BIT-023',
    name: 'Photographic Club',
    slug: 'photographic-club',
    category: 'Media, Photography & Socio-Cultural',
    short_description: 'Official socio-cultural club focused on photography, visual storytelling, poster making, video editing and content creation.',
    description: 'Photographic Club handles campus photography, visual filmmaking, Sony photography workshops, and photo exhibitions (Glossarium & Snappz).',
    events_summary: 'Glossarium & Snappz; Sparsh; EDM Nite; Quantums; Life is Unfair; Chrixels; Sony Workshop; Director\'s Cut',
    ml_keywords: 'photography, visual storytelling, poster making, video editing, content creation, cinematography, photo exhibition, Snappz',
    website_url: 'https://www.bitsindri.ac.in/the-photographic-club/',
    recruitment_open: 1
  },
  {
    club_code: 'BIT-024',
    name: 'Painting Wing',
    slug: 'painting-wing',
    category: 'Visual Arts',
    short_description: 'Art club promoting campus art culture through painting and creative visual activities.',
    description: 'Painting Wing transforms campus spaces through street painting, wall painting, rangoli arts, caricatures, and oil paintings.',
    events_summary: 'Street Painting; Wall Painting; Rangoli Making; Caricature; Clay Modeling; Body Painting; Oil Painting',
    ml_keywords: 'painting, visual arts, fine arts, street painting, wall painting, rangoli, caricature, clay modeling, oil painting, sketch',
    website_url: 'https://www.bitsindri.ac.in/painting-wing/',
    recruitment_open: 0
  },
  {
    club_code: 'BIT-025',
    name: 'Prayaas India',
    slug: 'prayaas-india',
    category: 'Social Service & Education',
    short_description: 'Student-led social initiative supporting underprivileged children through education, skill development and community activities.',
    description: 'Prayaas India runs non-formal educational centers for underprivileged kids near campus, RAINBOW fest, and spoken English classes.',
    events_summary: 'RAINBOW Literary Fest; Inter-School Quiz Competition; Spoken English Classes; Co-Curricular & Sports Events; Blood Donation',
    ml_keywords: 'social service, education, teaching, underprivileged children, literacy, NGO, volunteering, RAINBOW fest, Prayaas',
    website_url: 'https://www.prayaasindia.org/',
    recruitment_open: 1
  },
  {
    club_code: 'BIT-026',
    name: 'Rotaract Club of BIT Sindri',
    slug: 'rotaract-club',
    category: 'Social Service & Leadership',
    short_description: 'Youth wing of Rotary International focused on community welfare, leadership, skill development and social service.',
    description: 'Rotaract Club organizes eye relief camps, LN4 prosthetic hand distribution, blood donation camps, Pankh, and Umeed community initiatives.',
    events_summary: 'Eye Relief Camp; Blood Donation Camps; Annual Mega Cultural Fest; Exhibition; Treasure Hunt; Band Night; LN4 Hand Camp',
    ml_keywords: 'community service, social service, leadership, Rotary, volunteering, eye relief, blood donation, disability support, Rotaract',
    website_url: 'https://rotaractbitsindri.co.in/',
    recruitment_open: 1
  },
  {
    club_code: 'BIT-027',
    name: 'Sports Club',
    slug: 'sports-club',
    category: 'Sports',
    short_description: 'Institute sports club organizing annual sports meets and inter-branch competitions.',
    description: 'Sports Club manages institute athletic facilities and conducts SPARDHA, PRATIDWANDA inter-branch tournaments (cricket, football, volleyball, badminton).',
    events_summary: 'SPARDHA; PRATIDWANDA; Inter-Branch Tournaments (Boys & Girls); Annual Sports Meet',
    ml_keywords: 'sports, athletics, physical fitness, games, inter-branch tournaments, football, cricket, volleyball, SPARDHA, PRATIDWANDA',
    website_url: 'https://www.bitsindri.ac.in/sports-club/',
    recruitment_open: 0
  }
];

export async function seedClubs() {
  console.log('Seeding verified 26 BIT Sindri Clubs into database...');
  const db = await getDb();

  for (const club of verifiedClubs) {
    const existing = await db.get('SELECT id FROM clubs WHERE club_code = ?', [club.club_code]);
    let clubId;

    if (existing) {
      await db.run(
        `UPDATE clubs SET 
          name = ?, slug = ?, category = ?, short_description = ?, description = ?, 
          events_summary = ?, ml_keywords = ?, website_url = ?, recruitment_open = ?
         WHERE id = ?`,
        [
          club.name, club.slug, club.category, club.short_description, club.description,
          club.events_summary, club.ml_keywords, club.website_url, club.recruitment_open,
          existing.id
        ]
      );
      clubId = existing.id;
    } else {
      const result = await db.run(
        `INSERT INTO clubs 
          (club_code, name, slug, category, short_description, description, events_summary, ml_keywords, website_url, recruitment_open, verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          club.club_code, club.name, club.slug, club.category, club.short_description, club.description,
          club.events_summary, club.ml_keywords, club.website_url, club.recruitment_open
        ]
      );
      clubId = result.lastID;
    }

    // Seed Social Links for Club if not present
    const linkCount = await db.get('SELECT COUNT(*) as count FROM social_links WHERE club_id = ?', [clubId]);
    if (linkCount.count === 0) {
      if (club.website_url) {
        await db.run(
          `INSERT INTO social_links (club_id, platform, url, is_verified) VALUES (?, ?, ?, 1)`,
          [clubId, 'Official Website', club.website_url]
        );
      }
      // Add official platform links where verified
      if (club.slug === 'hncc') {
        await db.run(`INSERT INTO social_links (club_id, platform, url) VALUES (?, 'LinkedIn', 'https://www.linkedin.com/company/hnccbits/')`, [clubId]);
        await db.run(`INSERT INTO social_links (club_id, platform, url) VALUES (?, 'Instagram', 'https://www.instagram.com/hnccbits/')`, [clubId]);
        await db.run(`INSERT INTO social_links (club_id, platform, url) VALUES (?, 'GitHub', 'https://github.com/hnccbits')`, [clubId]);
      } else if (club.slug === 'gandhi-rachnatmak-samiti') {
        await db.run(`INSERT INTO social_links (club_id, platform, url) VALUES (?, 'Instagram', 'https://www.instagram.com/grsbitsindri/')`, [clubId]);
      } else if (club.slug === 'rotaract-club') {
        await db.run(`INSERT INTO social_links (club_id, platform, url) VALUES (?, 'Instagram', 'https://www.instagram.com/rotaractbitsindri/')`, [clubId]);
      }
    }

    // Associate HnCC admin with HnCC club
    if (club.slug === 'hncc') {
      const hnccAdmin = await db.get("SELECT id FROM users WHERE email = 'hncc.admin@bitsindri.ac.in'");
      if (hnccAdmin) {
        const adminAssigned = await db.get("SELECT id FROM club_admins WHERE user_id = ?", [hnccAdmin.id]);
        if (!adminAssigned) {
          await db.run("INSERT INTO club_admins (user_id, club_id, role) VALUES (?, ?, 'admin')", [hnccAdmin.id, clubId]);
        }
      }
    }
  }

  console.log(`Successfully seeded ${verifiedClubs.length} verified BIT Sindri clubs!`);
}
