import { Order } from "../models/Order.js";
import { createOrder } from "../services/orderService.js";
import {
  sendNewOrderNotification,
  sendOrderConfirmation,
  sendPaymentNotification,
} from "../services/emailService.js";

const PUBLIC_FIELDS =
  "orderNumber items subtotal discount total payment.status status statusHistory createdAt shippingAddress";

/**
 * POST /api/orders
 * Body: { items:[{productId, quantity}], shippingAddress, customer?, couponCode? }
 * Auth optional — userId is linked when logged in (guest checkout allowed).
 */
export async function placeOrder(req, res, next) {
  try {
    const { items, shippingAddress, couponCode } = req.body;

    // Prefer the logged-in user's details if the client didn't override them.
    const customer = req.body.customer || {
      name: req.user?.name || "",
      email: req.user?.email || "",
      phone: req.user?.phone || "",
    };

    const order = await createOrder({
      user: req.user || null,
      customer,
      items,
      shippingAddress,
      couponCode,
    });

    // Emails are notifications only — failures must not fail the order.
    Promise.allSettled([
      sendNewOrderNotification(order),
      sendOrderConfirmation(order),
    ]);

    res.status(201).json({
      message: "Order placed successfully",
      order: order.toObject(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders  (protected)
 * Returns the current user's orders.
 */
export async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select(PUBLIC_FIELDS);
    res.json(orders);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders/:id  (must own order or be admin)
 */
export async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isOwner =
      req.user &&
      (String(order.userId) === String(req.user._id) ||
        order.customer.email === req.user.email);
    const isAdmin = req.user?.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order.toObject());
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/orders/:id/payment
 * Customer submits their UPI transaction reference. Admin verifies it later.
 * Body: { upiRef }
 */
export async function submitPayment(req, res, next) {
  try {
    const { upiRef } = req.body;
    if (!upiRef || !String(upiRef).trim()) {
      return res.status(400).json({ message: "Transaction reference (UTR) is required" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const isOwner =
      req.user &&
      (String(order.userId) === String(req.user._id) ||
        order.customer.email === req.user.email);
    const isAdmin = req.user?.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized for this order" });
    }

    if (order.payment.status === "verified") {
      return res.status(409).json({ message: "Payment has already been verified" });
    }

    order.payment.utr = String(upiRef).trim();
    order.payment.status = "submitted";
    order.addStatus("PAYMENT_PENDING");
    await order.save();

    sendPaymentNotification(order);

    res.json({ message: "Payment reference submitted for verification", order: order.toObject() });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/orders/track
 * Public tracking by order number + email (no auth needed).
 */
export async function trackOrder(req, res, next) {
  try {
    const { orderNumber, email } = req.body;
    if (!orderNumber || !email) {
      return res.status(400).json({ message: "Order ID and email are required" });
    }

    const order = await Order.findOne({ orderNumber: String(orderNumber).trim().toUpperCase() });
    if (!order || order.customer.email !== String(email).toLowerCase().trim()) {
      return res.status(404).json({ message: "No order found for these details" });
    }

    res.json({
      orderNumber: order.orderNumber,
      customerName: order.customer.name,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
      })),
      subtotal: order.subtotal,
      discount: order.discount,
      total: order.total,
      paymentStatus: order.payment.status,
      status: order.status,
      statusHistory: order.statusHistory,
      shippingAddress: order.shippingAddress,
    });
  } catch (error) {
    next(error);
  }
}