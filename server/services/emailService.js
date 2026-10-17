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

async function sendOrderConfirmationEmail({ user, order }) {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn(
      "Order confirmation email skipped: SMTP environment variables are not configured."
    );
    return { sent: false, reason: "email_not_configured" };
  }

  if (!user?.email) {
    console.warn("Order confirmation email skipped: customer email is missing.");
    return { sent: false, reason: "customer_email_missing" };
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  const orderNumber = String(order._id);
  const money = (amount) => `Rs. ${Number(amount || 0).toLocaleString("en-PK")}`;
  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #e8e3dc;">${escapeHtml(item.name)}${item.size ? `<br /><span style="color:#77736b;font-size:12px;">Size: ${escapeHtml(item.size)}</span>` : ""}</td>
      <td style="padding:12px;text-align:center;border-bottom:1px solid #e8e3dc;">${Number(item.quantity)}</td>
      <td style="padding:12px;text-align:right;border-bottom:1px solid #e8e3dc;">${money(item.price * item.quantity)}</td>
    </tr>
  `).join("");

  const address = order.shippingAddress || {};
  const addressText = [
    address.fullName,
    address.phone,
    address.address,
    address.city,
    address.postalCode,
  ].filter(Boolean).join(", ");

  const textItems = order.items.map((item) =>
    `${item.name}${item.size ? ` (Size: ${item.size})` : ""} × ${item.quantity} — ${money(item.price * item.quantity)}`
  ).join("\n");

  await transporter.sendMail({
    from,
    to: user.email,
    subject: `Zarbunt order confirmation — ${orderNumber}`,
    text: [
      `Hi ${user.name || "there"},`,
      "",
      "Thank you for your order. We have received it successfully.",
      `Order number: ${orderNumber}`,
      `Date: ${new Date(order.createdAt || Date.now()).toLocaleString("en-PK")}`,
      "",
      "Your items:",
      textItems,
      "",
      `Subtotal: ${money(order.subtotal)}`,
      `Shipping: ${money(order.shipping)}`,
      `Total: ${money(order.total)}`,
      `Payment method: ${order.paymentMethod === "COD" ? "Cash on Delivery" : "Card"}`,
      `Delivery address: ${addressText}`,
      "",
      "You can sign in to your Zarbunt account to track your order.",
    ].join("\n"),
    html: `
      <div style="margin:0;background:#f7f5f1;padding:32px 12px;font-family:Arial,sans-serif;color:#24221f;">
        <div style="max-width:640px;margin:0 auto;background:#fff;padding:32px;border:1px solid #e8e3dc;">
          <p style="letter-spacing:3px;font-size:11px;color:#786b5d;">ZARBUNT</p>
          <h1 style="font-size:27px;font-weight:500;margin-bottom:8px;">Thank you for your order.</h1>
          <p style="color:#625e58;line-height:1.6;">Hi ${escapeHtml(user.name || "there")}, we’ve received your order and will keep you updated as it progresses.</p>
          <div style="background:#f7f5f1;padding:16px;margin:24px 0;">
            <div style="font-size:11px;letter-spacing:1px;color:#786b5d;">ORDER NUMBER</div>
            <div style="font-size:14px;word-break:break-all;margin-top:6px;">${escapeHtml(orderNumber)}</div>
            <div style="font-size:12px;color:#625e58;margin-top:8px;">${escapeHtml(new Date(order.createdAt || Date.now()).toLocaleString("en-PK"))}</div>
          </div>
          <h2 style="font-size:16px;font-weight:600;">Order summary</h2>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead><tr style="text-align:left;color:#786b5d;"><th style="padding:10px 12px;">ITEM</th><th style="padding:10px 12px;text-align:center;">QTY</th><th style="padding:10px 12px;text-align:right;">TOTAL</th></tr></thead>
            <tbody>${itemRows}</tbody>
          </table>
          <div style="margin-top:18px;font-size:14px;">
            <p>Subtotal: <strong style="float:right;">${money(order.subtotal)}</strong></p>
            <p>Shipping: <strong style="float:right;">${money(order.shipping)}</strong></p>
            <p style="border-top:1px solid #e8e3dc;padding-top:14px;font-size:16px;">Total <strong style="float:right;">${money(order.total)}</strong></p>
          </div>
          <h2 style="font-size:16px;margin-top:28px;">Delivery details</h2>
          <p style="font-size:13px;color:#625e58;line-height:1.7;">${escapeHtml(addressText)}</p>
          <p style="font-size:13px;color:#625e58;">Payment method: ${order.paymentMethod === "COD" ? "Cash on Delivery" : "Card"}</p>
          <p style="margin-top:28px;font-size:12px;color:#786b5d;line-height:1.6;">You can sign in to your Zarbunt account to track your order. If you did not place this order, please contact our support team.</p>
        </div>
      </div>
    `,
  });

  return { sent: true };
}

module.exports = { sendOrderConfirmationEmail };