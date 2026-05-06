// middleware/auth.js - JWT authentication + role check
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Verify the JWT token from the Authorization header
async function protect(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized — please log in' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB to make sure they're still active
    const [[user]] = await pool.query(
      'SELECT id, email, role, is_suspended FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    if (user.is_suspended) return res.status(403).json({ success: false, message: 'Account is suspended' });

    req.user = user; // attach user to request
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
  }
}

// Check that the user has one of the allowed roles
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied — ${req.user.role} cannot access this resource`
      });
    }
    next();
  };
}

module.exports = { protect, authorize };
