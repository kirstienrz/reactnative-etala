const nodemailer = require("nodemailer");

/**
 * Send an email with optional PDF attachment
 * @param {Object} options
 * @param {string} options.to - recipient email
 * @param {string} options.subject - email subject
 * @param {string} options.html - HTML content
 * @param {Buffer} options.pdfBuffer - PDF file buffer (optional)
 * @param {string} options.pdfFilename - PDF filename (optional)
 */
const sendEmail = async ({ to, subject, html, pdfBuffer, pdfFilename }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"GAD Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    // Add PDF attachment if provided
    if (pdfBuffer && pdfFilename) {
      mailOptions.attachments = [
        {
          filename: pdfFilename,
          content: Buffer.from(pdfBuffer),
          contentType: "application/pdf",
        },
      ];
    }

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("❌ Email send error:", err);
    throw new Error("Could not send email");
  }
};

module.exports = sendEmail;