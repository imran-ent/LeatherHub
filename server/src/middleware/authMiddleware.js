import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

/**
 * Verifies the Bearer token and attaches `req.user` (the user document,
 * minus password) to the request. Rejects when missing/invalid.
 */
export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token invalid or expired" });
  }
}

/**
 * Call after `protect`. Only allows admins through.
 */
export function adminOnly(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Not authorized as admin" });
}