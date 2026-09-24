# Database

DB: `leather_hub` (local, `mongodb://127.0.0.1:27017/leather_hub`). Set via `MONGODB_URI` in `server/.env`.

## Collections

### users
```js
{
  _id,
  name: String,
  email: String (unique, lowercase),
  password: String (bcrypt hashed),
  phone: String,
  role: "customer" | "admin",
  addresses: [{ address, city, state, pincode }],
  createdAt, updatedAt
}
```

### products
```js
{
  _id,
  name: String,
  slug: String (unique),
  description: String,
  price: Number,
  category: wallets|belts|bags|card-holders|laptop-bags|accessories,
  images: [String],
  stock: Number,
  material: String,
  dimensions: String,
  colors: [String],
  rating: Number (0–5),
  isActive: Boolean,
  createdAt, updatedAt
}
```

### carts *(Phase 3 later — currently cart is client-side localStorage)*
```js
{ userId, items: [{ productId, quantity }], updatedAt }
```

### orders
```js
{
  _id,
  orderNumber: String,        // e.g. LTH-20260812-001 (unique)
  userId: ObjectId,           // null for guest checkout
  customer: { name, email, phone },
  shippingAddress: { address, city, state, pincode },
  items: [{ productId, name, price, quantity, image }],  // snapshot
  subtotal, discount, total,
  couponCode,
  payment: { method: "UPI", status: pending|submitted|verified|failed, utr },
  status: "ORDER_PLACED",     // one of ORDER_STATUSES
  statusHistory: [{ status, at }],
  createdAt, updatedAt
}
```

Order statuses: `ORDER_PLACED → PAYMENT_PENDING → PAYMENT_VERIFIED → PROCESSING → SHIPPED → OUT_FOR_DELIVERY → DELIVERED` (or `CANCELLED`).

### coupons
```js
{ code (unique), type: percent|fixed, value, minAmount, maxDiscount, active, expiresAt, usageLimit, usedCount }
```

## Rules

- **Order snapshot:** orders embed `name`, `price`, `quantity` per item so a later price change never rewrites past orders.
- **Atomic stock:** when stock is decremented at order time, use an atomic update guarded by a `stock: { $gte: quantity }` filter (see PRD §17).
- Run `npm run seed` in `server/` to wipe and reseed the 10 sample products.
