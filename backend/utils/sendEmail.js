const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");

/**
 * Send an email using SendGrid (Primary) with Nodemailer/Gmail (Fallback)
 */
const sendEmail = async ({ to, subject, html, attachments }) => {
  // --- 1. PRIMARY: SendGrid ---
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to,
      from: process.env.SENDGRID_SENDER_EMAIL || "noreply@etala.com",
      subject,
      html,
      attachments: attachments || [],
    };

    try {
      await sgMail.send(msg);
      console.log("✅ Email sent successfully via SendGrid");
      return; // Success! exit
    } catch (error) {
      console.error("❌ SendGrid email error:", error.response?.body || error.message);
      console.log("⚠️ Attempting fallback to Gmail...");
    }
  }

  // --- 2. FALLBACK: Nodemailer (Gmail) ---
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS.split("#")[0].trim(), // Remove comments if present
      },
    });

    const mailOptions = {
      from: `GAD Office <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully via Gmail (Fallback)");
      return; // Success! exit
    } catch (err) {
      console.error("❌ Gmail fallback error:", err.message);
    }
  }

  // If both failed or are not configured
  throw new Error("Could not send email. Both primary (SendGrid) and fallback (Gmail) services failed.");
};

module.exports = sendEmail;
