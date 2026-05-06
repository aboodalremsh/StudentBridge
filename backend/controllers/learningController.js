// controllers/learningController.js - Handles courses, enrollments, lessons, certificates
const { pool } = require('../config/db');
const crypto = require('crypto');
const { awardPoints } = require('./authController');

function generateUID() {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
}

async function triggerRoadmap(studentId, event) {
  const [[step]] = await pool.query(
    'SELECT id FROM roadmap_steps WHERE trigger_event = ?', [event]
  );
  if (step) {
    await pool.query(
      `INSERT INTO roadmap_progress (student_id, step_id, status) VALUES (?, ?, 'completed')
       ON DUPLICATE KEY UPDATE status = 'completed'`,
      [studentId, step.id]
    );
  }
}

// GET /api/learning/courses
async function getCourses(req, res) {
  try {
    const { category, level, search } = req.query;
    let q = `
      SELECT c.*,
        (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) AS lesson_count,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) AS enrolled_count
      FROM courses c WHERE c.is_active = 1
    `;
    const params = [];
    if (category) { q += ' AND c.category = ?'; params.push(category); }
    if (level)    { q += ' AND c.level = ?';    params.push(level); }
    if (search)   { q += ' AND c.title LIKE ?'; params.push(`%${search}%`); }
    q += ' ORDER BY c.created_at DESC';

    const [courses] = await pool.query(q, params);

    // If student, mark which they own
    if (req.user?.role === 'student') {
      const [enrs] = await pool.query(
        'SELECT course_id FROM enrollments WHERE student_id = ?', [req.user.id]
      );
      const owned = new Set(enrs.map(e => e.course_id));
      courses.forEach(c => { c.is_enrolled = owned.has(c.id); });
    }

    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// GET /api/learning/courses/:id
async function getCourse(req, res) {
  try {
    const [[course]] = await pool.query(
      `SELECT c.*, (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) AS lesson_count
       FROM courses c WHERE c.id = ?`, [req.params.id]
    );
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const [lessons] = await pool.query(
      'SELECT id, title, duration, order_index FROM lessons WHERE course_id = ? ORDER BY order_index',
      [req.params.id]
    );

    let isEnrolled = false;
    if (req.user?.role === 'student') {
      const [[enr]] = await pool.query(
        'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?',
        [req.user.id, req.params.id]
      );
      isEnrolled = !!enr;
    }
    res.json({ success: true, course, lessons, is_enrolled: isEnrolled });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// POST /api/learning/courses/:id/enroll  (simulated payment)
async function enrollCourse(req, res) {
  try {
    const courseId  = req.params.id;
    const studentId = req.user.id;
    const { card_number, card_name, expiry, cvv } = req.body;

    const [[course]] = await pool.query('SELECT * FROM courses WHERE id = ? AND is_active = 1', [courseId]);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const [[existing]] = await pool.query(
      'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?', [studentId, courseId]
    );
    if (existing) return res.status(409).json({ success: false, message: 'Already enrolled' });

    // Simulate payment validation for paid courses
    if (course.price > 0) {
      if (!card_number || !card_name || !expiry || !cvv) {
        return res.status(400).json({ success: false, message: 'All payment fields are required' });
      }
      const cleanCard = card_number.replace(/\s/g, '');
      if (!/^\d{16}$/.test(cleanCard)) {
        return res.status(400).json({ success: false, message: 'Card number must be 16 digits' });
      }
      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        return res.status(400).json({ success: false, message: 'Expiry must be MM/YY format' });
      }
      if (!/^\d{3,4}$/.test(cvv)) {
        return res.status(400).json({ success: false, message: 'CVV must be 3-4 digits' });
      }
    }

    const payStatus = course.price > 0 ? 'paid' : 'free';
    await pool.query(
      'INSERT INTO enrollments (student_id, course_id, payment_status, amount_paid) VALUES (?, ?, ?, ?)',
      [studentId, courseId, payStatus, course.price]
    );

    await awardPoints(studentId, 20, `Enrolled in: ${course.title}`);
    await triggerRoadmap(studentId, 'first_enrollment');

    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [studentId, '🎓 Course Enrolled!', `You enrolled in "${course.title}". Start learning now!`, 'success']
    );

    res.status(201).json({ success: true, message: `Enrolled in "${course.title}" successfully!` });
  } catch (err) {
    console.error('enrollCourse error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// GET /api/learning/courses/:id/lessons  (enrolled students only)
async function getCourseLessons(req, res) {
  try {
    const courseId  = req.params.id;
    const studentId = req.user.id;

    const [[enr]] = await pool.query(
      'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?', [studentId, courseId]
    );
    if (!enr) return res.status(403).json({ success: false, message: 'You must enroll first' });

    const [lessons] = await pool.query(
      `SELECT l.*, COALESCE(lp.is_completed, 0) AS is_completed, lp.completed_at
       FROM lessons l
       LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = ?
       WHERE l.course_id = ? ORDER BY l.order_index`,
      [studentId, courseId]
    );

    const total     = lessons.length;
    const completed = lessons.filter(l => l.is_completed).length;
    const pct       = total ? Math.round((completed / total) * 100) : 0;

    res.json({ success: true, lessons, progress: { total, completed, percentage: pct } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// PUT /api/learning/courses/:courseId/lessons/:lessonId/complete
async function completeLesson(req, res) {
  try {
    const { courseId, lessonId } = req.params;
    const studentId = req.user.id;

    const [[enr]] = await pool.query(
      'SELECT id FROM enrollments WHERE student_id = ? AND course_id = ?', [studentId, courseId]
    );
    if (!enr) return res.status(403).json({ success: false, message: 'Not enrolled' });

    await pool.query(
      `INSERT INTO lesson_progress (student_id, lesson_id, course_id, is_completed, completed_at)
       VALUES (?, ?, ?, 1, NOW())
       ON DUPLICATE KEY UPDATE is_completed=1, completed_at=NOW()`,
      [studentId, lessonId, courseId]
    );

    // Check if entire course is done
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM lessons WHERE course_id = ?', [courseId]);
    const [[{ done }]]  = await pool.query(
      'SELECT COUNT(*) AS done FROM lesson_progress WHERE student_id = ? AND course_id = ? AND is_completed = 1',
      [studentId, courseId]
    );

    let certificate_uid = null;
    if (done >= total) {
      const [[existing]] = await pool.query(
        'SELECT certificate_uid FROM certificates WHERE student_id = ? AND course_id = ?',
        [studentId, courseId]
      );
      if (existing) {
        certificate_uid = existing.certificate_uid;
      } else {
        certificate_uid = generateUID();
        await pool.query(
          'INSERT INTO certificates (student_id, course_id, certificate_uid) VALUES (?, ?, ?)',
          [studentId, courseId, certificate_uid]
        );
        await awardPoints(studentId, 100, 'Completed a course — certificate issued');
        await triggerRoadmap(studentId, 'course_completed');
        const [[course]] = await pool.query('SELECT title FROM courses WHERE id = ?', [courseId]);
        await pool.query(
          'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
          [studentId, '🏆 Certificate Issued!', `You completed "${course.title}" and earned your certificate!`, 'success']
        );
      }
    }

    res.json({
      success: true,
      message: 'Lesson completed!',
      course_complete: done >= total,
      certificate_uid,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// GET /api/learning/my-courses
async function getMyCourses(req, res) {
  try {
    const [courses] = await pool.query(
      `SELECT c.id, c.title, c.category, c.level, c.instructor, c.price,
         e.enrolled_at, e.amount_paid,
         (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) AS total_lessons,
         (SELECT COUNT(*) FROM lesson_progress WHERE student_id = ? AND course_id = c.id AND is_completed = 1) AS completed_lessons,
         (SELECT certificate_uid FROM certificates WHERE student_id = ? AND course_id = c.id LIMIT 1) AS certificate_uid
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.student_id = ?
       ORDER BY e.enrolled_at DESC`,
      [req.user.id, req.user.id, req.user.id]
    );
    const result = courses.map(c => ({
      ...c,
      progress: c.total_lessons ? Math.round((c.completed_lessons / c.total_lessons) * 100) : 0,
      is_complete: c.total_lessons > 0 && c.completed_lessons >= c.total_lessons,
    }));
    res.json({ success: true, courses: result });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// GET /api/learning/my-certificates
async function getMyCertificates(req, res) {
  try {
    const [certs] = await pool.query(
      `SELECT cert.*, c.title AS course_title, c.instructor,
              sp.full_name AS student_name
       FROM certificates cert
       JOIN courses c ON c.id = cert.course_id
       LEFT JOIN student_profiles sp ON sp.user_id = cert.student_id
       WHERE cert.student_id = ? ORDER BY cert.issued_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, certificates: certs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// GET /api/learning/certificates/:uid  (public verification)
async function verifyCertificate(req, res) {
  try {
    const [[cert]] = await pool.query(
      `SELECT cert.*, c.title AS course_title, c.instructor,
              sp.full_name AS student_name, u.email
       FROM certificates cert
       JOIN courses c ON c.id = cert.course_id
       JOIN users u ON u.id = cert.student_id
       LEFT JOIN student_profiles sp ON sp.user_id = cert.student_id
       WHERE cert.certificate_uid = ?`,
      [req.params.uid]
    );
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ── COURSE RECOMMENDATIONS (simple logic) ────────────────
// GET /api/learning/recommendations
async function getRecommendations(req, res) {
  try {
    const studentId = req.user.id;

    // Get student skills and enrolled courses
    const [[profile]] = await pool.query('SELECT skills FROM student_profiles WHERE user_id = ?', [studentId]);
    const [enrolled]  = await pool.query('SELECT course_id FROM enrollments WHERE student_id = ?', [studentId]);
    const enrolledIds = enrolled.map(e => e.course_id);

    const skills = (profile?.skills || '').toLowerCase();

    // Get all courses not yet enrolled in
    const [allCourses] = await pool.query(
      'SELECT * FROM courses WHERE is_active = 1' +
      (enrolledIds.length ? ` AND id NOT IN (${enrolledIds.join(',')})` : ''),
    );

    // Score each course by skill relevance
    const scored = allCourses.map(c => {
      const courseSkills = (c.skills_taught || '').toLowerCase().split(',');
      const matches = courseSkills.filter(s => skills.includes(s.trim()) || s.trim().length < 4).length;
      // Prefer courses that complement what they know
      return { ...c, relevance_score: matches };
    });

    // Sort by: free first, then by relevance
    scored.sort((a, b) => {
      if (a.price === 0 && b.price > 0) return -1;
      if (b.price === 0 && a.price > 0) return 1;
      return b.relevance_score - a.relevance_score;
    });

    res.json({ success: true, recommendations: scored.slice(0, 4) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}

module.exports = {
  getCourses, getCourse, enrollCourse,
  getCourseLessons, completeLesson,
  getMyCourses, getMyCertificates, verifyCertificate,
  getRecommendations,
};
