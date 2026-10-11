import { getDb } from './db.js';

export async function seedInductionForms() {
  console.log('Seeding initial induction forms...');
  const db = await getDb();

  const clubs = await db.all('SELECT id, name, slug, category, recruitment_open FROM clubs ORDER BY id');
  if (!clubs || clubs.length === 0) return;

  const branchOptions = [
    'Computer Science & Engg',
    'Information Technology',
    'Electronics & Comm Engg',
    'Electrical Engg',
    'Mechanical Engg',
    'Civil Engg',
    'Mining Engg',
    'Chemical Engg',
    'Metallurgical Engg',
    'Production & Ind Engg'
  ];

  const yearOptions = ['1st Year (2K26)', '2nd Year (2K25)', '3rd Year (2K24)'];

  for (const club of clubs) {
    let existingForm = await db.get('SELECT id FROM induction_forms WHERE club_id = ?', [club.id]);
    let formId;

    if (!existingForm) {
      const result = await db.run(
        `INSERT INTO induction_forms (club_id, title, description, is_active)
         VALUES (?, ?, ?, ?)`,
        [
          club.id,
          `${club.name} Induction Drive 2026`,
          `Official recruitment form for ${club.name}, BIT Sindri. Join our student initiatives, projects, and campus leadership!`,
          club.recruitment_open === 1 ? 1 : 0
        ]
      );
      formId = result.lastID;
    } else {
      formId = existingForm.id;
    }

    // Seed default questions if empty
    const qCount = await db.get('SELECT COUNT(*) as count FROM form_questions WHERE form_id = ?', [formId]);
    if (parseInt(qCount.count) === 0) {
      // Q1: Roll Number
      await db.run(
        `INSERT INTO form_questions (form_id, question, question_type, required, display_order)
         VALUES (?, ?, 'short_text', 1, 1)`,
        [formId, 'College Roll Number (e.g. 2401050)']
      );

      // Q2: Branch
      const q2 = await db.run(
        `INSERT INTO form_questions (form_id, question, question_type, required, display_order)
         VALUES (?, ?, 'dropdown', 1, 2)`,
        [formId, 'Engineering Department / Branch']
      );
      for (let i = 0; i < branchOptions.length; i++) {
        await db.run('INSERT INTO form_options (question_id, option_text, display_order) VALUES (?, ?, ?)', [q2.lastID, branchOptions[i], i + 1]);
      }

      // Q3: Academic Year
      const q3 = await db.run(
        `INSERT INTO form_questions (form_id, question, question_type, required, display_order)
         VALUES (?, ?, 'single_choice', 1, 3)`,
        [formId, 'Current Academic Year']
      );
      for (let i = 0; i < yearOptions.length; i++) {
        await db.run('INSERT INTO form_options (question_id, option_text, display_order) VALUES (?, ?, ?)', [q3.lastID, yearOptions[i], i + 1]);
      }

      // Q4: Domain Interests
      let domains = ['Technical / Coding', 'Design & UI/UX', 'Event Management', 'Public Relations & Media', 'Content & Documentation'];
      if (club.category === 'Cultural') {
        domains = ['Performance & Stage Arts', 'Music & Vocals', 'Dance & Choreography', 'Event Coordination', 'Social Media & Creative'];
      } else if (club.category === 'Technical') {
        domains = ['Software & Web/App', 'Hardware / Embedded / IoT', 'Competitive Problem Solving', 'Open Source & Dev', 'Design & Media'];
      } else if (club.category === 'Sports') {
        domains = ['Athlete / Player', 'Team Captain / Coordination', 'Tournament Management', 'Fitness & Training'];
      }

      const q4 = await db.run(
        `INSERT INTO form_questions (form_id, question, question_type, required, display_order)
         VALUES (?, ?, 'multiple_choice', 1, 4)`,
        [formId, 'Which domains or wings interest you the most? (Select all that apply)']
      );
      for (let i = 0; i < domains.length; i++) {
        await db.run('INSERT INTO form_options (question_id, option_text, display_order) VALUES (?, ?, ?)', [q4.lastID, domains[i], i + 1]);
      }

      // Q5: Why do you want to join?
      await db.run(
        `INSERT INTO form_questions (form_id, question, question_type, required, display_order)
         VALUES (?, ?, 'long_text', 1, 5)`,
        [formId, `Why do you want to join ${club.name} and what contributions or skills do you bring?`]
      );

      // Q6: Portfolio / Resume Link
      await db.run(
        `INSERT INTO form_questions (form_id, question, question_type, required, display_order)
         VALUES (?, ?, 'url', 0, 6)`,
        [formId, 'Portfolio / LinkedIn / GitHub / Work Sample Link (Optional)']
      );
    }
  }

  console.log('Induction forms seeded for all clubs successfully.');
}

