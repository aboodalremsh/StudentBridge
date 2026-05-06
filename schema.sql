-- ============================================================
--  StudentBridge v2.0 — Complete Database Schema
--  Run: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS studentbridge2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE studentbridge2;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','company','admin') NOT NULL DEFAULT 'student',
  is_suspended TINYINT(1) NOT NULL DEFAULT 0,
  reset_token VARCHAR(255) DEFAULT NULL,
  reset_token_expire DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  full_name VARCHAR(255),
  university VARCHAR(255),
  major VARCHAR(255),
  skills TEXT,
  bio TEXT,
  cv_link VARCHAR(500),
  avatar_url MEDIUMTEXT,
  github_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  experience_years INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS company_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  company_name VARCHAR(255),
  industry VARCHAR(255),
  location VARCHAR(255),
  website VARCHAR(500),
  description TEXT,
  logo_url MEDIUMTEXT,
  linkedin_url VARCHAR(500),
  twitter_url VARCHAR(500),
  employee_count VARCHAR(50),
  founded_year INT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  requirements TEXT,
  location VARCHAR(255),
  type ENUM('full-time','part-time','internship','remote','project') DEFAULT 'full-time',
  salary_range VARCHAR(100),
  deadline DATE,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_internship TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  student_id INT NOT NULL,
  cover_letter TEXT,
  status ENUM('applied','interviewed','hired','rejected') DEFAULT 'applied',
  match_score INT DEFAULT 0,
  interview_date DATETIME,
  company_notes TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_application (job_id, student_id),
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  level ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
  duration VARCHAR(50),
  price DECIMAL(8,2) DEFAULT 0.00,
  thumbnail VARCHAR(500),
  instructor VARCHAR(255),
  skills_taught TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lessons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  duration VARCHAR(50),
  order_index INT DEFAULT 0,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  payment_status ENUM('free','paid') DEFAULT 'free',
  amount_paid DECIMAL(8,2) DEFAULT 0.00,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_enrollment (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  lesson_id INT NOT NULL,
  course_id INT NOT NULL,
  is_completed TINYINT(1) DEFAULT 0,
  completed_at TIMESTAMP NULL,
  UNIQUE KEY unique_lp (student_id, lesson_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  certificate_uid VARCHAR(64) UNIQUE NOT NULL,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_cert (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assessments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS assessment_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assessment_id INT NOT NULL,
  question_text TEXT NOT NULL,
  options JSON,
  correct_answer VARCHAR(255),
  question_type ENUM('mcq','open') DEFAULT 'mcq',
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assessment_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  assessment_id INT NOT NULL,
  score INT DEFAULT 0,
  total INT DEFAULT 0,
  passed TINYINT(1) DEFAULT 0,
  taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_result (student_id, assessment_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS roadmap_steps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_event VARCHAR(100),
  order_index INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS roadmap_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  step_id INT NOT NULL,
  status ENUM('not_started','in_progress','completed') DEFAULT 'not_started',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_rp (student_id, step_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (step_id) REFERENCES roadmap_steps(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_points (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  points INT DEFAULT 0,
  reason VARCHAR(255),
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100) DEFAULT '🏅',
  trigger_at INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS student_badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  badge_id INT NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_sb (student_id, badge_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  role ENUM('user','assistant') NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cv_analysis_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  cv_text TEXT NOT NULL,
  score INT DEFAULT 0,
  strengths JSON,
  weaknesses JSON,
  missing_keywords JSON,
  suggestions JSON,
  analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type ENUM('info','success','warning','error') DEFAULT 'info',
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mentorship_programs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  capacity INT DEFAULT 10,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mentorship_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  program_id INT NOT NULL,
  student_id INT NOT NULL,
  message TEXT,
  status ENUM('pending','accepted','rejected') DEFAULT 'pending',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_mentorship_app (program_id, student_id),
  FOREIGN KEY (program_id) REFERENCES mentorship_programs(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── SEED DATA ──────────────────────────────────────────
INSERT IGNORE INTO users (email, password_hash, role) VALUES
('admin@studentbridge.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

INSERT IGNORE INTO roadmap_steps (id, title, description, trigger_event, order_index) VALUES
(1,'Complete Your Profile',         'Add your name, university, major, skills, and CV link.','profile_complete', 1),
(2,'Take a Skill Assessment',       'Complete at least one skill assessment.',               'assessment_passed', 2),
(3,'Browse Available Jobs',         'Explore job postings from companies.',                  'jobs_browsed', 3),
(4,'Submit Your First Application', 'Apply to at least one job with a cover letter.',        'first_application', 4),
(5,'Enroll in a Course',            'Join the Learning Hub and enroll in a course.',         'first_enrollment', 5),
(6,'Complete a Course',             'Finish all lessons and earn your first certificate.',   'course_completed', 6),
(7,'Get Hired',                     'Receive an acceptance from a company!',                'hired', 7);

INSERT IGNORE INTO badges (id, name, description, icon, trigger_at) VALUES
(1,'First Step',  'Created your account',    '👣', 0),
(2,'Rising Star', 'Earned 50 points',        '⭐', 50),
(3,'Go-Getter',   'Earned 100 points',       '🚀', 100),
(4,'Learner',     'Earned 200 points',       '📚', 200),
(5,'Achiever',    'Earned 300 points',       '🏆', 300),
(6,'Champion',    'Earned 500+ points',      '👑', 500);

INSERT IGNORE INTO courses (id, title, description, category, level, duration, price, instructor, skills_taught) VALUES
(1,'JavaScript Fundamentals',   'Master core JavaScript.',                      'Programming',  'beginner',     '12 hours',  0.00,  'Dr. Ahmed Hassan',  'JavaScript,ES6,DOM'),
(2,'React for Beginners',       'Build UIs with React and hooks.',              'Frontend',     'beginner',     '10 hours', 29.99,  'Sarah Mitchell',    'React,JSX,Hooks'),
(3,'Node.js & Express API',     'Build REST APIs with Node.js and Express.',    'Backend',      'intermediate', '15 hours', 49.99,  'Mark Johnson',      'Node.js,Express,REST API'),
(4,'Database Design with MySQL','SQL, normalization, and DB design.',            'Database',     'intermediate', '8 hours',  39.99,  'Dr. Khaled Nasser', 'MySQL,SQL,Database Design'),
(5,'Python Data Science',       'Data analysis with Python and pandas.',        'Data Science', 'intermediate', '20 hours', 59.99,  'Dr. Amina Yusuf',   'Python,Pandas,Data Analysis'),
(6,'UI/UX Design Principles',   'Design thinking and prototyping.',             'Design',       'beginner',     '6 hours',  19.99,  'Lena Fischer',      'Figma,Wireframing,UX');

INSERT IGNORE INTO lessons (course_id, title, content, duration, order_index) VALUES
(1,'Introduction to JavaScript', 'Variables, data types, and basic operators.',               '45 min', 1),
(1,'Functions and Scope',        'Functions, closures, and lexical scope.',                  '60 min', 2),
(1,'Arrays and Objects',         'Arrays, objects, destructuring, and spread.',              '55 min', 3),
(1,'Async JavaScript',           'Promises, async/await, and the event loop.',              '70 min', 4),
(1,'DOM Manipulation',           'Select, modify, and create DOM elements.',                '50 min', 5),
(2,'React Basics and JSX',       'Components, JSX syntax, and rendering.',                  '45 min', 1),
(2,'State and Props',            'useState hook and component communication.',              '60 min', 2),
(2,'Hooks Deep Dive',            'useEffect, useContext, and custom hooks.',                '75 min', 3),
(2,'React Router',               'Client-side routing and navigation guards.',              '50 min', 4),
(3,'Setting Up Express',         'Create your first Express server.',                      '40 min', 1),
(3,'REST API Design',            'RESTful routes, controllers, and HTTP methods.',          '60 min', 2),
(3,'JWT Authentication',         'Login, registration, and protected routes.',             '75 min', 3),
(3,'Connecting to MySQL',        'Use mysql2 to query your database.',                     '55 min', 4);
