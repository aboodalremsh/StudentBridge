const router = require('express').Router();
const sendEmail = require('../utils/sendEmail');
const { pool } = require('../config/db');

router.post('/', async (req, res) => {
  console.log("🔥 CONTACT ROUTE HIT");
  console.log("BODY:", req.body);

  const { name, email, message } = req.body;

  const text = `
New Contact Message:

Name: ${name}
Email: ${email}
Message: ${message}
  `;

  try {
    console.log("🧪 STEP 1: DB INSERT START");

    const result = await pool.query(
      "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
      [name, email, message]
    );

    console.log("✅ DB INSERT OK:", result[0]);

    console.log("🧪 STEP 2: EMAIL START");

    await sendEmail(
      process.env.RECEIVER_EMAIL,
      "New Contact Message",
      text,
      email
    );

    console.log("✅ EMAIL SENT");

    res.json({ success: true });

  } catch (err) {
    console.log("🔥 BACKEND ERROR FULL:");
    console.log(err);

    return res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
});

module.exports = router;