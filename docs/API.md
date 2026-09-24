# API

Base URL (dev): `http://localhost:5000/api` — proxied from the client at `http://localhost:5173/api`.

All responses are JSON. Errors: `{ "message": "..." }`.

## Implemented (Phase 1–8)

### Health
- `GET /health` → `{ status: "ok", time }`

### Authentication
| Method | Path | Auth | Body / Notes |
|---|---|---|---|
| POST | `/auth/register` | — | `{ name, email, password, phone? }` → `{ token, user }`. Password min 6 chars; 409 if email exists. |
| POST | `/auth/login` | — | `{ email, password }` → `{ token, user }`. 401 on bad credentials. |
| GET | `/auth/me` | Bearer token | Returns current user (incl. `addresses`). |

All `/api/*` clients attach the token as `Authorization: Bearer <token>`.

### Products (customer)
| Method | Path | Query params | Notes |
|---|---|---|---|
| GET | `/products` | `search`, `category`, `minPrice`, `maxPrice`, `sort` (`newest`, `price-asc`, `price-desc`, `name-asc`, `rating`), `page`, `limit` (max 50) | Returns `{ products, page, pages, total }`. Only `isActive` products. |
| GET | `/products/:id` | — | 404 if missing |

### Orders
| Method | Path | Auth | Body / Notes |
|---|---|---|---|
| POST | `/orders` | Bearer | `{ items:[{productId, quantity}], shippingAddress, customer, couponCode? }`. Server recomputes every price, validates stock atomically (`findOneAndUpdate` guarded by `stock >= qty`), creates the order, decrements stock. Returns `{ order }`. |
| GET | `/orders` | Bearer | Current user's orders (newest first). |
| GET | `/orders/:id` | Bearer | Owner or admin only (also matches by customer email). |
| POST | `/orders/:id/payment` | Bearer | `{ upiRef }` → sets `payment.utr`, `payment.status = "submitted"`, order → `PAYMENT_PENDING`. |
| POST | `/orders/track` | — | `{ orderNumber, email }` → public tracking with timeline (no auth). |

On placement the server sends a **best-effort** Gmail notification + customer confirmation (Nodemailer). Email failing never fails the order.

### Admin (Bearers with `role: "admin"`)
| Method | Path | Notes |
|---|---|---|
| GET | `/admin/stats` | order/sales/stock/users numbers + payment & low-stock alerts |
| GET | `/admin/orders` | `?status=&search=&page=&limit=` |
| GET | `/admin/orders/:id` | full order |
| PUT | `/admin/orders/:id/status` | `{ status }` from `ORDER_STATUSES`; pushes to `statusHistory` |
| PUT | `/admin/orders/:id/payment` | `{ verified: true\|false }` manual UPI verification |
| GET | `/admin/products` | includes inactive products |
| POST | `/admin/products` | create (auto-slugs name) |
| PUT | `/admin/products/:id` | update |
| DELETE | `/admin/products/:id` | delete |
| GET | `/admin/customers` · `/admin/coupons` | lists |

### Planned (later)
- Server-side cart for logged-in users: `GET /cart`, `POST /cart/items`, `PUT /cart/items/:productId`, `DELETE /cart/items/:productId`, `DELETE /cart`

## Contract notes

- Client never sends `price`, `subtotal` or `total` for orders — the server derives them.
- No payment gateway webhooks.
