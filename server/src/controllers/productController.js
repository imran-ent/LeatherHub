import { Product } from "../models/Product.js";

/**
 * GET /api/products
 * Supports: ?search=wallet&category=wallets&minPrice=500&maxPrice=3000&sort=price-asc&page=1&limit=8
 * Only active products are returned to customers.
 */
export async function getProducts(req, res, next) {
  try {
    const {
      search = "",
      category = "",
      minPrice = 0,
      maxPrice = 0,
      sort = "newest",
      page = 1,
      limit = 8,
    } = req.query;

    const query = { isActive: true };

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (category) query.category = category;

    if (Number(minPrice) > 0 || Number(maxPrice) > 0) {
      query.price = {};
      if (Number(minPrice) > 0) query.price.$gte = Number(minPrice);
      if (Number(maxPrice) > 0) query.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      "name-asc": { name: 1 },
      rating: { rating: -1 },
      newest: { createdAt: -1 },
    };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, parseInt(limit, 10) || 8);

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortMap[sort] || sortMap.newest)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/products/:id
 */
export async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
}
