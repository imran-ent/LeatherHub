# Leather-Hub

A premium black-and-white leather e-commerce store — wallets, belts, bags, card holders, laptop bags and accessories. Built with the MERN stack, one feature at a time, for learning and manual debugging.

> **Deployed?** See **Deploy** section below and `docs/DEPLOYMENT.md` for Atlas + Render + Vercel steps.

## Stack

- **Client:** React 19 + Vite + Tailwind CSS v4, react-router-dom
- **Server:** Node.js + Express, MongoDB + Mongoose
- **Later phases:** JWT + bcrypt auth, Nodemailer (Gmail) notifications, manual UPI payment verification, admin dashboard, order tracking

> Payments are **manual UPI** — customer pays via QR, submits a UTR, admin verifies. No gateway. Gmail is notification-only; MongoDB is the source of truth for orders.

## Getting started

Prerequisites: Node 18+, MongoDB running locally on `127.0.0.1:27017`.

```bash
# Backend
cd server
npm install
cp .env.example .env        # then edit .env if needed
npm run seed                # wipe + insert 10 sample products
npm run dev                 # http://localhost:5000

# Frontend (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

Vite proxies `/api` to the backend on :5000, so the app just works at http://localhost:5173.
In production, set `VITE_API_URL` in `client/.env` to your API URL (e.g. `https://your-api.onrender.com`) — see `client/.env.example`.

## Docs

See `docs/` — [PRD](docs/PRD.md), [TECH](docs/TECH.md), [DATABASE](docs/DATABASE.md), [API](docs/API.md), [TESTING](docs/TESTING.md), [DEPLOYMENT](docs/DEPLOYMENT.md), and the daily [task tracker](docs/task_today.md). Project rules live in [AGENTS.md](AGENTS.md).

## Status

- **Done:** Foundation (1) · Catalog (2) · Cart (3) · Auth (4) · Orders (5) · Gmail + UPI (6) · Admin (7) · Tracking (8) · Production hardening (9)
- **Remaining:** Image CDN (S3/Cloudinary) for persistent uploads

## Admin login

**Dev:** After `npm run seed` in `server/`:
- Email: `admin@leatherhub.com`
- Password: `admin123456`

**Prod:** Use non-destructive script (never `seed` in prod):
```bash
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=<strong> npm run create-admin
# or: node scripts/createAdmin.js you@example.com strongpass "Your Name"
```
See `docs/DEPLOYMENT.md` for full deploy steps (Atlas + Render + Vercel).

## Order flow

Cart → Checkout (sign-in required) → Place order → order stored in MongoDB + Gmail notification → UPI QR shown → customer submits UTR → admin verifies payment → admin advances status (Shipped → Delivered) → customer tracks by order ID + email.

## Deploy (production)

1. **Atlas:** create cluster → `MONGODB_URI=mongodb+srv://.../leather_hub`
2. **Render (API):** New Web Service → Root `server` → Build `npm ci --omit=dev` → Start `node src/server.js` → Env `MONGODB_URI`, `JWT_SECRET` (long random), `CLIENT_URL=https://<vercel>.vercel.app`, `NODE_ENV=production` → health check `/api/health`
3. **Create admin once:** `ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run create-admin` (non-destructive, `server/scripts/createAdmin.js`)
4. **Vercel (Client):** Import repo → Root `client` → Build `npm run build` → Output `dist` → Env `VITE_API_URL=https://<render-api>.onrender.com`
5. Open `https://<vercel>.vercel.app/login` → admin login → redirected to `/admin`

Full steps + Docker + pitfalls: `docs/DEPLOYMENT.md`.

## Debug flow

```
Browser → React Component → services/api.js → HTTP → Express Route
       → Controller → Mongoose Model → MongoDB → Response → React → UI
```
