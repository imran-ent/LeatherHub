import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn("EMAIL_USER / EMAIL_APP_PASSWORD not set — email sending disabled");
    return null;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  return transporter;
}

function formatEmail(order) {
  const lines = order.items
    .map((i) => `${i.name} × ${i.quantity} — ₹${i.price * i.quantity}`)
    .join("\n");

  return `
NEW ORDER RECEIVED — ${order.orderNumber}

CUSTOMER
──────────────
Name:   ${order.customer.name}
Phone:  ${order.customer.phone}
Email:  ${order.customer.email}

SHIPPING
──────────────
${order.shippingAddress.address}
${order.shippingAddress.city} — ${order.shippingAddress.state} ${order.shippingAddress.pincode}

PRODUCTS
──────────────
${lines}

──────────────
Subtotal:  ₹${order.subtotal}
Discount:  -₹${order.discount}
TOTAL:     ₹${order.total}

Coupon:   ${order.couponCode || "none"}
Payment:  UPI — ${order.payment.status}${order.payment.utr ? ` (UTR ${order.payment.utr})` : ""}
Status:   ${order.status}
`;
}

/**
 * Notification only. If email fails, the order still stands —
 * MongoDB is the source of truth.
 */
async function sendMail(to, subject, text) {
  const transport = getTransporter();
  if (!transport) return;

  try {
    await transport.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.warn(`Email failed (${subject}): ${error.message}`);
  }
}

export function sendNewOrderNotification(order) {
  if (process.env.ADMIN_EMAIL) {
    return sendMail(
      process.env.ADMIN_EMAIL,
      `New order ${order.orderNumber}`,
      formatEmail(order)
    );
  }
  return Promise.resolve();
}

export function sendOrderConfirmation(order) {
  return sendMail(
    order.customer.email,
    `Your Leather-Hub order ${order.orderNumber}`,
    formatEmail(order)
  );
}

export function sendPaymentNotification(order) {
  if (process.env.ADMIN_EMAIL) {
    return sendMail(
      process.env.ADMIN_EMAIL,
      `Payment submitted for ${order.orderNumber} (UTR ${order.payment.utr})`,
      `Customer ${order.customer.name} submitted UTR ${order.payment.utr} for ${order.orderNumber}. Please verify the UPI payment in the admin dashboard.`
    );
  }
  return Promise.resolve();
}