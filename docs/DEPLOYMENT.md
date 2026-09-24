# Deployment Guide — Leather-Hub

Two supported modes. **Recommended:** split deploy (API on Render/Railway, Client on Vercel/Netlify). **Alt:** single host (Express serves `client/dist`).

---

## 1. Prerequisites

- MongoDB Atlas cluster (free M0). Create → Database → Connect → Drivers → copy `mongodb+srv://...` URI.
- GitHub repo pushed.
- Generate a strong `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## 2. Atlas Setup

1. Atlas → Network Access → Add IP: `0.0.0.0/0` (or Render/Vercel IPs).
2. Database Access → create db user (username/password).
3. Atlas → Database → Connect → copy URI, replace `<password>`, append `leather_hub` db name: `mongodb+srv://user:pass@cluster.x.mongodb.net/leather_hub?retryWrites=true&w=majority`
4. Test locally: set `MONGODB_URI` in `server/.env` to Atlas URI, `npm run dev` → should log `MongoDB connected`.

---

## 3A. Recommended — Split Deploy

### Backend — Render (free)

1. Render → New → Web Service → connect repo → Root Directory: `server`
2. Build: `npm ci --omit=dev`  Start: `node src/server.js`  (or use `render.yaml` at repo root — Render auto-detects it)
3. Environment:
   ```
   NODE_ENV=production
   PORT=10000           # Render injects PORT, app reads process.env.PORT
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=<32+ hex chars>
   CLIENT_URL=https://<your-vercel-url>.vercel.app
   # optional
   EMAIL_USER=you@gmail.com
   EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   # Gmail App Password
   ADMIN_EMAIL=you@gmail.com
   ```
   `CLIENT_URL` can be comma-separated for multiple origins.
4. Deploy → check logs → hit `https://<api>.onrender.com/api/health` and `/health` → `{status:"ok"}`

5. **Create admin (once, non-destructive):**
   - Render → Shell (or local with Atlas URI):
     ```bash
     ADMIN_EMAIL=admin@yourdomain.com ADMIN_PASSWORD=<strong> node scripts/createAdmin.js
     # or: node scripts/createAdmin.js admin@yourdomain.com strongpass "Admin Name"
     ```
   - This upserts; does NOT wipe products (unlike `npm run seed` which is blocked in prod without `ALLOW_SEED=1`).

6. (Optional) Seed products if DB empty — **only for fresh DB**:
   ```bash
   ALLOW_SEED=1 NODE_ENV=production node scripts/seed.js
   # also creates admin@leatherhub.com / admin123456 — change immediately via createAdmin or DB
   ```

### Frontend — Vercel

1. Vercel → New Project → import repo → Framework: Vite → Root Directory: `client` (or leave root and set build below)
2. Build settings:
   - Install: `npm install` (in `client`)
   - Build: `npm run build`
   - Output: `dist`
   - OR use root `vercel.json` already in repo (expects `client/dist`).
3. Environment Variable:
   ```
   VITE_API_URL=https://<your-render-api>.onrender.com
   ```
   Leave empty if you ever switch to single-host (client served by Express).
4. Deploy → open `https://<app>.vercel.app` → Login → admin redirect to `/admin` verified via `client/src/components/AdminRoute.jsx`.

> Important: `client/src/services/api.js` now reads `VITE_API_URL` (`client/src/services/api.js:1-3`), and `client/src/utils/imageUrl.js` prefixes `/uploads`/`/images` with it, so product images work cross-host. Vite proxy (`client/vite.config.js:8-18`) is dev-only.

---

## 3B. Alternative — Single Host (Express serves React)

Useful for Railway / Fly / single Docker.

1. Build client locally or in CI: `cd client && npm run build`
2. Deploy entire repo; ensure `client/dist` exists at deploy time (the server checks `fs.existsSync(clientDist)` at `server/src/server.js:133-141` and serves it with SPA fallback).
3. Same env as above, but `VITE_API_URL` can be empty (relative `/api` works), `CLIENT_URL` should match the same host origin.
4. Docker option (both):
   ```bash
   # API only
   docker build -f server/Dockerfile -t leather-hub-api ./server
   docker run -p 5000:5000 --env-file server/.env leather-hub-api

   # Client only (nginx)
   docker build -f client/Dockerfile --build-arg VITE_API_URL=https://api.example.com -t leather-hub-client ./client
   docker run -p 80:80 leather-hub-client
   ```

---

## 4. Env Reference

**Server** `server/.env.example`:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
CLIENT_URL=https://client.vercel.app
JWT_SECRET=<long random>
EMAIL_USER=...
EMAIL_APP_PASSWORD=...
ADMIN_EMAIL=...
```

**Client** `client/.env.example`:
```
VITE_API_URL=https://api.onrender.com   # empty for single-host
```

Never commit `.env`. `.gitignore` already ignores it.

---

## 5. Admin Login After Deploy

1. Create admin via `scripts/createAdmin.js` (above).
2. Open `https://<client>/login` → `email` + `password` → `POST /api/auth/login` (`server/src/controllers/authController.js:45`) → JWT (7d) → `client/src/context/AuthContext.jsx` stores token → `client/src/pages/Login.jsx:23` navigates `role==='admin' ? '/admin' : '/dashboard'`.
3. `/admin` guarded by `AdminRoute` + `protect`+`adminOnly` (`server/src/middleware/authMiddleware.js:8-39`, `server/src/routes/adminRoutes.js:21`). If 401/403, check `JWT_SECRET` mismatch and `Authorization: Bearer <token>`.

Default seed creds (dev only): `admin@leatherhub.com / admin123456` (`server/scripts/seed.js:10-185`, `README.md:44`).

---

## 6. Post-Deploy Checklist

- [ ] `GET /api/health` returns 200 (Render health check)
- [ ] `POST /api/auth/login` with admin works
- [ ] CORS not blocked (check `CLIENT_URL` matches Vercel domain exactly, no trailing slash)
- [ ] Images load: `/uploads/<file>` served via `server/src/server.js:101`, prefixed via `getImageUrl` when split
- [ ] Rate limiting sane: `server/src/server.js:79-94` (global 300/15m, auth 30/15m)
- [ ] Uploads: local `server/uploads/` is ephemeral on Render free — plan move to S3/Cloudinary for permanence (`docs/TECH.md:11`)
- [ ] Logs: `morgan` combined in prod (`server/src/server.js:54`)

---

## 7. Common Pitfalls

- `JWT_SECRET` different between deploy and token generation → 401 “token invalid”.
- `CLIENT_URL` missing protocol → CORS `Error: CORS blocked for origin`.
- Atlas IP whitelist `0.0.0.0/0` not set → `MongoServerSelectionError`.
- Running `npm run seed` in prod without `ALLOW_SEED=1` → refuses (intentional, `server/scripts/seed.js:7-11`).
- Vercel `VITE_API_URL` without `https://` → fetch fails.
- `VITE_`-prefix required — Vite only exposes `VITE_*` to client.

---

## 8. Updating

Push to `main` → Render auto-deploys API, Vercel auto-deploys client. No manual `seed` needed. Use `createAdmin` for new admins.

