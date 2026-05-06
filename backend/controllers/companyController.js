// controllers/companyController.js
const { pool } = require('../config/db');

// Helper: calculate match score
function calcMatch(studentSkills, jobReqs) {
  if (!studentSkills || !jobReqs) return 0;
  const s = studentSkills.toLowerCase().split(',').map(x => x.trim()).filter(Boolean);
  const j = jobReqs.toLowerCase().split(',').map(x => x.trim()).filter(Boolean);
  if (!j.length) return 50;
  const matched = j.filter(req => s.some(skill => skill.includes(req) || req.includes(skill)));
  return Math.round((matched.length / j.length) * 100);
}

// GET /api/company/profile
async function getProfile(req, res) {
  try {
    const [[profile]] = await pool.query(
      'SELECT cp.*, u.email FROM company_profiles cp JOIN users u ON u.id = cp.user_id WHERE cp.user_id = ?',
      [req.user.id]
    );
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// PUT /api/company/profile
async function updateProfile(req, res) {
  try {
    const { company_name, industry, location, website, description, logo_url, linkedin_url, twitter_url, employee_count, founded_year } = req.body;
    await pool.query(
      `UPDATE company_profiles
       SET company_name=?, industry=?, location=?, website=?, description=?,
           logo_url=?, linkedin_url=?, twitter_url=?, employee_count=?, founded_year=?
       WHERE user_id=?`,
      [company_name, industry, location, website, description, logo_url, linkedin_url, twitter_url, employee_count, founded_year, req.user.id]
    );
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// GET /api/company/jobs
async function getMyJobs(req, res) {
  try {
    const [jobs] = await pool.query(
      `SELECT j.*,
         (SELECT COUNT(*) FROM applications WHERE job_id = j.id) AS applicant_count,
         (SELECT COUNT(*) FROM applications WHERE job_id = j.id AND status = 'hired') AS hired_count
       FROM jobs j WHERE j.company_id = ? ORDER BY j.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// POST /api/company/jobs
async function createJob(req, res) {
  try {
    const { title, description, requirements, location, type, salary_range, deadline, is_internship } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Job title is required' });

    const [result] = await pool.query(
      `INSERT INTO jobs (company_id, title, description, requirements, location, type, salary_range, deadline, is_internship)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, description, requirements, location, type || 'full-time', salary_range, deadline || null, is_internship ? 1 : 0]
    );
    res.status(201).json({ success: true, jobId: result.insertId, message: 'Job posted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// PUT /api/company/jobs/:id
async function updateJob(req, res) {
  try {
    const { title, description, requirements, location, type, salary_range, deadline, is_active, is_internship } = req.body;

    // Make sure only the owner can edit
    const [[job]] = await pool.query('SELECT id FROM jobs WHERE id = ? AND company_id = ?', [req.params.id, req.user.id]);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or not yours' });

    await pool.query(
      `UPDATE jobs SET title=?, description=?, requirements=?, location=?, type=?,
         salary_range=?, deadline=?, is_active=?, is_internship=? WHERE id=?`,
      [title, description, requirements, location, type, salary_range, deadline || null, is_active ? 1 : 0, is_internship ? 1 : 0, req.params.id]
    );
    res.json({ success: true, message: 'Job updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// DELETE /api/company/jobs/:id
async function deleteJob(req, res) {
  try {
    const [[job]] = await pool.query('SELECT id FROM jobs WHERE id = ? AND company_id = ?', [req.params.id, req.user.id]);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found or not yours' });
    await pool.query('DELETE FROM jobs WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// GET /api/company/jobs/:id/applicants
async function getApplicants(req, res) {
  try {
    const [[job]] = await pool.query('SELECT * FROM jobs WHERE id = ? AND company_id = ?', [req.params.id, req.user.id]);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const { skills, status } = req.query;
    let q = `
      SELECT a.*, sp.full_name, sp.university, sp.major, sp.skills, sp.bio,
             sp.cv_link, sp.github_url, sp.linkedin_url, sp.experience_years,
             u.email,
             (SELECT COALESCE(SUM(score),0) FROM assessment_results WHERE student_id = a.student_id) AS assessment_total
      FROM applications a
      JOIN users u ON u.id = a.student_id
      LEFT JOIN student_profiles sp ON sp.user_id = a.student_id
      WHERE a.job_id = ?
    `;
    const params = [req.params.id];

    if (status) { q += ' AND a.status = ?'; params.push(status); }

    const [applicants] = await pool.query(q, params);

    // Add match score + filter by skills if requested
    let result = applicants.map(a => ({
      ...a,
      match_score: calcMatch(a.skills, job.requirements),
    }));

    if (skills) {
      const filterSkills = skills.toLowerCase().split(',').map(s => s.trim());
      result = result.filter(a =>
        filterSkills.some(fs => (a.skills || '').toLowerCase().includes(fs))
      );
    }

    result.sort((a, b) => b.match_score - a.match_score);
    res.json({ success: true, applicants: result, job });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// PUT /api/company/applications/:id/status
async function updateApplicationStatus(req, res) {
  try {
    const { status, interview_date, company_notes } = req.body;
    const valid = ['applied', 'interviewed', 'hired', 'rejected'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Verify this application belongs to one of this company's jobs
    const [[app]] = await pool.query(
      `SELECT a.*, j.title AS job_title FROM applications a
       JOIN jobs j ON j.id = a.job_id
       WHERE a.id = ? AND j.company_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    await pool.query(
      'UPDATE applications SET status=?, interview_date=?, company_notes=? WHERE id=?',
      [status, interview_date || null, company_notes || null, req.params.id]
    );

    // Notify the student
    const statusMessages = {
      interviewed: '📅 Interview Scheduled',
      hired: '🎉 You got the job!',
      rejected: '❌ Application Update',
    };
    if (statusMessages[status]) {
      const msg = {
        interviewed: `Your application for "${app.job_title}" moved to interview stage!${interview_date ? ` Interview on: ${new Date(interview_date).toLocaleDateString()}` : ''}`,
        hired: `Congratulations! You have been hired for "${app.job_title}".`,
        rejected: `Thank you for applying to "${app.job_title}". We've decided to move forward with other candidates.`,
      };
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [app.student_id, statusMessages[status], msg[status], status === 'hired' ? 'success' : status === 'rejected' ? 'error' : 'info']
      );
    }

    // If hired, trigger roadmap
    if (status === 'hired') {
      const [[step]] = await pool.query("SELECT id FROM roadmap_steps WHERE trigger_event = 'hired'");
      if (step) {
        await pool.query(
          `INSERT INTO roadmap_progress (student_id, step_id, status) VALUES (?, ?, 'completed')
           ON DUPLICATE KEY UPDATE status = 'completed'`,
          [app.student_id, step.id]
        );
      }
    }

    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// GET /api/company/analytics
async function getAnalytics(req, res) {
  try {
    const [jobs] = await pool.query(
      `SELECT j.id, j.title, j.type, j.is_active,
         (SELECT COUNT(*) FROM applications WHERE job_id = j.id) AS total_applicants,
         (SELECT COUNT(*) FROM applications WHERE job_id = j.id AND status = 'applied') AS applied_count,
         (SELECT COUNT(*) FROM applications WHERE job_id = j.id AND status = 'interviewed') AS interviewed_count,
         (SELECT COUNT(*) FROM applications WHERE job_id = j.id AND status = 'hired') AS hired_count,
         (SELECT COUNT(*) FROM applications WHERE job_id = j.id AND status = 'rejected') AS rejected_count,
         (SELECT AVG(match_score) FROM applications WHERE job_id = j.id) AS avg_match
       FROM jobs j WHERE j.company_id = ?
       ORDER BY total_applicants DESC`,
      [req.user.id]
    );

    const [[totals]] = await pool.query(
      `SELECT
         COUNT(DISTINCT j.id) AS total_jobs,
         COUNT(a.id) AS total_applications,
         SUM(a.status = 'hired') AS total_hired,
         AVG(a.match_score) AS avg_match_score
       FROM jobs j
       LEFT JOIN applications a ON a.job_id = j.id
       WHERE j.company_id = ?`,
      [req.user.id]
    );

    res.json({ success: true, jobs, totals });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// GET /api/company/mentorship
async function getMentorships(req, res) {
  try {
    const [programs] = await pool.query(
      `SELECT mp.*,
         (SELECT COUNT(*) FROM mentorship_applications WHERE program_id = mp.id) AS applicant_count,
         (SELECT COUNT(*) FROM mentorship_applications WHERE program_id = mp.id AND status = 'accepted') AS accepted_count
       FROM mentorship_programs mp
       WHERE mp.company_id = ?
       ORDER BY mp.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, programs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// POST /api/company/mentorship
async function createMentorship(req, res) {
  try {
    const { title, description, capacity } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
    const [result] = await pool.query(
      'INSERT INTO mentorship_programs (company_id, title, description, capacity) VALUES (?, ?, ?, ?)',
      [req.user.id, title, description, capacity || 10]
    );
    res.status(201).json({ success: true, id: result.insertId, message: 'Mentorship program created' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// PUT /api/company/mentorship/:id
async function updateMentorship(req, res) {
  try {
    const { title, description, capacity, is_active } = req.body;
    const [[prog]] = await pool.query(
      'SELECT id FROM mentorship_programs WHERE id = ? AND company_id = ?',
      [req.params.id, req.user.id]
    );
    if (!prog) return res.status(404).json({ success: false, message: 'Program not found' });

    await pool.query(
      'UPDATE mentorship_programs SET title=?, description=?, capacity=?, is_active=? WHERE id=?',
      [title, description, capacity, is_active ? 1 : 0, req.params.id]
    );
    res.json({ success: true, message: 'Program updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// DELETE /api/company/mentorship/:id
async function deleteMentorship(req, res) {
  try {
    const [[prog]] = await pool.query(
      'SELECT id FROM mentorship_programs WHERE id = ? AND company_id = ?',
      [req.params.id, req.user.id]
    );
    if (!prog) return res.status(404).json({ success: false, message: 'Program not found' });
    await pool.query('DELETE FROM mentorship_programs WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Program deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// GET /api/company/mentorship/:id/applicants
async function getMentorshipApplicants(req, res) {
  try {
    const [[prog]] = await pool.query(
      'SELECT * FROM mentorship_programs WHERE id = ? AND company_id = ?',
      [req.params.id, req.user.id]
    );
    if (!prog) return res.status(404).json({ success: false, message: 'Program not found' });

    const [applicants] = await pool.query(
      `SELECT ma.*, u.email AS student_email,
         sp.full_name, sp.university, sp.major, sp.skills, sp.cv_link, sp.linkedin_url
       FROM mentorship_applications ma
       JOIN users u ON u.id = ma.student_id
       LEFT JOIN student_profiles sp ON sp.user_id = ma.student_id
       WHERE ma.program_id = ?
       ORDER BY ma.applied_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, applicants, program: prog });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// PUT /api/company/mentorship/applications/:appId/status
async function updateMentorshipStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Verify the application belongs to this company's program
    const [[app]] = await pool.query(
      `SELECT ma.*, mp.title AS program_title FROM mentorship_applications ma
       JOIN mentorship_programs mp ON mp.id = ma.program_id
       WHERE ma.id = ? AND mp.company_id = ?`,
      [req.params.appId, req.user.id]
    );
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    await pool.query('UPDATE mentorship_applications SET status = ? WHERE id = ?', [status, req.params.appId]);

    // Notify student
    const notifMsg = {
      accepted: `🎉 You were accepted into the mentorship program: "${app.program_title}"!`,
      rejected: `Your mentorship application for "${app.program_title}" was not accepted this time.`,
    };
    if (notifMsg[status]) {
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [app.student_id,
          status === 'accepted' ? '✅ Mentorship Accepted!' : '📩 Mentorship Update',
          notifMsg[status],
          status === 'accepted' ? 'success' : 'info']
      );
    }

    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// POST /api/company/message/:studentId  (mock messaging)
async function sendMessageToStudent(req, res) {
  try {
    const { message, subject } = req.body;
    const [[cp]] = await pool.query('SELECT company_name FROM company_profiles WHERE user_id = ?', [req.user.id]);

    // Save as a notification to the student (mock messaging)
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [req.params.studentId, `📩 Message from ${cp?.company_name || 'a company'}: ${subject || 'New Message'}`, message, 'info']
    );
    res.json({ success: true, message: 'Message sent to student' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = {
  getProfile, updateProfile,
  getMyJobs, createJob, updateJob, deleteJob,
  getApplicants, updateApplicationStatus,
  getAnalytics,
  getMentorships, createMentorship, updateMentorship, deleteMentorship,
  getMentorshipApplicants, updateMentorshipStatus,
  sendMessageToStudent,
};
