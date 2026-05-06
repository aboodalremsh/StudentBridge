// controllers/jobController.js — Public job browsing and applying
const { pool } = require('../config/db');

// ── Helper: calculate job match % ────────────────────────────
// Compares student's skills with job requirements
function calcMatch(studentSkills, jobRequirements) {
  if (!studentSkills || !jobRequirements) return 0;

  const studentSet = new Set(
    studentSkills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
  );
  const required = jobRequirements.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

  if (required.length === 0) return 50; // If no requirements listed, assume 50%

  const matched = required.filter(r => {
    // Check partial matches too (e.g. "react" matches "reactjs")
    return [...studentSet].some(skill => skill.includes(r) || r.includes(skill));
  });

  return Math.round((matched.length / required.length) * 100);
}

// ── GET /api/jobs ─────────────────────────────────────────────
async function getAllJobs(req, res) {
  try {
    const { search, type, location, sort } = req.query;

    let q = `
      SELECT j.*, cp.company_name, cp.logo_url, cp.location AS company_location,
             (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applicant_count
        FROM jobs j
        JOIN company_profiles cp ON cp.user_id = j.company_id
       WHERE j.is_active = 1
    `;
    const params = [];

    if (search) {
      q += ' AND (j.title LIKE ? OR j.description LIKE ? OR j.requirements LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (type)     { q += ' AND j.type = ?';      params.push(type); }
    if (location) { q += ' AND j.location LIKE ?'; params.push(`%${location}%`); }

    q += sort === 'oldest' ? ' ORDER BY j.created_at ASC' : ' ORDER BY j.created_at DESC';

    const [jobs] = await pool.query(q, params);

    // If student is logged in, attach their match score and "already applied" flag
    if (req.user?.role === 'student') {
      const [[profile]] = await pool.query(
        'SELECT skills FROM student_profiles WHERE user_id = ?',
        [req.user.id]
      );
      const [myApps] = await pool.query(
        'SELECT job_id FROM applications WHERE student_id = ?',
        [req.user.id]
      );
      const appliedSet = new Set(myApps.map(a => a.job_id));

      jobs.forEach(job => {
        job.match_score  = calcMatch(profile?.skills, job.requirements);
        job.has_applied  = appliedSet.has(job.id);
      });
    }

    res.json({ success: true, jobs, total: jobs.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error loading jobs.' });
  }
}

// ── GET /api/jobs/:id ─────────────────────────────────────────
async function getJob(req, res) {
  try {
    const [[job]] = await pool.query(
      `SELECT j.*, cp.company_name, cp.logo_url, cp.description AS company_desc, cp.website
         FROM jobs j
         JOIN company_profiles cp ON cp.user_id = j.company_id
        WHERE j.id = ?`,
      [req.params.id]
    );
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    if (req.user?.role === 'student') {
      const [[profile]] = await pool.query(
        'SELECT skills FROM student_profiles WHERE user_id = ?', [req.user.id]
      );
      job.match_score = calcMatch(profile?.skills, job.requirements);

      const [[app]] = await pool.query(
        'SELECT id, status FROM applications WHERE job_id = ? AND student_id = ?',
        [job.id, req.user.id]
      );
      job.my_application = app || null;
    }

    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error loading job.' });
  }
}

// ── POST /api/jobs/:id/apply ──────────────────────────────────
async function applyToJob(req, res) {
  try {
    const { cover_letter } = req.body;
    const jobId = req.params.id;
    const studentId = req.user.id;

    // Check the job exists and is active
    const [[job]] = await pool.query('SELECT * FROM jobs WHERE id = ? AND is_active = 1', [jobId]);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or is closed.' });

    // Check student hasn't already applied
    const [[existing]] = await pool.query(
      'SELECT id FROM applications WHERE job_id = ? AND student_id = ?',
      [jobId, studentId]
    );
    if (existing) return res.status(409).json({ success: false, message: 'You already applied to this job.' });

    // Calculate match score
    const [[profile]] = await pool.query(
      'SELECT skills FROM student_profiles WHERE user_id = ?', [studentId]
    );
    const match = calcMatch(profile?.skills, job.requirements);

    // Insert application
    await pool.query(
      'INSERT INTO applications (job_id, student_id, cover_letter, match_score) VALUES (?, ?, ?, ?)',
      [jobId, studentId, cover_letter || '', match]
    );

    // Award 15 points for applying
    await pool.query(
      'INSERT INTO student_points (student_id, points, reason) VALUES (?, 15, "Applied to a job")',
      [studentId]
    );

    // Check badges
    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) AS count FROM applications WHERE student_id = ?', [studentId]
    );
    if (count >= 1) {
      await pool.query('INSERT IGNORE INTO student_badges (student_id, badge_id) VALUES (?, 2)', [studentId]);
    }
    if (count >= 5) {
      await pool.query('INSERT IGNORE INTO student_badges (student_id, badge_id) VALUES (?, 9)', [studentId]);
    }

    // Notify the student
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "success")',
      [studentId, '✅ Application Sent!', `You applied to "${job.title}". Match: ${match}%`]
    );

    // Notify the company
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "info")',
      [job.company_id, '📩 New Applicant', `A new student applied to "${job.title}".`]
    );

    // Auto-update roadmap step 3 (Submit First Application)
    await pool.query(
      `INSERT INTO roadmap_progress (student_id, step_id, status) VALUES (?, 3, 'done')
       ON DUPLICATE KEY UPDATE status = 'done'`,
      [studentId]
    );

    res.status(201).json({ success: true, message: 'Application submitted!', match_score: match });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error submitting application.' });
  }
}

module.exports = { getAllJobs, getJob, applyToJob };
