const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send email via SendGrid
 * @param {string} to - receiver (admin email)
 * @param {string} subject - email subject
 * @param {string} text - email content
 * @param {string} userEmail - sender email (reply-to)
 */
const sendEmail = async (to, subject, text, userEmail) => {
  try {
    await sgMail.send({
      to, // admin receives email
      from: process.env.SENDGRID_EMAIL, // verified sender (SendGrid)

      subject,
      text,

      // user can reply directly to this email
      replyTo: userEmail,

      // optional (usually not needed, but safe)
      mailSettings: {
        sandboxMode: {
          enable: false
        }
      }
    });

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ SendGrid error:");
    console.error(error.response?.body || error.message || error);
    throw error;
  }
};

module.exports = sendEmail;