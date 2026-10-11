import express from 'express';
import { getDb } from '../db/db.js';
import { authenticateToken, requireRole, enforceClubIsolation, resolveClubId } from '../middleware/auth.js';

const router = express.Router();

// GET /api/induction/club/:clubSlug or /api/induction/clubs/:clubSlug/form - Get active induction form
const getFormHandler = async (req, res) => {
  const { clubSlug } = req.params;

  try {
    const db = await getDb();
    const querySlug = clubSlug.toLowerCase();
    const effectiveSlug = querySlug === 'start-up-cell' ? 'iic' : querySlug;

    const club = await db.get(
      'SELECT id, name, slug, club_code, category, recruitment_open FROM clubs WHERE slug = ? OR LOWER(club_code) = ? OR id = ?',
      [effectiveSlug, querySlug, parseInt(clubSlug) || 0]
    );

    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    // If club recruitment is officially closed
    if (club.recruitment_open !== 1) {
      return res.status(200).json({
        is_closed: true,
        club: { id: club.id, name: club.name, slug: club.slug, club_code: club.club_code, recruitment_open: 0 },
        message: 'Induction application form is currently closed for this club.'
      });
    }

    let form = await db.get(
      'SELECT * FROM induction_forms WHERE club_id = ? AND is_active = 1 LIMIT 1',
      [club.id]
    );

    // If no active form found, check if an inactive one exists
    if (!form) {
      const anyForm = await db.get('SELECT * FROM induction_forms WHERE club_id = ? LIMIT 1', [club.id]);
      if (anyForm) {
        // If club is open but form was marked inactive, activate it
        await db.run('UPDATE induction_forms SET is_active = 1 WHERE id = ?', [anyForm.id]);
        form = await db.get('SELECT * FROM induction_forms WHERE id = ?', [anyForm.id]);
      } else {
        // Create new induction form for club
        const insertRes = await db.run(
          `INSERT INTO induction_forms (club_id, title, description, is_active)
           VALUES (?, ?, ?, 1)`,
          [
            club.id,
            `${club.name} Induction Drive 2026`,
            `Official recruitment application for ${club.name}, BIT Sindri.`
          ]
        );
        form = await db.get('SELECT * FROM induction_forms WHERE id = ?', [insertRes.lastID]);
      }
    }

    // Fetch form questions
    let questions = await db.all(
      'SELECT * FROM form_questions WHERE form_id = ? ORDER BY display_order ASC',
      [form.id]
    );

    // If no questions exist, provision standard defaults
    if (!questions || questions.length === 0) {
      const q1 = await db.run(
        `INSERT INTO form_questions (form_id, question, question_type, required, display_order)
         VALUES (?, ?, 'short_text', 1, 1)`,
        [form.id, 'College Roll Number (e.g. 2401050)']
      );

      const q2 = await db.run(
        `INSERT INTO form_questions (form_id, question, question_type, required, display_order)
         VALUES (?, ?, 'dropdown', 1, 2)`,
        [form.id, 'Engineering Department / Branch']
      );
      const branches = ['Computer Science & Engg', 'Information Technology', 'Electronics & Comm Engg', 'Electrical Engg', 'Mechanical Engg', 'Civil Engg', 'Mining Engg', 'Chemical Engg', 'Metallurgical Engg', 'Production & Ind Engg'];
      for (let i = 0; i < branches.length; i++) {
        await db.run('INSERT INTO form_options (question_id, option_text, display_order) VALUES (?, ?, ?)', [q2.lastID, branches[i], i + 1]);
      }

      await db.run(
        `INSERT INTO form_questions (form_id, question, question_type, required, display_order)
         VALUES (?, ?, 'long_text', 1, 3)`,
        [form.id, `Why do you want to join ${club.name} and what skills do you bring?`]
      );

      questions = await db.all(
        'SELECT * FROM form_questions WHERE form_id = ? ORDER BY display_order ASC',
        [form.id]
      );
    }

    // Fetch options for each question
    for (const q of questions) {
      if (['single_choice', 'multiple_choice', 'dropdown'].includes(q.question_type)) {
        const options = await db.all(
          'SELECT id, option_text FROM form_options WHERE question_id = ? ORDER BY display_order ASC',
          [q.id]
        );
        q.options = options;
      } else {
        q.options = [];
      }
    }

    res.json({
      club: { id: club.id, name: club.name, slug: club.slug, club_code: club.club_code, recruitment_open: club.recruitment_open },
      form: {
        ...form,
        questions
      }
    });
  } catch (err) {
    console.error('Error fetching induction form:', err);
    res.status(500).json({ error: 'Failed to load induction form' });
  }
};

router.get('/club/:clubSlug', getFormHandler);
router.get('/clubs/:clubSlug/form', getFormHandler);

