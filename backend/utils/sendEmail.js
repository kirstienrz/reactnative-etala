const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");

/**
 * Send an email using SendGrid (Primary) with Nodemailer/Gmail (Fallback)
 */
const sendEmail = async ({ to, subject, html, attachments }) => {
  console.log("📧 sendEmail called:", { to, subject });

  // --- 1. PRIMARY: SendGrid ---
  if (process.env.SENDGRID_API_KEY) {
    console.log("✅ SendGrid API key found, attempting to send...");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to,
      from: process.env.SENDGRID_SENDER_EMAIL || "noreply@etala.com",
      subject,
      html,
      attachments: (attachments || []).map(att => ({
        content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : att.content,
        filename: att.filename,
        type: att.type || att.contentType,
        disposition: att.disposition || 'attachment'
      })),
    };

    try {
      await sgMail.send(msg);
      console.log("✅ Email sent successfully via SendGrid");
      return; // Success! exit
    } catch (error) {
      console.error("❌ SendGrid email error:", error.response?.body || error.message);
      console.log("⚠️ Attempting fallback to Gmail...");
    }
  } else {
    console.log("⚠️ SENDGRID_API_KEY not found in environment");
  }

  // --- 2. FALLBACK: Nodemailer (Gmail) ---
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log("✅ Gmail credentials found, attempting to send...");
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
      attachments: attachments || [],
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully via Gmail (Fallback)");
      return; // Success! exit
    } catch (err) {
      console.error("❌ Gmail fallback error:", err.message);
    }
  } else {
    console.log("⚠️ EMAIL_USER or EMAIL_PASS not found in environment");
  }

  // If both failed or are not configured
  console.error("❌ Email failed: No email service configured");
  throw new Error("Could not send email. Both primary (SendGrid) and fallback (Gmail) services failed.");
};

module.exports = sendEmail;
