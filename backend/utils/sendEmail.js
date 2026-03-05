const sgMail = require("@sendgrid/mail");

// Set your SendGrid API Key from env
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Send an email using SendGrid
 * @param {Object} param0
 * @param {string} param0.to - recipient email
 * @param {string} param0.subject - email subject
 * @param {string} param0.html - email content in HTML
 */
const sendEmail = async ({ to, subject, html, attachments }) => {
  const msg = {
    to,
    from: process.env.SENDGRID_SENDER_EMAIL || "noreply@etala.com", // verified sender
    subject,
    html,
    attachments: attachments || [],
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Email sent successfully via SendGrid");
  } catch (error) {
    console.error("❌ SendGrid email error:", error.response?.body || error);
    // Log details of the error if available
    if (error.response?.body?.errors) {
      console.error("Errors:", JSON.stringify(error.response.body.errors, null, 2));
    }
    throw new Error("Could not send email via SendGrid");
  }
};

module.exports = sendEmail;
