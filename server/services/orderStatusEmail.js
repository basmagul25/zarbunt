const nodemailer = require("nodemailer");
const { getMailer } = require("./mailer");

// Store ka naam (email mein dikhta hai). Naam badalna ho to sirf yahan badlo.
const STORE_NAME = "Zarbunt";

// Kis status par kya email jaye. "pending" par email nahi jati.
const STATUS_MESSAGES = {
  confirmed: {
    subject: "Your order is confirmed",
    heading: "Your order is confirmed",
    text: "We have confirmed your order and are getting it ready.",
  },
  shipped: {
    subject: "Your order is on its way",
    heading: "Your order has been shipped",
    text: "Your order has left our store and is on its way to you.",
  },
  delivered: {
    subject: "Your order has been delivered",
    heading: "Your order has been delivered",
    text: "Your order has been delivered. We hope you love it.",
  },
  cancelled: {
    subject: "Your order has been cancelled",
    heading: "Your order has been cancelled",
    text: "Your order has been cancelled. If you did not ask for this, or have any questions, please contact our support team.",
  },
};

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function money(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;
}

function createTransporter() {
  // Brevo (HTTPS) ya SMTP: jo .env mein set ho wahi chalega (dekho mailer.js)
  return getMailer();
}

async function sendOrderStatusEmail({ user, order, status }) {
  const message = STATUS_MESSAGES[status];

  // pending jaise status par email nahi bhejni
  if (!message) {
    return { sent: false, reason: "status_has_no_email" };
  }

  const transporter = createTransporter();

  if (!transporter) {
    console.warn(
      "Order status email skipped: SMTP environment variables are not configured."
    );
    return { sent: false, reason: "email_not_configured" };
  }

  if (!user?.email) {
    return { sent: false, reason: "customer_email_missing" };
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const orderNumber = String(order._id);
  const name = user.name || "there";

  const items = Array.isArray(order.items) ? order.items : [];

  const itemLines = items.map(
    (item) =>
      `${item.name}${item.size ? ` (Size: ${item.size})` : ""} x ${item.quantity}`
  );

  const itemRowsHtml = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">
            ${escapeHtml(item.name)}${
              item.size
                ? `<br /><span style="color:#77736b;font-size:12px;">Size: ${escapeHtml(item.size)}</span>`
                : ""
            }
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${money(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("");

  await transporter.sendMail({
    from,
    to: user.email,
    subject: `${STORE_NAME}: ${message.subject} (${orderNumber})`,
    text:
      `Hi ${name},\n\n` +
      `${message.text}\n\n` +
      `Order number: ${orderNumber}\n` +
      `${itemLines.join("\n")}\n` +
      `Total: ${money(order.total)}\n\n` +
      `Thank you for shopping with ${STORE_NAME}.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #20201d;">
        <p style="letter-spacing:3px;font-size:11px;color:#786b5d;">${escapeHtml(STORE_NAME.toUpperCase())}</p>
        <h2 style="font-weight: 400;">${escapeHtml(message.heading)}</h2>
        <p>Hi ${escapeHtml(name)},</p>
        <p>${escapeHtml(message.text)}</p>

        <p style="font-size:12px;color:#77736b;margin-bottom:4px;">ORDER NUMBER</p>
        <p style="margin-top:0;">${escapeHtml(orderNumber)}</p>

        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead>
            <tr style="text-align:left;font-size:11px;color:#77736b;">
              <th style="padding:6px 0;">ITEM</th>
              <th style="padding:6px 0;text-align:center;">QTY</th>
              <th style="padding:6px 0;text-align:right;">TOTAL</th>
            </tr>
          </thead>
          <tbody>${itemRowsHtml}</tbody>
        </table>

        <p style="text-align:right;margin-top:14px;"><strong>Total: ${money(order.total)}</strong></p>

        <p style="font-size:13px;color:#77736b;">Thank you for shopping with ${escapeHtml(STORE_NAME)}.</p>
      </div>
    `,
  });

  return { sent: true };
}

module.exports = { sendOrderStatusEmail };