const axios = require("axios");
const { pool } = require("../config/db");

async function chatWithAI(req, res) {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.json({ reply: "Please type a question." });
    }

    const msg = message.toLowerCase();

    let contextData = "";
    let debug = {};

    // ─────────────────────────────
    // DEBUG AUTH (IMPORTANT STEP)
    // ─────────────────────────────
    console.log("REQ USER:", req.user);

    // ─────────────────────────────
    // STUDENT PROFILE (SAFE FIX)
    // ─────────────────────────────
    try {
      const userId = req.user?.id;

      if (userId) {
        const [profile] = await pool.query(
          `
          SELECT full_name, skills, bio
          FROM student_profiles
          WHERE user_id = ?
          `,
          [userId]
        );

        if (profile && profile.length > 0) {
          const userProfile = profile[0];

          debug.profile = userProfile;

          contextData += `
STUDENT PROFILE:
- Name: ${userProfile.full_name || "N/A"}
- Skills: ${userProfile.skills || "N/A"}
- Bio: ${userProfile.bio || "N/A"}
`;
        }
      }
    } catch (err) {
      console.log("PROFILE FETCH ERROR:", err.message);
    }

    // ─────────────────────────────
    // JOBS
    // ─────────────────────────────
    if (
      msg.includes("job") ||
      msg.includes("work") ||
      msg.includes("career")
    ) {
      const [jobs] = await pool.query(`
        SELECT title, description, location
        FROM jobs
        WHERE is_active = 1
        LIMIT 10
      `);

      debug.jobs = jobs;

      if (jobs.length) {
        contextData += `\nJOBS:\n${JSON.stringify(jobs, null, 2)}\n`;
      }
    }

    // ─────────────────────────────
    // COURSES
    // ─────────────────────────────
    if (
      msg.includes("course") ||
      msg.includes("learn") ||
      msg.includes("study")
    ) {
      const [courses] = await pool.query(`
        SELECT title, description
        FROM courses
        LIMIT 10
      `);

      debug.courses = courses;

      if (courses.length) {
        contextData += `\nCOURSES:\n${JSON.stringify(courses, null, 2)}\n`;
      }
    }

    // ─────────────────────────────
    // APPLICATIONS
    // ─────────────────────────────
    if (
      msg.includes("apply") ||
      msg.includes("application")
    ) {
      const [apps] = await pool.query(`
        SELECT a.status, j.title
        FROM applications a
        JOIN jobs j ON a.job_id = j.id
        LIMIT 10
      `);

      debug.applications = apps;

      if (apps.length) {
        contextData += `\nAPPLICATIONS:\n${JSON.stringify(apps, null, 2)}\n`;
      }
    }

    // ─────────────────────────────
    // CV / RESUME
    // ─────────────────────────────
    if (msg.includes("cv") || msg.includes("resume")) {
      contextData += `
CV ANALYSIS MODE:
- Extract skills
- Suggest improvements
- Match with jobs
`;
    }

  const systemMsg = `
You are StudentBridge AI Assistant.

You are an intelligent assistant integrated into a student platform called StudentBridge.

========================================================
CORE ROLE
========================================================
Your main responsibilities are:

1. StudentBridge Platform Support:
- dashboard usage
- courses, assignments, submissions
- profile, settings, and account features
- explaining how to use any feature inside the platform

2. Academic Assistance:
- explaining concepts (programming, math, science, etc.)
- helping with coding problems and projects
- study guidance and learning support

3. Career Support:
- CV writing and improvement
- interview preparation
- skills development
- job readiness guidance

4. General Knowledge:
- You are allowed to answer general questions when helpful to the user

ONLY refuse if the request is:
- illegal
- unsafe
- harmful
- violates system safety rules

========================================================
STUDENT PROFILE (CRITICAL — MUST FOLLOW)
========================================================
You ALWAYS receive STUDENT PROFILE inside CONTEXT when available.

IMPORTANT RULES:
- STUDENT PROFILE is already provided to you (if present in CONTEXT)
- You do NOT need to access it, request it, or ask the user for it
- Treat it as trusted internal data
- NEVER say you don't have access to the profile if it exists in CONTEXT
- NEVER ask the user to provide their profile

WHEN USER ASKS ABOUT THEMSELVES:
- Always extract information ONLY from STUDENT PROFILE in CONTEXT
- Example: skills, name, progress, major, etc.

IF DATA IS MISSING:
- If a field does not exist in the profile, respond:
  "No data available in your profile for this."

CRITICAL FORBIDDEN RESPONSES (if profile exists in CONTEXT):
- "I don't have access to your profile"
- "Please provide your profile"
- "I cannot see your data"

These are NOT allowed if CONTEXT contains profile data.

========================================================
CONTEXT USAGE RULE
========================================================
You will receive CONTEXT below.

- CONTEXT is your real data source
- Always use it when answering personalized questions
- Never ignore it
- Always assume it is valid and complete if provided

========================================================
BEHAVIOR STYLE
========================================================
- Be clear, practical, and helpful
- Understand user intent before answering
- Prefer simple explanations first, then detail if needed
- Act like a smart AI tutor inside a student app

========================================================
PLATFORM SUPPORT MODE
========================================================
When explaining features:
- give step-by-step instructions
- be simple and actionable
- explain what to click or do inside the app

========================================================
ANSWER STYLE
========================================================
- short, clear, and structured
- use bullet points when useful
- include examples for technical topics
- avoid long unnecessary explanations

========================================================
SAFETY & HONESTY
========================================================
- Never invent user data
- Never guess missing profile information
- If unsure, say clearly you are not sure
- Always prioritize correctness over guessing

========================================================
FINAL GOAL
========================================================
Your goal is to act like a smart in-app AI tutor that:
- helps students use the platform
- helps them learn and study
- supports career growth
- answers general questions safely and accurately

========================================================
CONTEXT:
${contextData}
`;
    // ─────────────────────────────
    // AI REQUEST (GROQ)
    // ─────────────────────────────
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemMsg },
          { role: "user", content: message }
        ],
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const reply =
      response.data?.choices?.[0]?.message?.content || "No response.";

    return res.json({
      reply,
      debug
    });

  } catch (err) {
    console.error("CHAT ERROR:", err.response?.data || err.message);

    return res.status(500).json({
      reply: "Server error",
      error: err.response?.data || err.message
    });
  }
}

module.exports = { chatWithAI };