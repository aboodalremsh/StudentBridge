const express = require('express');
const router = express.Router();

const { chatWithAI } = require('../controllers/chatController');
const { protect } = require('../middleware/auth'); // ✅ FIX: added auth middleware

// POST /api/chat — requires login so req.user.id is available for profile fetch
router.post('/chat', protect, chatWithAI);

module.exports = router;
