const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

const sendEmail = async ({ to, subject, html }) => {
  const sentFrom = new Sender(  "noreply@test-r9084zvy0qmgw63d.mlsender.net", "Etala");

  const recipients = [new Recipient(to)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(subject)
    .setHtml(html);

  try {
    await mailerSend.email.send(emailParams);
    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Email send error:", error);
    throw new Error("Could not send email");
  }
};

module.exports = sendEmail;
