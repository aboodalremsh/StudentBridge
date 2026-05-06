# 🎓 StudentBridge

> A full-stack career platform connecting university students with companies — built as a graduation project.

---

## 📌 Project Description

**StudentBridge** is a full-stack web application that bridges the gap between university students and the job market. It provides students with the tools they need to build their careers — from applying to jobs and enrolling in courses, to receiving AI-assisted career guidance and earning certificates.

Companies can post job listings, manage applicants, and run mentorship programs. An admin panel provides full platform oversight including user management, course creation, and system statistics.

> ⚠️ **Note:** All AI-powered features (Career Advisor, CV Analyzer, Chat) are **rule-based simulations powered by the GROQ API**. They do not use real machine learning models trained specifically for this project. Outputs are AI-generated responses from a general-purpose language model (llama3-8b-8192) using structured prompts.

---

## 👥 System Roles

| Role | Description |
|---|---|
| **Student** | Searches for jobs, enrolls in courses, receives AI career guidance |
| **Company** | Posts jobs, manages applicants, creates mentorship programs |
| **Admin** | Manages the entire platform — users, courses, jobs, and statistics |

---

## ✨ Features

### 🎓 Student
- Profile management (bio, skills, links, avatar upload with image compression)
- Job search with skill-based match scoring
- Job application with cover letter
- Application status tracking (Applied → Interviewed → Hired / Rejected)
- View company profile before applying
- Course enrollment and lesson completion
- Mock certificate generation upon course completion
- AI Career Advisor — goal-driven recommendations (8 career paths)
- CV Analyzer — keyword scoring with strengths, weaknesses, and suggestions
- AI Chat with real-time conversation via Socket.io
- Career Roadmap — 7-step guided progress tracker
- Skill Assessments (MCQ)
- Real-time notifications
- Points and Badges gamification system
- Mentorship program applications

### 🏢 Company
- Company profile management (logo upload: URL or file)
- Post, edit, and delete job listings
- View and manage applicants per job
- Update application status per candidate
- Basic hiring analytics
- Create and manage mentorship programs
- Mock messaging to student applicants

### ⚙️ Admin
- Full user management (suspend, delete, filter by role)
- Course and lesson management (create, edit, delete)
- Skill assessment management (MCQ questions)
- Certificate tracking
- Application and enrollment overview pages
- System statistics dashboard (4 unique sections)
- CSV export for platform reports

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 (functional components, hooks) |
| **Backend** | Node.js + Express.js |
| **Database** | MySQL 8 |
| **Authentication** | JWT (JSON Web Tokens) + bcrypt |
| **Real-time** | Socket.io v4 |
| **AI (via API)** | GROQ API — llama3-8b-8192 |
| **Email** | SendGrid |
| **HTTP Client** | Axios |
| **Routing** | React Router v6 |
| **Styling** | Custom CSS (dark theme design system) |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Client)                  │
│              React 18 + React Router v6              │
│         Axios HTTP Client + Socket.io Client         │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼──────────────────────────────┐
│               Node.js + Express.js API               │
│         REST endpoints + Socket.io Server            │
│   JWT Middleware · bcrypt · SendGrid · GROQ API      │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                   MySQL 8 Database                   │
│               23 relational tables                   │
│    Users · Jobs · Courses · Assessments · Points     │
│    Mentorship · Chat · Notifications · Certificates  │
└─────────────────────────────────────────────────────┘
```

### Database Tables (23)

`users` · `student_profiles` · `company_profiles` · `jobs` · `applications` · `courses` · `lessons` · `enrollments` · `lesson_progress` · `certificates` · `assessments` · `assessment_questions` · `assessment_results` · `roadmap_steps` · `roadmap_progress` · `student_points` · `badges` · `student_badges` · `chat_history` · `cv_analysis_history` · `notifications` · `mentorship_programs` · `mentorship_applications`

---

## 📁 Project Structure

```
sb2_fixed/
├── schema.sql                  ← Full database schema + seed data
├── alter_image_columns.sql     ← Migration file (run if DB already exists)
│
├── backend/
│   ├── server.js               ← Express app entry point
│   ├── .env                    ← Environment variables
│   ├── config/db.js            ← MySQL connection pool
│   ├── middleware/auth.js      ← JWT protection middleware
│   ├── controllers/            ← Business logic (auth, student, company, admin, AI, learning)
│   └── routes/                 ← API route definitions
│
└── frontend/
    └── src/
        ├── App.js              ← All routes (40+)
        ├── socket.js           ← Socket.io client
        ├── services/           ← Axios API service functions
        ├── context/            ← AuthContext (global auth state)
        ├── components/         ← Reusable components (DashboardLayout, Sidebar, Footer)
        └── pages/              ← All page components by role
