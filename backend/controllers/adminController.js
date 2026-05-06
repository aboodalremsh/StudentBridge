// controllers/adminController.js
const { pool } = require('../config/db');

// GET /api/admin/stats
async function getStats(req, res) {
  try {
    const [[{ total_users }]]    = await pool.query('SELECT COUNT(*) AS total_users FROM users');
    const [[{ students }]]       = await pool.query("SELECT COUNT(*) AS students FROM users WHERE role='student'");
    const [[{ companies }]]      = await pool.query("SELECT COUNT(*) AS companies FROM users WHERE role='company'");
    const [[{ jobs }]]           = await pool.query('SELECT COUNT(*) AS jobs FROM jobs');
    const [[{ applications }]]   = await pool.query('SELECT COUNT(*) AS applications FROM applications');
    const [[{ courses }]]        = await pool.query('SELECT COUNT(*) AS courses FROM courses');
    const [[{ certificates }]]   = await pool.query('SELECT COUNT(*) AS certificates FROM certificates');
    const [[{ enrollments }]]    = await pool.query('SELECT COUNT(*) AS enrollments FROM enrollments');
    const [[{ total_points }]]   = await pool.query('SELECT COALESCE(SUM(points),0) AS total_points FROM student_points');
    const [[{ chat_messages }]]  = await pool.query('SELECT COUNT(*) AS chat_messages FROM chat_history');

    res.json({
      success: true,
      stats: { total_users, students, companies, jobs, applications, courses, certificates, enrollments, total_points, chat_messages }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// GET /api/admin/users
async function getAllUsers(req, res) {
  try {
    const { role, search } = req.query;
    let q = 'SELECT id, email, role, is_suspended, created_at FROM users WHERE 1=1';
    const params = [];
    if (role)   { q += ' AND role = ?';       params.push(role); }
    if (search) { q += ' AND email LIKE ?';   params.push(`%${search}%`); }
    q += ' ORDER BY created_at DESC';
    const [users] = await pool.query(q, params);
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// PUT /api/admin/users/:id/suspend
async function toggleSuspend(req, res) {
  try {
    const [[user]] = await pool.query('SELECT id, role, is_suspended FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot suspend another admin' });

    const newStatus = user.is_suspended ? 0 : 1;
    await pool.query('UPDATE users SET is_suspended = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({ success: true, message: newStatus ? 'User suspended' : 'User unsuspended' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// DELETE /api/admin/users/:id
async function deleteUser(req, res) {
  try {
    const [[user]] = await pool.query('SELECT id, role FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ success: false, message: 'Cannot delete an admin' });
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// GET /api/admin/companies
async function getCompanies(req, res) {
  try {
    const [companies] = await pool.query(
      `SELECT cp.*, u.email, u.is_suspended,
         (SELECT COUNT(*) FROM jobs WHERE company_id = cp.user_id) AS job_count,
         (SELECT COUNT(*) FROM applications a JOIN jobs j ON j.id=a.job_id WHERE j.company_id = cp.user_id) AS application_count
       FROM company_profiles cp JOIN users u ON u.id = cp.user_id
       ORDER BY cp.company_name`
    );
    res.json({ success: true, companies });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// GET /api/admin/jobs
async function getAllJobs(req, res) {
  try {
    const [jobs] = await pool.query(
      `SELECT j.*, cp.company_name,
         (SELECT COUNT(*) FROM applications WHERE job_id = j.id) AS applicant_count
       FROM jobs j LEFT JOIN company_profiles cp ON cp.user_id = j.company_id
       ORDER BY j.created_at DESC`
    );
    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// GET /api/admin/courses
async function getCourses(req, res) {
  try {
    const [courses] = await pool.query(
      `SELECT c.*,
         (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) AS lesson_count,
         (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) AS enrolled_count,
         (SELECT COUNT(*) FROM certificates WHERE course_id = c.id) AS cert_count
       FROM courses c ORDER BY c.created_at DESC`
    );
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// POST /api/admin/courses
async function createCourse(req, res) {
  try {
    const { title, description, category, level, duration, price, instructor, skills_taught } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
    const [result] = await pool.query(
      'INSERT INTO courses (title, description, category, level, duration, price, instructor, skills_taught, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, category, level||'beginner', duration, price||0, instructor, skills_taught, req.user.id]
    );
    res.status(201).json({ success: true, courseId: result.insertId, message: 'Course created' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// PUT /api/admin/courses/:id
async function updateCourse(req, res) {
  try {
    const { title, description, category, level, duration, price, instructor, skills_taught, is_active } = req.body;
    await pool.query(
      'UPDATE courses SET title=?, description=?, category=?, level=?, duration=?, price=?, instructor=?, skills_taught=?, is_active=? WHERE id=?',
      [title, description, category, level, duration, price, instructor, skills_taught, is_active ? 1 : 0, req.params.id]
    );
    res.json({ success: true, message: 'Course updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// DELETE /api/admin/courses/:id
async function deleteCourse(req, res) {
  try {
    await pool.query('DELETE FROM courses WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// POST /api/admin/courses/:id/lessons
async function addLesson(req, res) {
  try {
    const { title, content, duration, order_index } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title required' });
    await pool.query(
      'INSERT INTO lessons (course_id, title, content, duration, order_index) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, title, content, duration, order_index || 0]
    );
    res.status(201).json({ success: true, message: 'Lesson added' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// DELETE /api/admin/courses/:courseId/lessons/:lessonId
async function deleteLesson(req, res) {
  try {
    await pool.query('DELETE FROM lessons WHERE id = ? AND course_id = ?', [req.params.lessonId, req.params.courseId]);
    res.json({ success: true, message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// Assessments (CRUD) ──────────────────────────────────────
async function getAssessments(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = a.id) AS q_count
       FROM assessments a ORDER BY a.created_at DESC`
    );
    res.json({ success: true, assessments: rows });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
}
async function createAssessment(req, res) {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title required' });
    const [r] = await pool.query('INSERT INTO assessments (title, description, created_by) VALUES (?, ?, ?)', [title, description, req.user.id]);
    res.status(201).json({ success: true, id: r.insertId });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
}
async function updateAssessment(req, res) {
  try {
    const { title, description } = req.body;
    await pool.query('UPDATE assessments SET title=?, description=? WHERE id=?', [title, description, req.params.id]);
    res.json({ success: true, message: 'Updated' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
}
async function deleteAssessment(req, res) {
  try {
    await pool.query('DELETE FROM assessments WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
}
async function getQuestions(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM assessment_questions WHERE assessment_id = ?', [req.params.id]);
    res.json({ success: true, questions: rows });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
}
async function addQuestion(req, res) {
  try {
    const { question_text, options, correct_answer, question_type } = req.body;
    if (!question_text) return res.status(400).json({ success: false, message: 'Question text required' });
    await pool.query(
      'INSERT INTO assessment_questions (assessment_id, question_text, options, correct_answer, question_type) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, question_text, JSON.stringify(options || []), correct_answer, question_type || 'mcq']
    );
    res.status(201).json({ success: true, message: 'Question added' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
}
async function deleteQuestion(req, res) {
  try {
    await pool.query('DELETE FROM assessment_questions WHERE id = ? AND assessment_id = ?', [req.params.qId, req.params.id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
}

// GET /api/admin/applications
async function getApplications(req, res) {
  try {
    const [applications] = await pool.query(
      `SELECT a.*,
         u.email  AS student_email,
         j.title  AS job_title,
         j.type,
         cp.company_name
       FROM applications a
       JOIN users u              ON u.id  = a.student_id
       JOIN jobs j               ON j.id  = a.job_id
       LEFT JOIN company_profiles cp ON cp.user_id = j.company_id
       ORDER BY a.applied_at DESC`
    );
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// GET /api/admin/enrollments
async function getEnrollments(req, res) {
  try {
    const [enrollments] = await pool.query(
      `SELECT e.*,
         u.email   AS student_email,
         c.title   AS course_title,
         c.category
       FROM enrollments e
       JOIN users u   ON u.id  = e.student_id
       JOIN courses c ON c.id  = e.course_id
       ORDER BY e.enrolled_at DESC`
    );
    res.json({ success: true, enrollments });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// Certificates management
async function getCertificates(req, res) {
  try {
    const [certs] = await pool.query(
      `SELECT cert.*, c.title AS course_title, sp.full_name, u.email
       FROM certificates cert
       JOIN courses c ON c.id = cert.course_id
       JOIN users u ON u.id = cert.student_id
       LEFT JOIN student_profiles sp ON sp.user_id = cert.student_id
       ORDER BY cert.issued_at DESC`
    );
    res.json({ success: true, certificates: certs });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
}

module.exports = {
  getStats, getAllUsers, toggleSuspend, deleteUser,
  getCompanies, getAllJobs,
  getApplications, getEnrollments,
  getCourses, createCourse, updateCourse, deleteCourse, addLesson, deleteLesson,
  getAssessments, createAssessment, updateAssessment, deleteAssessment, getQuestions, addQuestion, deleteQuestion,
  getCertificates,
};
