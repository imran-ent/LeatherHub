import { Order } from "../models/Order.js";

/**
 * Generates an order number like LTH-20260812-001.
 * Sequence resets each day. Format: LTH-YYYYMMDD-XXX
 */
export async function generateOrderNumber() {
  const now = new Date();

  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const prefix = `LTH-${datePart}-`;

  // Count today's orders to derive the next sequence number.
  const count = await Order.countDocuments({
    orderNumber: { $regex: `^${prefix}` },
  });

  const sequence = String(count + 1).padStart(3, "0");
  const candidate = `${prefix}${sequence}`;

  // Very unlikely collision, but guard the unique index anyway.
  const existing = await Order.exists({ orderNumber: candidate });
  if (existing) {
    return generateOrderNumber();
  }

  return candidate;
}