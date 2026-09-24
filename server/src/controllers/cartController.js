import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await new Cart({ userId, items: [] }).save();
  }
  return cart;
}

/**
 * Returns the user's cart hydrated with live product data.
 * Clamps quantities to current stock and drops inactive/missing products.
 */
async function buildCart(userId) {
  const cart = await Cart.findOne({ userId }).populate("items.productId");
  if (!cart) return { items: [], cartCount: 0 };

  const items = [];
  let cartCount = 0;

  for (const item of cart.items) {
    const product = item.productId;
    if (!product || !product.isActive) continue;

    const quantity = Math.min(item.quantity, product.stock);
    items.push({
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        images: product.images,
        category: product.category,
        rating: product.rating,
      },
      quantity,
    });
    cartCount += quantity;
  }

  return { items, cartCount, subtotal: items.reduce((s, i) => s + i.product.price * i.quantity, 0) };
}

/** GET /api/cart */
export async function getMyCart(req, res, next) {
  try {
    res.json(await buildCart(req.user._id));
  } catch (error) {
    next(error);
  }
}

/** POST /api/cart/items  Body: { productId, quantity } */
export async function addItem(req, res, next) {
  try {
    const { productId, quantity = 1 } = req.body;
    const qty = Math.max(1, Math.min(99, parseInt(quantity, 10) || 1));

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw badRequest("Product not found");
    }

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find((i) => String(i.productId) === String(productId));

    if (existing) {
      existing.quantity = Math.min(existing.quantity + qty, product.stock);
    } else {
      cart.items.push({ productId: product._id, quantity: Math.min(qty, product.stock) });
    }

    await cart.save();
    res.status(201).json(await buildCart(req.user._id));
  } catch (error) {
    next(error);
  }
}

/** PUT /api/cart/items/:productId  Body: { quantity } (0 removes) */
export async function updateQuantity(req, res, next) {
  try {
    const { quantity } = req.body;
    const qty = parseInt(quantity, 10);
    if (Number.isNaN(qty)) throw badRequest("Quantity is required");

    const product = await Product.findById(req.params.productId);
    if (!product) throw badRequest("Product not found");

    const cart = await getOrCreateCart(req.user._id);

    if (qty <= 0) {
      cart.items = cart.items.filter((i) => String(i.productId) !== req.params.productId);
    } else {
      const item = cart.items.find((i) => String(i.productId) === req.params.productId);
      if (!item) throw badRequest("Item not in cart");
      item.quantity = Math.min(Math.max(1, qty), product.stock);
    }

    await cart.save();
    res.json(await buildCart(req.user._id));
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/cart/items/:productId */
export async function removeItem(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter((i) => String(i.productId) !== req.params.productId);
    await cart.save();
    res.json(await buildCart(req.user._id));
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/cart */
export async function clearCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.json({ items: [], cartCount: 0, subtotal: 0 });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/cart/merge  Body: { items: [{productId, quantity}] }
 * Merges a device's localStorage cart into the server cart (quantities add
 * up). Called once on login. Returns the hydrated server cart.
 */
export async function mergeCart(req, res, next) {
  try {
    const incoming = Array.isArray(req.body.items) ? req.body.items : [];
    if (incoming.length === 0) {
      return res.json(await buildCart(req.user._id));
    }

    const products = await Product.find({ _id: { $in: incoming.map((i) => i.productId) }, isActive: true });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const cart = await getOrCreateCart(req.user._id);

    for (const item of incoming) {
      const product = productMap.get(String(item.productId));
      if (!product) continue;

      const qty = Math.max(1, Math.min(parseInt(item.quantity, 10) || 1, product.stock));
      const existing = cart.items.find((i) => String(i.productId) === String(product._id));
      if (existing) {
        existing.quantity = Math.min(existing.quantity + qty, product.stock);
      } else {
        cart.items.push({ productId: product._id, quantity: qty });
      }
    }

    await cart.save();
    res.json(await buildCart(req.user._id));
  } catch (error) {
    next(error);
  }
}