# Tech Stack

| Layer     | Choice                          |
|-----------|---------------------------------|
| Frontend  | React 19 + Vite + Tailwind CSS v4 |
| Router    | react-router-dom                |
| Backend   | Node.js + Express 4             |
| Database  | MongoDB + Mongoose              |
| Auth      | JWT + bcrypt (bcryptjs)         |
| Email     | Nodemailer → Gmail (Phase 6)    |
| Images    | Local uploads first, Cloudinary/S3 later |
| Payments  | None (manual UPI verification)  |

## Project layout

```
Leather-Hub/
├── client/               # React + Vite + Tailwind
│   └── src/
│       ├── components/   # Navbar, Footer, ProductCard, ProductGrid, LoadingSpinner,
│       │                 # ProtectedRoute, AdminRoute, OrderTimeline
│       ├── pages/        # Home, Shop, ProductDetails, Cart, Checkout, OrderSuccess,
│       │                 # About, TrackOrder, Login, Register, Dashboard, admin/*
│       ├── context/      # CartContext, AuthContext
│       ├── services/     # api.js (product/auth/order/admin services)
│       ├── hooks/        # useAuth, usePageTitle
│       ├── utils/        # formatCurrency.js
│       ├── App.jsx
│       └── main.jsx
├── server/               # Express + Mongoose
│   ├── scripts/          # seed.js (products + admin + coupons)
│   └── src/
│       ├── config/       # db.js
│       ├── models/       # User, Product, Order, Coupon
│       ├── controllers/  # product, auth, order, admin controllers
│       ├── routes/       # product, auth, order, admin routes
│       ├── middleware/   # authMiddleware (protect, adminOnly)
│       ├── services/     # orderService, emailService (Nodemailer)
│       ├── utils/        # generateOrderNumber, calculateDiscount
│       └── server.js
├── docs/
├── AGENTS.md
├── .gitignore
└── README.md
```

## Debug flow

```
Browser → React Component → services/api.js → HTTP → Express Route
       → Controller → Mongoose Model → MongoDB → Response → React → UI
```

## Key conventions

- Tailwind theme tokens are defined in `client/src/index.css` via `@theme`
  (`bg`, `primary`, `secondary`, `text`, `muted`, `line`, `white`; `font-heading`, `font-body`).
- Product images always render inside `aspect-[4/5]` containers.
- Server is `type: module` (ESM). Client uses JSX components.
- Vite dev server proxies `/api` → `http://localhost:5000`.