```

---

## 🚀 Installation

### Prerequisites

- Node.js v18+
- MySQL 8
- npm

---

### Step 1 — Database Setup

**Fresh install:**
```bash
mysql -u root -p < sb2_fixed/schema.sql
```

**Already have the database from a previous version? Run the migration:**
```bash
mysql -u root -p studentbridge2 < sb2_fixed/alter_image_columns.sql
```

---

### Step 2 — Backend Setup

```bash
cd sb2_fixed/backend
npm install
```

Create your `.env` file (see Environment Variables section below), then start the server:

```bash
node server.js
```

The API will run at: `http://localhost:5000`

---

### Step 3 — Frontend Setup

```bash
cd sb2_fixed/frontend
npm install
npm start
```

The app will run at: `http://localhost:3000`

All `/api/*` calls are automatically proxied to port 5000.

---

## ⚙️ Environment Variables

Create a file named `.env` inside `sb2_fixed/backend/`:

```env
# Server
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=studentbridge2

# Authentication
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS
CLIENT_ORIGIN=http://localhost:3000
CLIENT_URL=http://localhost:3000

# GROQ AI (required for Career Advisor, CV Analyzer, and Chat)
# Get your free key at: https://console.groq.com
GROQ_API_KEY=your_groq_api_key_here

# SendGrid (required for password reset emails)
# Get your key at: https://sendgrid.com
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_EMAIL=your_verified_sender@email.com
RECEIVER_EMAIL=your_receiving_email@email.com
```

> **Tip:** If you don't have GROQ or SendGrid keys, the rest of the platform works without them. Only the AI chat, CV analyzer, career advisor, and password reset features will be unavailable.

---

## 👤 Demo Accounts

All demo accounts use the password: **`password`**

| Role | Email |
|---|---|
| Admin | admin@studentbridge.com |
| Student | sara.ali@student.edu |
| Student | omar.hassan@student.edu |
| Student | lena.khoury@student.edu |
| Student | karim.nassar@student.edu |
| Student | maya.saleh@student.edu |
| Student | jad.rami@student.edu |
| Company | hr@techcorp.com |
| Company | jobs@digitalnova.com |
| Company | recruit@futuresoft.com |
| Company | team@cloudbuild.io |
| Company | careers@databridge.ai |
| Company | hello@pixelstudio.design |

---

## 📸 Screenshots

> Replace the placeholders below with actual screenshots of your running application.

| Page | Preview |
|---|---|
| Home (Landing Page) | `screenshots/home.png` |
| Student Dashboard | `screenshots/student-dashboard.png` |
| Browse Jobs | `screenshots/browse-jobs.png` |
| Learning Hub | `screenshots/learning-hub.png` |
| AI Career Advisor | `screenshots/ai-advisor.png` |
| CV Analyzer | `screenshots/cv-analyzer.png` |
| Company Dashboard | `screenshots/company-dashboard.png` |
| Admin Dashboard | `screenshots/admin-dashboard.png` |
| Admin Statistics | `screenshots/admin-stats.png` |

---

## 🔮 Future Improvements

These features were not implemented in v2.0 but are planned for future versions:

- **Real Payment Gateway** — Integrate Stripe or PayPal for paid course enrollment instead of the current mock payment form
- **Resume Builder** — An in-app tool to generate a formatted PDF resume from the student profile
- **Video Lessons** — Embed real video content into the Learning Hub course player
- **Mobile App** — React Native version for iOS and Android
- **Real-time Notifications** — Replace polling with live Socket.io push notifications
- **Advanced Analytics** — Charts and graphs for company hiring funnels and student engagement
- **Email Notifications** — Automated email alerts for application status changes and new job matches
- **Multi-language Support** — Arabic and French language options for Lebanese users
- **Google OAuth** — Sign in with Google for faster onboarding
- **Real AI Models** — Replace the current GROQ API prompting approach with purpose-built ML models trained on career data

---

## ⚠️ Important Notes

- **AI Features use GROQ API** — The Career Advisor, CV Analyzer, and Chat features call the GROQ API (llama3-8b-8192). They are not custom-trained models. Results are general AI responses shaped by structured prompts.
- **Payments are Mocked** — The checkout page simulates a Visa payment. No real payment gateway is integrated.
- **Certificates are Mock** — Certificates are generated with a unique ID stored in the database but are not cryptographically signed or officially recognised.
- **Email requires SendGrid** — Password reset emails will not work without a valid SendGrid API key and a verified sender email.

---

## 📄 License

This project was built as a **graduation project** for academic purposes.
It is not licensed for commercial use.

---

## 🙏 Acknowledgements

- [GROQ](https://groq.com) — for the free AI API used in career guidance features
- [SendGrid](https://sendgrid.com) — for the email service
- [Socket.io](https://socket.io) — for real-time chat functionality
- [React](https://react.dev) — for the frontend framework
- [Express.js](https://expressjs.com) — for the backend API framework

---

<div align="center">

**StudentBridge v2.0** — Graduation Project

Built with React · Node.js · MySQL · GROQ AI

© 2026 StudentBridge — All rights reserved.

</div>
