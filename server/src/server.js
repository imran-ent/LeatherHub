import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { connectDB } from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

// --- Env validation (fail fast in production) ---
const requiredInProd = ["MONGODB_URI", "JWT_SECRET"];
if (process.env.NODE_ENV === "production") {
  for (const key of requiredInProd) {
    if (!process.env[key]) {
      console.error(`Missing required env var: ${key}`);
      process.exit(1);
    }
  }
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 16) {
    console.error("JWT_SECRET must be at least 16 characters in production");
    process.exit(1);
  }
  if (!process.env.CLIENT_URL) {
    console.warn("CLIENT_URL not set — CORS will allow any origin (not recommended for prod)");
  }
}

const app = express();

// Trust proxy when behind Render / Vercel / Nginx
app.set("trust proxy", 1);

// Security & perf middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(mongoSanitize());

// Logger: dev = combined, prod = common
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// CORS — support multiple origins via comma-separated CLIENT_URL
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser requests (curl, health checks) with no origin
      if (!origin) return cb(null, true);
      if (allowedOrigins.length === 0) return cb(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting — global + stricter for auth
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

// Ensure uploads directory exists (avoids crash on first upload in prod)
const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Health check — used by Render / load balancers
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString(), uptime: process.uptime() });
});
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString(), uptime: process.uptime() });
});

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);

// 404 for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Serve client build in production (single-host deploy option)
// If client/dist exists (e.g. when server and client are deployed together), serve it.
const clientDist = path.join(__dirname, "..", "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback — must be after /api routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// Central error handler
app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Server error";

  // Mongoose validation errors → 400
  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose duplicate key (e.g. unique email/slug) → 409
  if (err.code === 11000) {
    status = 409;
    message = "Duplicate value for a unique field";
  }

  // Mongoose invalid ObjectId → 400
  if (err.name === "CastError") {
    status = 400;
    message = "Invalid identifier";
  }

  res.status(status).json({
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT} [${process.env.NODE_ENV || "development"}]`);
  });
});

// Graceful shutdown
process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

export default app;
