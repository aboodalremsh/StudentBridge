require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const { testConnection } = require('./config/db');

// ── Routes ────────────────────────────────────────────────
const authRoutes     = require('./routes/auth');
const studentRoutes  = require('./routes/student');
const learningRoutes = require('./routes/learning');
const companyRoutes  = require('./routes/company');
const adminRoutes    = require('./routes/admin');
const jobRoutes      = require('./routes/jobs');       // ✅ FIX: was missing
const aiRoutes       = require('./routes/ai');          // ✅ FIX: was missing
const chatRoutes     = require('./routes/chatRoutes');
const contactRoutes = require('./routes/contact');

const app = express();
const server = http.createServer(app);

// ── SOCKET.IO SETUP ───────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }
});

const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('🔌 user connected:', socket.id);

  socket.on('join', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`👤 user ${userId} joined socket room`);
  });

  socket.on('disconnect', () => {
    for (const [userId, sockId] of userSockets.entries()) {
      if (sockId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
    console.log('❌ user disconnected:', socket.id);
  });
});

app.set('io', io);

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/student',  studentRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/company',  companyRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/jobs',     jobRoutes);    // ✅ FIX: jobs route now mounted
app.use('/api/ai',       aiRoutes);     // ✅ FIX: AI route now mounted
app.use('/api',          chatRoutes);   // POST /api/chat (GROQ)
app.use('/api/contact', contactRoutes);

// ── 404 handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// ── START SERVER ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await testConnection();
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`📋 Health: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  }
})();
