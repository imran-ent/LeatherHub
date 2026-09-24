# AGENTS.md

## Project

**Leather-Hub** — a premium black-and-white leather e-commerce store (wallets, belts, bags, card holders, laptop bags, accessories). MERN stack, built phase by phase for learning and manual debugging.

## Project Rules

- Use MERN stack (React + Vite + Tailwind, Node + Express, MongoDB + Mongoose).
- Use React components with single responsibilities.
- Never put secrets in frontend code.
- Never commit .env files.
- Backend is the source of truth for prices and stock.
- Never trust client-provided totals (prices, quantities, discounts).
- Validate all user input on the server.
- Use MongoDB transactions/atomic operations where appropriate.
- Admin routes require authentication and admin authorization.
- Customer routes require authentication where applicable.
- Payment status must be manually verified by admin (UPI is manual, no gateway).
- Gmail (Nodemailer) is notification only, not order storage. MongoDB is the source of truth for orders.
- Do not integrate Stripe/payment gateway in MVP.
- Keep API logic separate from UI logic.
- Use reusable components.
- Every async operation must have loading/error states.
- Product images must reserve fixed aspect-ratio space (aspect-[4/5]) to prevent layout shift.
- Avoid unnecessary global state.

## Commands

### Server (`server/`)
- `npm run dev` — start server with auto-restart (requires MongoDB on `mongodb://127.0.0.1:27017/leather_hub`)
- `npm start` — start server
- `npm run seed` — wipe and reseed the 10 sample products

### Client (`client/`)
- `npm run dev` — start Vite dev server on http://localhost:5173 (proxies `/api` to :5000)
- `npm run build` — production build
- `npm run preview` — preview the production build

### Flow for debugging any feature
```
Browser → React Component → API function (services/api.js)
       → HTTP request → Express Route → Controller → Mongoose Model
       → MongoDB → Response → React → UI update
```
