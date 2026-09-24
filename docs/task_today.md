# Task Tracker

Today's focus: **All phases built — Foundation, Catalog, Cart, Auth, Orders, Gmail+UPI, Admin, Tracking** (complete). Check off as you verify each item manually.

## Phase 5 — Orders

- [x] Checkout page (protected, prefills from account)
- [x] `POST /api/orders` — server-side price calc, coupon, atomic stock
- [x] Order model + order number (`LTH-YYYYMMDD-XXX`)
- [x] Order success page
- [x] Cart → checkout enabled; order snapshots (name/price/qty)

## Phase 6 — Gmail + UPI

- [x] `emailService` (Nodemailer, best-effort — app runs without Gmail)
- [x] UPI QR displayed at order confirmation
- [x] UTR submission (`POST /api/orders/:id/payment`)
- [x] Admin payment verification + failed action

## Phase 7 — Admin

- [x] `GET /api/admin/stats` dashboard numbers
- [x] Admin login (`admin@leatherhub.com` / `admin123456`)
- [x] Orders list (status filter + search) + order detail (verify/advance/cancel)
- [x] Products CRUD + hide/show
- [x] Customers & coupons list endpoints

## Phase 8 — Tracking

- [x] Public track by order ID + email
- [x] `OrderTimeline` visual component
- [x] Dashboard "My Orders" lists real orders

## Browser checks to do

- [ ] Place an order in the browser end-to-end (cart → checkout → UPI → UTR → admin verify → track)
- [ ] Confirm the admin dashboard updates after an order
- [ ] Confirm stock decreases and low-stock alert appears
- [ ] Try a bogus coupon code — should fail server-side

## Checklist before each phase

- [ ] MongoDB running on 27017
- [ ] Server: `npm run dev` (or `npm start`); run `npm run seed` for fresh data
- [ ] Client: `npm run dev` on :5173
- [ ] Check Console + Network tabs when a feature misbehaves
