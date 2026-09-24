import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { User } from "../src/models/User.js";

dotenv.config();

/**
 * Non-destructive admin creation for production.
 * Usage:
 *   node scripts/createAdmin.js
 *   # reads from env or falls back to defaults (override via args/env)
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=strongpass ADMIN_NAME="My Admin" node scripts/createAdmin.js
 *
 * Or with args:
 *   node scripts/createAdmin.js you@example.com strongpass "My Admin"
 */

const email = process.argv[2] || process.env.ADMIN_EMAIL || "admin@leatherhub.com";
const password = process.argv[3] || process.env.ADMIN_PASSWORD || "admin123456";
const name = process.argv[4] || process.env.ADMIN_NAME || "Leather-Hub Admin";
const phone = process.env.ADMIN_PHONE || "9876543210";

async function run() {
  if (!email || !password) {
    console.error("Email and password are required");
    process.exit(1);
  }
  if (password.length < 6) {
    console.error("Password must be at least 6 characters");
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    if (existing.role === "admin") {
      console.log(`Admin already exists: ${existing.email} (no changes)`);
    } else {
      existing.role = "admin";
      // Only update password if ADMIN_PASSWORD was explicitly provided
      if (process.argv[3] || process.env.ADMIN_PASSWORD) {
        existing.password = password;
      }
      await existing.save();
      console.log(`Existing user promoted to admin: ${existing.email}`);
    }
    await mongoose.connection.close();
    return;
  }

  const admin = await User.create({
    name,
    email,
    password,
    role: "admin",
    phone,
  });

  console.log(`Admin created: ${admin.email}`);
  console.log(`Name: ${admin.name}`);
  await mongoose.connection.close();
}

run().catch(async (err) => {
  console.error("createAdmin failed:", err.message);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
