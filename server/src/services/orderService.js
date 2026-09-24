import { Product } from "../models/Product.js";
import { Coupon } from "../models/Coupon.js";
import { Order } from "../models/Order.js";
import { generateOrderNumber } from "../utils/generateOrderNumber.js";
import { calculateDiscount } from "../utils/calculateDiscount.js";

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function validateCoupon(code, subtotal) {
  if (!code) return { coupon: null, discount: 0 };

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon || !coupon.active) throw badRequest("Invalid coupon code");
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw badRequest("Coupon has expired");
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) throw badRequest("Coupon usage limit reached");
  if (subtotal < coupon.minAmount) throw badRequest(`Coupon requires a minimum order of ₹${coupon.minAmount}`);

  return { coupon, discount: calculateDiscount(coupon, subtotal) };
}

/**
 * Creates an order. The client only sends { items:[{productId, quantity}],
 * shippingAddress, couponCode? } — every price/total is computed here from
 * MongoDB, never trusted from the frontend.
 */
export async function createOrder({ user, customer, items, shippingAddress, couponCode }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw badRequest("Cart is empty");
  }
  if (!customer?.name || !customer?.email || !customer?.phone) {
    throw badRequest("Customer name, email and phone are required");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
    throw badRequest("A valid email is required");
  }
  if (!/^\d{10,15}$/.test(String(customer.phone).replace(/\s/g, ""))) {
    throw badRequest("A valid phone number is required");
  }
  if (!shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.pincode) {
    throw badRequest("Shipping address is required (address, city, state, pincode)");
  }

  const uniqueItems = items.filter(
    (item, index, all) => item.productId && all.findIndex((x) => String(x.productId) === String(item.productId)) === index
  );

  // 1. Load each product and snapshot name/price/image.
  const orderItems = [];
  let subtotal = 0;

  for (const item of uniqueItems) {
    const quantity = Number.parseInt(item.quantity, 10);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw badRequest(`Invalid quantity for item ${item.productId}`);
    }

    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) {
      throw badRequest(`Product not found: ${item.productId}`);
    }
    if (product.stock < quantity) {
      throw badRequest(`Only ${product.stock} left in stock for "${product.name}"`);
    }

    orderItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.images?.[0] || "",
    });
    subtotal += product.price * quantity;
  }

  // 2. Coupon + totals (server calculated).
  const { coupon, discount } = await validateCoupon(couponCode, subtotal);
  const total = subtotal - discount;

  // 3. Decrement stock atomically (guarded by stock >= quantity).
  const updated = [];
  try {
    for (const item of orderItems) {
      const result = await Product.findOneAndUpdate(
        { _id: item.productId, isActive: true, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!result) {
        throw badRequest(`Insufficient stock for "${item.name}"`);
      }
      updated.push(item);
    }
  } catch (error) {
    // Roll back any stock already decremented.
    for (const item of updated) {
      await Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } });
    }
    throw error;
  }

  // 4. Persist the order.
  const order = await Order.create({
    orderNumber: await generateOrderNumber(),
    userId: user?._id || null,
    customer: {
      name: customer.name.trim(),
      email: customer.email.toLowerCase().trim(),
      phone: String(customer.phone).trim(),
    },
    shippingAddress,
    items: orderItems,
    subtotal,
    discount,
    total,
    couponCode: coupon?.code || null,
    payment: { method: "UPI", status: "pending", utr: null },
    status: "ORDER_PLACED",
    statusHistory: [{ status: "ORDER_PLACED", at: new Date() }],
  });

  // 5. Bump coupon usage (best effort).
  if (coupon) {
    await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });
  }

  return order;
}