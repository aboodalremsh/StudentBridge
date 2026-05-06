const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text) => {
  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_EMAIL, // verified sender
      subject,
      text,
    });
  } catch (error) {
    console.error("Email error:", error);
  }
};

module.exports = sendEmail;