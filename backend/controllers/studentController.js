const { pool } = require('../config/db');

// ============================================================
// HELPERS
// ============================================================

function calcMatchScore(studentSkills, jobRequirements) {
  if (!studentSkills || !jobRequirements) return 0;

  const sSkills = studentSkills.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
  const jSkills = jobRequirements.toLowerCase().split(',').map(s => s.trim()).filter(Boolean);

  if (!jSkills.length) return 50;

  const matched = jSkills.filter(j =>
    sSkills.some(s => s.includes(j) || j.includes(s))
  );

  return Math.round((matched.length / jSkills.length) * 100);
}

// ============================================================
// PROFILE
// ============================================================

async function getProfile(req, res) {
  try {
    const [[profile]] = await pool.query(
      `SELECT sp.*, u.email, u.created_at
       FROM student_profiles sp
       JOIN users u ON u.id = sp.user_id
       WHERE sp.user_id = ?`,
      [req.user.id]
    );

    if (!profile) return res.status(404).json({ success: false });

    res.json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

async function updateProfile(req, res) {
  try {
    const {
      full_name, university, major, skills, bio,
      cv_link, github_url, linkedin_url,
      experience_years, avatar_url
    } = req.body;

    await pool.query(
      `UPDATE student_profiles SET
        full_name=?, university=?, major=?, skills=?, bio=?,
        cv_link=?, github_url=?, linkedin_url=?, experience_years=?, avatar_url=?
       WHERE user_id=?`,
      [
        full_name, university, major, skills, bio,
        cv_link, github_url, linkedin_url,
        experience_years, avatar_url,
        req.user.id
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

// ============================================================
// CAREER ADVICE
// ============================================================

async function getCareerAdvice(req, res) {
  try {
    const [[profile]] = await pool.query(
      'SELECT * FROM student_profiles WHERE user_id=?',
      [req.user.id]
    );

    if (!profile) return res.json({ success: true, advice: { profileCompletion: 0 } });

    const fields = [
      profile.full_name,
      profile.university,
      profile.major,
      profile.skills,
      profile.bio,
      profile.cv_link
    ];

    const filled = fields.filter(v => v && v.toString().trim()).length;

    res.json({
      success: true,
      advice: {
        profileCompletion: Math.round((filled / fields.length) * 100)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

// ============================================================
// ROADMAP  ✅ FIX: now uses roadmap_steps + roadmap_progress tables
// ============================================================

async function getRoadmap(req, res) {
  try {
    // Get global roadmap steps
    const [steps] = await pool.query(
      'SELECT * FROM roadmap_steps ORDER BY order_index ASC'
    );

    // Get this student's progress
    const [progress] = await pool.query(
      'SELECT step_id, status FROM roadmap_progress WHERE student_id = ?',
      [req.user.id]
    );

    const progressMap = {};
    progress.forEach(p => { progressMap[p.step_id] = p.status; });

    // Merge steps with student progress
    const result = steps.map(s => ({
      id:          s.id,
      title:       s.title,
      description: s.description,
      status:      progressMap[s.id] || 'not_started',
      step_order:  s.order_index,
    }));

    res.json({ success: true, steps: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

async function updateRoadmapStep(req, res) {
  try {
    const { stepId } = req.params;
    const { status } = req.body;

    const validStatuses = ['not_started', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Verify step exists
    const [[step]] = await pool.query('SELECT id FROM roadmap_steps WHERE id = ?', [stepId]);
    if (!step) return res.status(404).json({ success: false, message: 'Step not found' });

    await pool.query(
      `INSERT INTO roadmap_progress (student_id, step_id, status)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE status = ?`,
      [req.user.id, stepId, status, status]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

// ============================================================
// JOBS
// ============================================================

async function browseJobs(req, res) {
  try {
    const { search, type } = req.query;

    let q = `
      SELECT j.*, cp.company_name, cp.logo_url
      FROM jobs j
      LEFT JOIN company_profiles cp ON cp.user_id = j.company_id
      WHERE j.is_active = 1
    `;
    const params = [];

    if (search) {
      q += ' AND (j.title LIKE ? OR j.description LIKE ? OR j.requirements LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (type) {
      q += ' AND j.type = ?';
      params.push(type);
    }

    q += ' ORDER BY j.created_at DESC';

    const [jobs] = await pool.query(q, params);

    // ✅ FIX: calculate match_score per job using student's skills
    const [[profile]] = await pool.query(
      'SELECT skills FROM student_profiles WHERE user_id = ?',
      [req.user.id]
    );

    // ✅ FIX: check which jobs student already applied to
    const [myApps] = await pool.query(
      'SELECT job_id FROM applications WHERE student_id = ?',
      [req.user.id]
    );
    const appliedSet = new Set(myApps.map(a => a.job_id));

    jobs.forEach(job => {
      job.match_score = calcMatchScore(profile?.skills, job.requirements);
      job.has_applied = appliedSet.has(job.id);
    });

    // ✅ FIX: trigger roadmap step for browsing jobs
    await pool.query(
      `INSERT INTO roadmap_progress (student_id, step_id, status)
       SELECT ?, id, 'completed' FROM roadmap_steps WHERE trigger_event = 'jobs_browsed'
       ON DUPLICATE KEY UPDATE status = 'completed'`,
      [req.user.id]
    );

    res.json({ success: true, jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

async function applyToJob(req, res) {
  try {
    const jobId    = req.params.id;
    const studentId = req.user.id;

    // Check job exists and is active
    const [[job]] = await pool.query('SELECT * FROM jobs WHERE id = ? AND is_active = 1', [jobId]);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or is closed' });

    // Check not already applied
    const [[existing]] = await pool.query(
      'SELECT id FROM applications WHERE job_id = ? AND student_id = ?',
      [jobId, studentId]
    );
    if (existing) return res.status(409).json({ success: false, message: 'Already applied to this job' });

    const { cover_letter } = req.body;

    // Calculate match score
    const [[profile]] = await pool.query('SELECT skills FROM student_profiles WHERE user_id = ?', [studentId]);
    const match = calcMatchScore(profile?.skills, job.requirements);

    await pool.query(
      'INSERT INTO applications (job_id, student_id, cover_letter, match_score) VALUES (?, ?, ?, ?)',
      [jobId, studentId, cover_letter || '', match]
    );

    res.json({ success: true, match_score: match });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

// ✅ FIX: JOIN jobs and company_profiles so frontend gets job_title, company_name, type
async function getMyApplications(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT a.*,
              j.title       AS job_title,
              j.type,
              j.location,
              cp.company_name
       FROM applications a
       JOIN jobs j             ON j.id  = a.job_id
       LEFT JOIN company_profiles cp ON cp.user_id = j.company_id
       WHERE a.student_id = ?
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, applications: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

// ============================================================
// ASSESSMENTS  ✅ FIX: handlers were missing entirely
// ============================================================

async function getAssessments(req, res) {
  try {
    const [assessments] = await pool.query(
      `SELECT a.*,
        (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = a.id) AS question_count,
        (SELECT score FROM assessment_results WHERE student_id = ? AND assessment_id = a.id LIMIT 1) AS my_score
       FROM assessments a
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, assessments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

async function getAssessmentQuestions(req, res) {
  try {
    const [questions] = await pool.query(
      'SELECT id, question_text, options, question_type FROM assessment_questions WHERE assessment_id = ?',
      [req.params.id]
    );
    res.json({ success: true, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

async function submitAssessment(req, res) {
  try {
    const { answers } = req.body;
    const assessmentId = req.params.id;
    const studentId    = req.user.id;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers must be an array' });
    }

    // Fetch correct answers
    const [questions] = await pool.query(
      'SELECT id, correct_answer FROM assessment_questions WHERE assessment_id = ?',
      [assessmentId]
    );

    let score = 0;
    const total = questions.length;

    questions.forEach(q => {
      const answer = answers.find(a => a.question_id === q.id);
      if (answer && answer.answer === q.correct_answer) score++;
    });

    const percentage = total ? Math.round((score / total) * 100) : 0;
    const passed     = percentage >= 60;

    await pool.query(
      `INSERT INTO assessment_results (student_id, assessment_id, score, total, passed)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE score=VALUES(score), total=VALUES(total), passed=VALUES(passed), taken_at=NOW()`,
      [studentId, assessmentId, score, total, passed ? 1 : 0]
    );

    // Award points for passing
    if (passed) {
      await pool.query(
        'INSERT INTO student_points (student_id, points, reason) VALUES (?, 25, "Passed assessment")',
        [studentId]
      );
    }

    res.json({ success: true, score, total, percentage, passed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

// ============================================================
// POINTS & BADGES  ✅ FIX: handlers were missing entirely
// ============================================================

async function getPoints(req, res) {
  try {
    const [[{ total_points }]] = await pool.query(
      'SELECT COALESCE(SUM(points), 0) AS total_points FROM student_points WHERE student_id = ?',
      [req.user.id]
    );
    const [history] = await pool.query(
      'SELECT points, reason, awarded_at FROM student_points WHERE student_id = ? ORDER BY awarded_at DESC LIMIT 30',
      [req.user.id]
    );
    res.json({ success: true, total_points, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

async function getBadges(req, res) {
  try {
    const [all] = await pool.query('SELECT * FROM badges ORDER BY trigger_at ASC');
    const [earned] = await pool.query(
      `SELECT b.*, sb.earned_at
       FROM badges b
       JOIN student_badges sb ON sb.badge_id = b.id
       WHERE sb.student_id = ?`,
      [req.user.id]
    );
    res.json({ success: true, earned, all });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

// ============================================================
// CV ANALYSIS (simple version — full version is in aiController)
// ============================================================

async function analyzeCV(req, res) {
  try {
    const { cv_text } = req.body;

    if (!cv_text)
      return res.status(400).json({ success: false, message: 'Missing CV text' });

    let score = 40;

    if (cv_text.toLowerCase().includes('javascript')) score += 15;
    if (cv_text.toLowerCase().includes('react'))      score += 15;
    if (cv_text.toLowerCase().includes('project'))    score += 10;

    res.json({
      success: true,
      analysis: { score: Math.min(score, 100) }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

// ============================================================
// NOTIFICATIONS
// ============================================================

async function getNotifications(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, notifications: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, notifications: [] });
  }
}

async function markAllRead(req, res) {
  try {
    await pool.query(
      'UPDATE notifications SET is_read=1 WHERE user_id=?',
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

// ============================================================
// MENTORSHIP (Student side)
// ============================================================

async function getMentorshipPrograms(req, res) {
  try {
    const [programs] = await pool.query(
      `SELECT mp.*, cp.company_name, cp.logo_url, cp.industry,
         (SELECT COUNT(*) FROM mentorship_applications WHERE program_id = mp.id) AS applicant_count,
         (SELECT COUNT(*) FROM mentorship_applications WHERE program_id = mp.id AND status = 'accepted') AS accepted_count,
         (SELECT status FROM mentorship_applications WHERE program_id = mp.id AND student_id = ?) AS my_status
       FROM mentorship_programs mp
       LEFT JOIN company_profiles cp ON cp.user_id = mp.company_id
       WHERE mp.is_active = 1
       ORDER BY mp.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, programs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

async function applyToMentorship(req, res) {
  try {
    const { message } = req.body;
    const programId = req.params.id;
    const studentId = req.user.id;

    const [[prog]] = await pool.query(
      'SELECT * FROM mentorship_programs WHERE id = ? AND is_active = 1',
      [programId]
    );
    if (!prog) return res.status(404).json({ success: false, message: 'Program not found or is inactive' });

    // Check capacity
    const [[{ count }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM mentorship_applications WHERE program_id = ? AND status = 'accepted'",
      [programId]
    );
    if (count >= prog.capacity) {
      return res.status(409).json({ success: false, message: 'This program is already at full capacity' });
    }

    // Check already applied
    const [[existing]] = await pool.query(
      'SELECT id FROM mentorship_applications WHERE program_id = ? AND student_id = ?',
      [programId, studentId]
    );
    if (existing) return res.status(409).json({ success: false, message: 'You already applied to this program' });

    await pool.query(
      'INSERT INTO mentorship_applications (program_id, student_id, message) VALUES (?, ?, ?)',
      [programId, studentId, message || '']
    );

    // Notify the company
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [prog.company_id, '📩 New Mentorship Applicant', `A student applied to your program: "${prog.title}"`, 'info']
    );

    res.status(201).json({ success: true, message: 'Application submitted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

async function getMyMentorshipApplications(req, res) {
  try {
    const [applications] = await pool.query(
      `SELECT ma.*, mp.title AS program_title, mp.description AS program_description,
         cp.company_name, cp.logo_url, cp.industry
       FROM mentorship_applications ma
       JOIN mentorship_programs mp ON mp.id = ma.program_id
       LEFT JOIN company_profiles cp ON cp.user_id = mp.company_id
       WHERE ma.student_id = ?
       ORDER BY ma.applied_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, applications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getProfile,
  updateProfile,
  getCareerAdvice,

  getRoadmap,
  updateRoadmapStep,

  browseJobs,
  applyToJob,
  getMyApplications,

  getAssessments,
  getAssessmentQuestions,
  submitAssessment,

  getPoints,
  getBadges,

  analyzeCV,

  getMentorshipPrograms,
  applyToMentorship,
  getMyMentorshipApplications,

  getNotifications,
  markAllRead,
};
