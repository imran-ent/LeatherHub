# Leather-Hub — PRD

Premium black-and-white leather e-commerce site. MERN stack. Manual UPI payment (no gateway).

## Core principle

**Frontend is presentation. Backend is the authority.**
The server recalculates prices, quantities and totals from MongoDB. Never trust client-provided numbers.

## Customer flow

```
Browse → Cart → Checkout → Place order → Order in MongoDB
      → Email to admin Gmail → UPI QR shown → Customer pays manually
      → Admin verifies UTR → Admin updates status → Customer tracks order
```

- **Gmail (Nodemailer) = notification only.** MongoDB is the source of truth for orders.
- **UPI = manual.** Customer submits a UTR/transaction ID; admin verifies it and flips payment status. No gateway, no webhooks.

## Visual direction

Minimal + premium + monochrome. Photography provides the warmth; UI stays monochrome.

Palette: `bg #F7F7F5`, `primary #111111`, `secondary #242424`, `text #171717`, `muted #737373`, `borders #DADADA`, `white #FFFFFF`.

Type: Playfair Display (headings), Inter (body).

## Scope

### Customer
- Home (hero, featured, categories, story, reviews, newsletter)
- Shop (search, category, price filter, sort, pagination)
- Product details (gallery, specs, qty, add to cart, buy now)
- Cart (qty, remove, subtotal, coupon later)
- Checkout → Place order → UPI QR → UTR submit
- Order success + tracking
- Auth: register/login (JWT), dashboard, order history

### Admin
- Dashboard (order/sales/stock/users stats)
- Product CRUD + inventory + images + availability
- Order management + UPI verification + status updates

### Backend
- Express + MongoDB + Mongoose, JWT + bcrypt, Nodemailer
- Server-side validation, atomic inventory updates
- Order snapshot (order stores `name`, `price`, `quantity` — not just `productId`)

## Excluded from MVP

Stripe, Razorpay, payment webhooks, multi-vendor, dynamic pricing, multi-currency, advanced analytics, recommendation engine.

## Order statuses

```
ORDER_PLACED → PAYMENT_PENDING → PAYMENT_VERIFIED → PROCESSING
→ SHIPPED → OUT_FOR_DELIVERY → DELIVERED   |  CANCELLED
```

## Development order

1. Foundation  2. Catalog  3. Cart  4. Auth  5. Orders
6. Gmail + UPI  7. Admin  8. Tracking  9. Polish
