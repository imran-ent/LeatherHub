# Testing & Debugging

No automated test framework yet (kept minimal on purpose). Debug manually along this chain:

```
Browser → React Component → services/api.js → HTTP → Express Route
       → Controller → Mongoose Model → MongoDB → Response → React → UI
```

## Checklist per feature

1. **MongoDB** — confirm `27017` is listening; run `npm run seed` in `server/` if data looks wrong.
2. **Server** — start it; check `http://localhost:5000/api/health` → `{ status: "ok" }`.
3. **API** — hit endpoints directly, e.g.:
   ```powershell
   curl.exe "http://localhost:5000/api/products?search=wallet&sort=price-asc"
   ```
4. **Proxy** — confirm `http://localhost:5173/api/...` forwards (checks `vite.config.js`).
5. **Client** — open the browser DevTools:
   - Console tab: JS errors
   - Network tab: request/response for the failing call
   - React tab (if using React DevTools): component state/props

## Common failure points

| Symptom | Likely cause |
|---|---|
| `MongoServerSelectionError` / DB not connecting | MongoDB not running, or `MONGODB_URI` wrong |
| Empty shop page | Seed not run (`npm run seed`) or server not started |
| `Proxy error` in Vite | Backend not running on :5000 |
| Cart not persisting | `localStorage` blocked, or `CartProvider` not wrapping the app |
| `CORS` error | `CLIENT_URL` in `server/.env` doesn't match Vite origin |

## Known commands

- Server: `npm run dev` (auto-restart) or `npm start`
- Client: `npm run dev`, then open http://localhost:5173
- Reseed: `npm run seed`
