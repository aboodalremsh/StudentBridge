const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { sendEmail } = require('../utils/sendEmail');

// =======================
// JWT HELPER
// =======================
function signToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// =======================
// POINTS SYSTEM
// =======================
async function awardPoints(studentId, points, reason) {
  await pool.query(
    'INSERT INTO student_points (student_id, points, reason) VALUES (?, ?, ?)',
    [studentId, points, reason]
  );

  const [[{ total }]] = await pool.query(
    'SELECT COALESCE(SUM(points), 0) AS total FROM student_points WHERE student_id = ?',
    [studentId]
  );

  const [badges] = await pool.query(
    'SELECT * FROM badges WHERE trigger_at <= ? ORDER BY trigger_at DESC',
    [total]
  );

  for (const badge of badges) {
    await pool.query(
      'INSERT IGNORE INTO student_badges (student_id, badge_id) VALUES (?, ?)',
      [studentId, badge.id]
    );
  }
}

// =======================
// REGISTER
// =======================
async function register(req, res) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const validRoles = ['student', 'company'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be student or company'
      });
    }

    const [[existing]] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered'
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, password_hash, role]
    );

    const userId = result.insertId;

    if (role === 'student') {
      await pool.query(
        'INSERT INTO student_profiles (user_id) VALUES (?)',
        [userId]
      );

      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [
          userId,
          '👋 Welcome to StudentBridge!',
          'Your account is ready. Start using the platform.',
          'success'
        ]
      );
    } else {
      await pool.query(
        'INSERT INTO company_profiles (user_id) VALUES (?)',
        [userId]
      );
    }

    const token = signToken(userId, role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: userId,
        email,
        role
      }
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
}
// =======================
// LOGIN (FIXED & SAFE)
// =======================
async function login(req, res) {
  try {
    console.log("LOGIN HIT");
    console.log("BODY:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required'
      });
    }

    const [rows] = await pool.query(
      'SELECT id, email, password_hash, role, is_suspended FROM users WHERE email = ?',
      [email]
    );

    const user = rows[0];

    console.log("USER FOUND:", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.is_suspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended'
      });
    }

    console.log("INPUT PASSWORD:", password);
    console.log("HASH FROM DB:", user.password_hash);

    const isMatch = await bcrypt.compare(password, user.password_hash);

    console.log("PASSWORD MATCH RESULT:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = signToken(user.id, user.role);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
}
// =======================
// FORGOT PASSWORD
// =======================
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required"
      });
    }

    const [[user]] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.json({
        success: true,
        message: "If email exists, reset link sent"
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expire = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?',
      [resetToken, user.id]
    );

    // ✅ FIXED: frontend URL instead of backend URL
    const frontendURL = process.env.CLIENT_URL || 'http://localhost:3000';

    const resetUrl = `${frontendURL}/reset-password/${resetToken}`;

    await sendEmail(
      email,
      "Reset your password",
      `
        <h2>Password Reset</h2>
        <p>Click below to reset:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Expires in 15 minutes</p>
      `
    );

    res.json({
      success: true,
      message: "Reset email sent"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}

// =======================
// RESET PASSWORD
// =======================
async function resetPassword(req, res) {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password required"
      });
    }

    const [[user]] = await pool.query(
      'SELECT id FROM users WHERE reset_token = ? AND reset_token_expire > NOW()',
      [token]
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expire = NULL WHERE id = ?',
      [hashed, user.id]
    );

    res.json({
      success: true,
      message: "Password reset successful"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}

// =======================
// GET ME
// =======================
async function getMe(req, res) {
  res.json({ success: true, user: req.user });
}

// =======================
// EXPORTS
// =======================
module.exports = {
  register,
  login,
  getMe,
  awardPoints,
  forgotPassword,
  resetPassword
};