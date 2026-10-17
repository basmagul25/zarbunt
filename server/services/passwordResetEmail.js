const nodemailer = require("nodemailer");
const { getMailer } = require("./mailer");

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function createTransporter() {
  // Brevo (HTTPS) ya SMTP: jo .env mein set ho wahi chalega (dekho mailer.js)
  return getMailer();
}

async function sendPasswordResetEmail({ user, resetLink, expiresInMinutes }) {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn(
      "Password reset email skipped: SMTP environment variables are not configured."
    );
    return { sent: false, reason: "email_not_configured" };
  }

  if (!user?.email) {
    return { sent: false, reason: "customer_email_missing" };
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const name = escapeHtml(user.name || "there");
  const safeLink = escapeHtml(resetLink);

  await transporter.sendMail({
    from,
    to: user.email,
    subject: "Reset your Zarbunt password",
    text:
      `Hi ${user.name || "there"},\n\n` +
      `We received a request to reset your Zarbunt password.\n` +
      `Open this link to choose a new password (valid for ${expiresInMinutes} minutes):\n\n` +
      `${resetLink}\n\n` +
      `If you did not ask for this, you can safely ignore this email. Your password will not change.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #20201d;">
        <h2 style="font-weight: 400; letter-spacing: 1px;">ZARBUNT</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to choose a new one. This link is valid for ${expiresInMinutes} minutes.</p>
        <p style="margin: 28px 0;">
          <a href="${safeLink}"
             style="background: #20201d; color: #ffffff; padding: 14px 24px; text-decoration: none; font-size: 13px; letter-spacing: 1px;">
            RESET PASSWORD
          </a>
        </p>
        <p style="font-size: 13px; color: #77736b;">
          If the button does not work, copy and paste this link into your browser:<br />
          ${safeLink}
        </p>
        <p style="font-size: 13px; color: #77736b;">
          If you did not ask for this, you can safely ignore this email. Your password will not change.
        </p>
      </div>
    `,
  });

  return { sent: true };
}

module.exports = { sendPasswordResetEmail };