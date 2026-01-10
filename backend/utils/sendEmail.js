// // backend/utils/sendEmail.js
// const nodemailer = require("nodemailer");

// // MailerSend SMTP credentials
// const transporter = nodemailer.createTransport({
//   host: "smtp.mailersend.net", // MailerSend SMTP host
//   port: 587,
//   secure: false, // true for 465, false for 587
//   auth: {
//     user: "MS_7Pwe4n@test-q3enl6ky9d742vwr.mlsender.net", // your SMTP user
//     pass: process.env.MAILERSEND_SMTP_PASSWORD, // your SMTP password from MailerSend
//   },
// });

// /**
//  * Send an email using MailerSend SMTP
//  * @param {Object} options
//  * @param {string} options.to - recipient email
//  * @param {string} options.subject - email subject
//  * @param {string} options.html - HTML content
//  */
// const sendEmail = async ({ to, subject, html }) => {
//   try {
//     const info = await transporter.sendMail({
//       from: '"GAD Portal" <noreply@test-q3enl6ky9d742vwr.mlsender.net>', // test domain from MailerSend
//       to,
//       subject,
//       html,
//     });

//     console.log("✅ Email sent:", info.messageId);
//   } catch (error) {
//     console.error("❌ Email send error:", error);
//     throw new Error("Could not send email");
//   }
// };

// module.exports = sendEmail;
const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"GAD Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("❌ Email send error:", err);
    throw new Error("Could not send email");
  }
};

module.exports = sendEmail;

