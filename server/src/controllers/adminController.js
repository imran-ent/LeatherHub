import { Order, ORDER_STATUSES } from "../models/Order.js";
import { User } from "../models/User.js";
import { Product } from "../models/Product.js";
import { Coupon } from "../models/Coupon.js";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

/**
 * GET /api/admin/stats
 * Dashboard numbers: orders, sales, pending payment count, stock, users.
 */
export async function getStats(req, res, next) {
  try {
    const [ordered, cancelled ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "CANCELLED" }),
    ]);
    const [unpaid, verified] = await Promise.all([
      Order.countDocuments({ $or: [{ "payment.status": "pending" }, { "payment.status": "submitted" }] }),
      Order.countDocuments({ "payment.status": "verified" }),
    ]);

    const [salesAgg, stockAgg, users, recentlyAdded] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $ne: "CANCELLED" }, "payment.status": { $ne: "pending" } } },
        { $group: { _id: null, sales: { $sum: "$total" }, orders: { $sum: 1 } } },
      ]),
      Product.aggregate([{ $group: { _id: null, stock: { $sum: "$stock" } } }]),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({ isActive: true, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) } }),
    ]);

    const lowStock = await Product.countDocuments({ isActive: true, stock: { $lte: 5 } });

    res.json({
      totalOrders: ordered,
      cancelledOrders: cancelled,
      fulfilledOrders: salesAgg[0]?.orders || 0,
      sales: salesAgg[0]?.sales || 0,
      unpaidOrders: unpaid,
      verifiedOrders: verified,
      totalStock: stockAgg[0]?.stock || 0,
      totalUsers: users,
      recentlyAdded,
      lowStock,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/orders?status=&search=&page=&limit=
 */
export async function getAdminOrders(req, res, next) {
  try {
    const { status = "", search = "", page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;

    if (search.trim()) {
      query.$or = [
        { orderNumber: { $regex: search.trim(), $options: "i" } },
        { "customer.name": { $regex: search.trim(), $options: "i" } },
        { "customer.email": { $regex: search.trim(), $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, parseInt(limit, 10) || 10);

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      Order.countDocuments(query),
    ]);

    res.json({ orders, page: pageNum, pages: Math.ceil(total / limitNum), total });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/orders/:id
 */
export async function getAdminOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order.toObject());
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/orders/:id/status  Body: { status }
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${ORDER_STATUSES.join(", ")}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.addStatus(status);
    await order.save();

    res.json({ message: `Order marked as ${status}`, order: order.toObject() });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/orders/:id/payment  Body: { verified: boolean }
 */
export async function verifyPayment(req, res, next) {
  try {
    const verified = Boolean(req.body.verified);

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!order.payment.utr && verified) {
      return res.status(400).json({ message: "No UTR submitted for this order yet" });
    }

    order.payment.status = verified ? "verified" : "failed";

    if (verified && (order.status === "ORDER_PLACED" || order.status === "PAYMENT_PENDING")) {
      order.addStatus("PAYMENT_VERIFIED");
    }

    await order.save();

    res.json({
      message: verified ? "Payment verified" : "Payment marked as failed",
      order: order.toObject(),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/products?search=&status=
 * Includes inactive products so admins can manage them.
 */
export async function getAdminProducts(req, res, next) {
  try {
    const { search = "", status = "" } = req.query;
    const query = {};
    if (status) query.isActive = status === "active";
    if (search.trim()) {
      query.$or = [{ name: { $regex: search.trim(), $options: "i" } }, { category: { $regex: search.trim(), $options: "i" } }];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/products
 */
export async function createProduct(req, res, next) {
  try {
    const { name, price, category, description, stock, images, material, dimensions, colors, rating, isActive } = req.body;

    if (!name || price === undefined || !category || !description || stock === undefined) {
      return res.status(400).json({ message: "name, price, category, description and stock are required" });
    }

    // Ensure a unique slug.
    let base = slugify(name);
    let slug = base;
    let counter = 1;
    while (await Product.exists({ slug })) {
      slug = `${base}-${counter}`;
      counter += 1;
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      images: Array.isArray(images) ? images : [],
      material: material || "Genuine leather",
      dimensions: dimensions || "",
      colors: Array.isArray(colors) && colors.length ? colors : ["Black"],
      rating: rating !== undefined ? Number(rating) : 4.5,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/products/:id
 */
export async function updateProduct(req, res, next) {
  try {
    const updates = req.body;

    if (updates.name) {
      let base = slugify(updates.name);
      let slug = base;
      let counter = 1;
      while (await Product.exists({ slug, _id: { $ne: req.params.id } })) {
        slug = `${base}-${counter}`;
        counter += 1;
      }
      updates.slug = slug;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/products/:id
 */
export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/upload  (multipart field: "image")
 * Saves a local image and returns its public URL path.
 */
export function uploadImageFile(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "No image file provided" });
  }
  res.status(201).json({ path: `/uploads/${req.file.filename}` });
}

/**
 * GET /api/admin/customers
 */
export async function getCustomers(req, res, next) {
  try {
    const users = await User.find({ role: "customer" })
      .sort({ createdAt: -1 })
      .select("-password")
      .limit(100);
    res.json(users);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/coupons
 */
export async function getCoupons(req, res, next) {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    next(error);
  }
}