// POST /api/induction/apply - Submit application (Student authenticated)
router.post('/apply', authenticateToken, async (req, res) => {
  const { form_id, club_id, answers } = req.body;

  if (!form_id || !club_id || !answers) {
    return res.status(400).json({ error: 'Form ID, Club ID, and answers payload are required' });
  }

  try {
    const db = await getDb();

    // Verify club recruitment and form is open
    const club = await db.get('SELECT recruitment_open FROM clubs WHERE id = ?', [club_id]);
    const form = await db.get('SELECT is_active FROM induction_forms WHERE id = ?', [form_id]);
    if (!club || club.recruitment_open !== 1 || !form || form.is_active !== 1) {
      return res.status(403).json({ error: 'Induction applications for this club are currently closed.' });
    }

    // Check if student already submitted application for this form
    const existing = await db.get(
      'SELECT id, status FROM induction_applications WHERE form_id = ? AND student_id = ?',
      [form_id, req.user.id]
    );

    if (existing) {
      return res.status(400).json({ error: 'You have already submitted an application for this club induction form.' });
    }

    // Create application record
    const result = await db.run(
      `INSERT INTO induction_applications (form_id, club_id, student_id, status)
       VALUES (?, ?, ?, 'Submitted')`,
      [form_id, club_id, req.user.id]
    );

    const applicationId = result.lastID;

    // Insert answers
    for (const qId of Object.keys(answers)) {
      const answerVal = answers[qId];
      const answerText = Array.isArray(answerVal) ? answerVal.join(', ') : String(answerVal || '');

      await db.run(
        'INSERT INTO application_answers (application_id, question_id, answer) VALUES (?, ?, ?)',
        [applicationId, parseInt(qId), answerText]
      );
    }

    res.status(201).json({
      message: 'Induction application submitted successfully!',
      application_id: applicationId,
      status: 'Submitted'
    });
  } catch (err) {
    console.error('Error submitting induction application:', err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// GET /api/induction/my-applications - List applications submitted by current student
router.get('/my-applications', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    const applications = await db.all(
      `SELECT app.*, c.name as club_name, c.slug as club_slug, c.category as club_category, f.title as form_title
       FROM induction_applications app
       JOIN clubs c ON app.club_id = c.id
       JOIN induction_forms f ON app.form_id = f.id
       WHERE app.student_id = ?
       ORDER BY app.submitted_at DESC`,
      [req.user.id]
    );

    // Fetch answers summary for each application
    for (const app of applications) {
      const answers = await db.all(
        `SELECT ans.answer, q.question 
         FROM application_answers ans
         JOIN form_questions q ON ans.question_id = q.id
         WHERE ans.application_id = ?`,
        [app.id]
      );
      app.answers = answers;
    }

    res.json({
      count: applications.length,
      applications
    });
  } catch (err) {
    console.error('Error fetching student applications:', err);
    res.status(500).json({ error: 'Failed to retrieve your applications' });
  }
});

// GET /api/induction/admin/form - Get form builder questions & options for Club Admin
router.get('/admin/form', authenticateToken, requireRole('club_admin'), async (req, res) => {
  const clubId = resolveClubId(req);

  try {
    const db = await getDb();
    const form = await db.get('SELECT * FROM induction_forms WHERE club_id = ? LIMIT 1', [clubId]);

    if (!form) {
      return res.json({ form: null, questions: [] });
    }

    const questions = await db.all('SELECT * FROM form_questions WHERE form_id = ? ORDER BY display_order ASC', [form.id]);

    for (const q of questions) {
      const options = await db.all('SELECT id, option_text FROM form_options WHERE question_id = ? ORDER BY display_order ASC', [q.id]);
      q.options = options;
    }

    res.json({ form, questions });
  } catch (err) {
    console.error('Error fetching admin form builder:', err);
    res.status(500).json({ error: 'Failed to load form builder' });
  }
});

// POST /api/induction/admin/question - Add question to form (Club Admin / Super Admin)
router.post('/admin/question', authenticateToken, requireRole('club_admin'), async (req, res) => {
  const { question, question_type, required, options } = req.body;
  const clubId = resolveClubId(req);

  if (!question || !question_type) {
    return res.status(400).json({ error: 'Question text and type are required' });
  }

  try {
    const db = await getDb();
    let form = await db.get('SELECT id FROM induction_forms WHERE club_id = ? LIMIT 1', [clubId]);

    if (!form) {
      const club = await db.get('SELECT name FROM clubs WHERE id = ?', [clubId]);
      const newForm = await db.run(
        'INSERT INTO induction_forms (club_id, title, description, is_active) VALUES (?, ?, ?, 1)',
        [clubId, `${club ? club.name : 'Club'} Induction Form 2026`, 'Official induction form', 1]
      );
      form = { id: newForm.lastID };
    }

    const maxOrder = await db.get('SELECT MAX(display_order) as max_ord FROM form_questions WHERE form_id = ?', [form.id]);
    const displayOrder = (maxOrder && maxOrder.max_ord ? maxOrder.max_ord : 0) + 1;

    const qResult = await db.run(
      'INSERT INTO form_questions (form_id, question, question_type, required, display_order) VALUES (?, ?, ?, ?, ?)',
      [form.id, question.trim(), question_type, required ? 1 : 0, displayOrder]
    );

    const questionId = qResult.lastID;

    if (Array.isArray(options) && options.length > 0) {
      for (let i = 0; i < options.length; i++) {
        if (options[i] && String(options[i]).trim() !== '') {
          await db.run(
            'INSERT INTO form_options (question_id, option_text, display_order) VALUES (?, ?, ?)',
            [questionId, String(options[i]).trim(), i + 1]
          );
        }
      }
    }

    res.status(201).json({ message: 'Question added successfully', question_id: questionId });
  } catch (err) {
    console.error('Error adding question:', err);
    res.status(500).json({ error: 'Failed to add question' });
  }
});

// DELETE /api/induction/admin/question/:id - Delete question
router.delete('/admin/question/:id', authenticateToken, requireRole('club_admin'), async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDb();
    await db.run('DELETE FROM form_questions WHERE id = ?', [id]);
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

export default router;
