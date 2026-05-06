// controllers/aiController.js — Mock AI features: Chatbot, CV Analyzer, Career Advisor
const { pool } = require('../config/db');

// ═══════════════════════════════════════════════
//  CHATBOT
// ═══════════════════════════════════════════════

// GET /api/ai/chat
async function getChatHistory(req, res) {
  try {
    const [messages] = await pool.query(
      'SELECT id, role, message, created_at FROM chat_history WHERE student_id = ? ORDER BY created_at ASC LIMIT 100',
      [req.user.id]
    );
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error loading chat history.' });
  }
}

// POST /api/ai/chat
async function sendMessage(req, res) {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is empty.' });

    const studentId = req.user.id;

    // Save user's message
    await pool.query(
      'INSERT INTO chat_history (student_id, role, message) VALUES (?, "user", ?)',
      [studentId, message]
    );

    // Get student profile for context
    const [[profile]] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [studentId]);

    // Generate a smart mock response
    const reply = generateReply(message, profile);

    // Save bot's reply
    await pool.query(
      'INSERT INTO chat_history (student_id, role, message) VALUES (?, "assistant", ?)',
      [studentId, reply]
    );

    res.json({ success: true, reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error sending message.' });
  }
}

// DELETE /api/ai/chat/clear
async function clearChat(req, res) {
  try {
    await pool.query('DELETE FROM chat_history WHERE student_id = ?', [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error clearing chat.' });
  }
}

// Smart keyword-based response generator
function generateReply(message, profile) {
  const msg  = message.toLowerCase();
  const name = profile?.full_name?.split(' ')[0] || 'there';

  if (msg.match(/\b(hi|hello|hey|good morning|good afternoon)\b/)) {
    return `Hello ${name}! 👋 I'm your AI Career Advisor. I can help you with job searching, resume tips, interview prep, and career planning. What would you like to know?`;
  }
  if (msg.match(/\b(resume|cv)\b/)) {
    return `Here are my top CV tips 📄:\n\n1. **Tailor your CV** for each job — match their keywords\n2. **Quantify achievements** — e.g. "built a system that served 500 users"\n3. **Keep it to 1-2 pages** — recruiters spend ~7 seconds on a CV\n4. **Lead with skills** relevant to your target role\n5. **Add your GitHub/LinkedIn** links\n\nWant me to review yours with the CV Analyzer?`;
  }
  if (msg.match(/\b(interview|prepare|preparation)\b/)) {
    return `Great question about interviews! 🎯\n\n**Before the interview:**\n• Research the company thoroughly\n• Prepare 3 stories using the STAR method (Situation → Task → Action → Result)\n• Practice common questions out loud\n\n**During the interview:**\n• Ask good questions at the end\n• Be specific, not vague\n\n**Most common questions:**\n• Tell me about yourself\n• Why do you want this role?\n• What's your biggest weakness?\n\nGood luck — you've got this!`;
  }
  if (msg.match(/\b(skill|learn|course|study)\b/)) {
    return `Skills are your biggest asset! 📚\n\n**Most in-demand skills right now:**\n• JavaScript / React (Frontend)\n• Node.js / Python (Backend)\n• SQL / MySQL (Databases)\n• Git / GitHub (Essential for everyone)\n• Communication (Always #1)\n\n**My advice:** Choose 2-3 skills to focus on deeply rather than learning many things shallowly.\n\nCheck the **Learning Hub** for courses on all of these!`;
  }
  if (msg.match(/\b(job|apply|application|search)\b/)) {
    return `Job hunting tips 💼:\n\n1. **Quality over quantity** — 5 tailored applications beat 50 generic ones\n2. **Your match score matters** — focus on jobs where you match 60%+\n3. **Write a real cover letter** — most students don't, so it makes you stand out\n4. **Follow up after 5-7 days** — shows initiative\n5. **Network on LinkedIn** — 70% of jobs are filled through connections\n\nCheck your **Applications** page to track your progress!`;
  }
  if (msg.match(/\b(salary|pay|money|earn)\b/)) {
    return `Salary insights 💰:\n\nFor fresh graduates in tech (Lebanon/MENA region):\n• Junior Frontend Developer: $600-1,500/month\n• Junior Backend Developer: $700-1,700/month\n• Full Stack Developer: $900-2,200/month\n\n**Negotiation tips:**\n• Never accept the first offer immediately\n• Research market rates first\n• Salary is negotiable — so are benefits, remote work, etc.\n• Use the phrase: "Based on my research, I was expecting X"\n\nRemember: your skills and value increase every year!`;
  }
  if (msg.match(/\b(thanks|thank you|great|awesome|perfect)\b/)) {
    return `You're very welcome, ${name}! 😊 Remember, your career is a marathon, not a sprint. Keep learning, keep applying, and don't give up. Feel free to ask me anything anytime!`;
  }
  if (msg.match(/\b(certificate|certif)\b/)) {
    return `Certificates can boost your profile! 🏆\n\nOn StudentBridge, you earn certificates by:\n1. Enrolling in a course\n2. Completing all lessons\n3. A certificate is automatically issued\n\nYou can then download and print it, and add it to your LinkedIn profile. Recruiters do notice certifications!\n\nHead to **Learning Hub** to start earning yours.`;
  }
  if (msg.match(/\b(point|badge|achievement|reward)\b/)) {
    return `The points & badges system 🎮:\n\n**Earn points by:**\n• Applying to jobs → 15 pts\n• Enrolling in a course → 20 pts\n• Completing a course → 100 pts\n• Scoring 90%+ on assessments → 50 pts\n\n**Use points for:**\n• Discounts on paid courses (100 pts = $5 off)\n\n**Badges** are earned for milestones like "First Application", "Certified Pro", etc. Check your **Badges** page to see what you've earned!`;
  }

  // Default: generic helpful response
  return `That's a great question! 🤔\n\nAs your AI Career Advisor, here's my general advice:\n\n• **Focus on your strengths** and build on them\n• **Stay consistent** — small daily progress beats occasional big efforts\n• **Use all platform features** — your profile completeness, match scores, and assessments all matter to recruiters\n\nIs there something more specific I can help you with? Try asking about: CV tips, interview prep, job search strategy, or which skills to learn next!`;
}

// ═══════════════════════════════════════════════
//  CV ANALYZER
// ═══════════════════════════════════════════════

// POST /api/ai/cv/analyze
async function analyzeCV(req, res) {
  try {
    const { cv_text } = req.body;
    if (!cv_text?.trim()) return res.status(400).json({ success: false, message: 'Please provide CV text.' });

    const analysis = runCVAnalysis(cv_text);

    // Save to history
    await pool.query(
      `INSERT INTO cv_analysis_history (student_id, cv_text, score, strengths, weaknesses, missing_keywords, suggestions)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, cv_text, analysis.score,
        JSON.stringify(analysis.strengths),
        JSON.stringify(analysis.weaknesses),
        JSON.stringify(analysis.missing_keywords),
        JSON.stringify(analysis.suggestions),
      ]
    );

    // 10 points for analyzing CV
    await pool.query(
      'INSERT INTO student_points (student_id, points, reason) VALUES (?, 10, "Analyzed CV")',
      [req.user.id]
    );

    res.json({ success: true, analysis });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error analyzing CV.' });
  }
}

// GET /api/ai/cv/history
async function getCVHistory(req, res) {
  try {
    const [history] = await pool.query(
      'SELECT id, score, analyzed_at FROM cv_analysis_history WHERE student_id = ? ORDER BY analyzed_at DESC LIMIT 10',
      [req.user.id]
    );
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error loading CV history.' });
  }
}

function runCVAnalysis(text) {
  const t = text.toLowerCase();
  let score = 35; // base

  // Check sections
  const sections = {
    contact:    /email|phone|linkedin|github/,
    education:  /university|degree|bachelor|master|gpa|major/,
    experience: /experience|work|internship|position|company|role/,
    skills:     /skills|technologies|languages|tools/,
    projects:   /project|built|developed|created|designed/,
  };

  const found   = [];
  const missing = [];
  Object.entries(sections).forEach(([name, regex]) => {
    if (regex.test(t)) { found.push(name); score += 8; }
    else { missing.push(name); }
  });

  // Tech keywords
  const techWords = ['javascript','react','node','python','sql','git','html','css','typescript','java','docker'];
  const foundTech = techWords.filter(k => t.includes(k));
  score += Math.min(foundTech.length * 2, 16);

  // Action verbs
  const verbs = ['developed','built','designed','implemented','managed','led','created','improved','increased'];
  const foundVerbs = verbs.filter(v => t.includes(v));
  score += Math.min(foundVerbs.length * 1.5, 12);

  // Length
  const words = text.split(/\s+/).length;
  if (words >= 150 && words <= 700) score += 8;
  else if (words < 100) score -= 10;

  score = Math.min(Math.max(Math.round(score), 5), 97);

  const strengths = found.map(s => `✅ Has a ${s} section`);
  if (foundTech.length >= 3) strengths.push(`✅ Good technical skills mentioned (${foundTech.slice(0,4).join(', ')})`);
  if (foundVerbs.length >= 3) strengths.push('✅ Uses strong action verbs');
  if (words >= 200 && words <= 600) strengths.push('✅ CV length is appropriate');

  const weaknesses = missing.map(s => `❌ Missing ${s} section`);
  if (foundTech.length < 3) weaknesses.push('❌ Too few technical keywords mentioned');
  if (foundVerbs.length < 2) weaknesses.push('❌ Needs stronger action verbs (built, led, improved...)');
  if (words < 150) weaknesses.push('❌ CV is too short — add more detail');

  const allTech = ['javascript','react','node','python','sql','mysql','git','html','css','typescript','docker','linux'];
  const missing_keywords = allTech.filter(k => !t.includes(k)).slice(0, 6);

  const suggestions = [
    '💡 Quantify achievements: "reduced load time by 40%" not just "improved performance"',
    '💡 Add links to GitHub and LinkedIn in your contact section',
    '💡 Tailor your skills section to the specific job you are applying to',
    '💡 Use a clean, single-column layout for ATS (applicant tracking system) compatibility',
  ];
  if (missing_keywords.length > 0) {
    suggestions.push(`💡 Consider adding these keywords: ${missing_keywords.slice(0,4).join(', ')}`);
  }

  return { score, strengths, weaknesses, missing_keywords, suggestions };
}

// ═══════════════════════════════════════════════
//  CAREER ADVISOR
// ═══════════════════════════════════════════════

// GET /api/ai/career-advice
async function getCareerAdvice(req, res) {
  try {
    const studentId = req.user.id;

    const [[profile]]     = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [studentId]);
    const [[appStats]]    = await pool.query(
      `SELECT COUNT(*) AS total, SUM(status='hired') AS hired FROM applications WHERE student_id = ?`,
      [studentId]
    );
    const [[{ courses }]] = await pool.query(
      'SELECT COUNT(*) AS courses FROM enrollments WHERE student_id = ?', [studentId]
    );
    const [[{ certs }]]   = await pool.query(
      'SELECT COUNT(*) AS certs FROM certificates WHERE student_id = ?', [studentId]
    );
    const [[{ points }]]  = await pool.query(
      'SELECT COALESCE(SUM(points),0) AS points FROM student_points WHERE student_id = ?', [studentId]
    );

    const fields = ['full_name','university','major','bio','skills','cv_link'];
    const filled = fields.filter(f => profile?.[f]?.toString().trim()).length;
    const completion = Math.round((filled / fields.length) * 100);

    const skills   = (profile?.skills || '').toLowerCase();
    const hasReact = skills.includes('react');
    const hasNode  = skills.includes('node');
    const hasPython= skills.includes('python');
    const hasSQL   = skills.includes('sql');

    const recommendations = [];
    if (completion < 80) recommendations.push({ icon:'👤', title:'Complete your profile', desc:`Your profile is ${completion}% complete. A full profile gets 3× more views.`, priority:'high' });
    if (appStats.total === 0) recommendations.push({ icon:'💼', title:'Start applying', desc:'You haven\'t applied to any jobs yet. Browse the job board today!', priority:'high' });
    if (courses === 0) recommendations.push({ icon:'📚', title:'Enroll in a course', desc:'Learning Hub has free courses. Enrolling earns points and builds your profile.', priority:'medium' });
    if (certs === 0 && courses > 0) recommendations.push({ icon:'🏆', title:'Complete a course', desc:'Finishing a course earns you a downloadable certificate and 100 points.', priority:'medium' });

    const skillGaps = [];
    if (!hasReact)  skillGaps.push({ skill:'React.js',  why:'Required in 78% of frontend job postings', course:'React for Beginners' });
    if (!hasNode)   skillGaps.push({ skill:'Node.js',   why:'Most needed backend skill for web developers', course:'Node.js & Express API' });
    if (!hasSQL)    skillGaps.push({ skill:'SQL/MySQL',  why:'Essential for almost every developer role', course:'Database Design (MySQL)' });
    if (!hasPython) skillGaps.push({ skill:'Python',    why:'Top language for data science and automation', course:'Python for Data Science' });

    const careerPaths = [];
    if (hasReact && hasNode) careerPaths.push({ path:'Full-Stack Developer', match: 82 });
    if (hasReact)            careerPaths.push({ path:'Frontend Developer',   match: 78 });
    if (hasNode || hasSQL)   careerPaths.push({ path:'Backend Developer',    match: 74 });
    if (hasPython)           careerPaths.push({ path:'Data Science',         match: 70 });
    if (careerPaths.length === 0) careerPaths.push({ path:'Junior Developer', match: 55 });

    res.json({
      success: true,
      advice: { completion, profileCompletion: completion, recommendations, skillGaps, careerPaths, stats: { apps: appStats.total, courses, certs, points } }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error generating career advice.' });
  }
}

// GET /api/ai/job-match/:jobId
async function getJobMatch(req, res) {
  try {
    const [[profile]] = await pool.query('SELECT skills FROM student_profiles WHERE user_id = ?', [req.user.id]);
    const [[job]]     = await pool.query('SELECT title, requirements FROM jobs WHERE id = ?', [req.params.jobId]);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });

    const studentSkills = (profile?.skills || '').toLowerCase().split(',').map(s => s.trim());
    const required      = (job.requirements || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean);
    const matched = required.filter(r => studentSkills.some(s => s.includes(r) || r.includes(s)));
    const missing = required.filter(r => !studentSkills.some(s => s.includes(r) || r.includes(s)));
    const pct     = required.length ? Math.round((matched.length / required.length) * 100) : 50;

    res.json({ success: true, match: { percentage: pct, matched, missing } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error.' });
  }
}

module.exports = { getChatHistory, sendMessage, clearChat, analyzeCV, getCVHistory, getCareerAdvice, getJobMatch };
