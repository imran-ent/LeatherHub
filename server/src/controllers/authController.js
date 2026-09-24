import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

/**
 * POST /api/auth/register
 * Body: { name, email, password, phone? }
 */
export async function register(req, res, next) {
  try {
    const { name, email, password, phone = "" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "Account with this email already exists" });
    }

    const user = await User.create({ name, email, password, phone });

    res.status(201).json({
      token: signToken(user),
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const matched = await user.comparePassword(password);
    if (!matched) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      token: signToken(user),
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me  (protected)
 * Returns the currently authenticated user.
 */
export async function me(req, res) {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    role: req.user.role,
    addresses: req.user.addresses,
    createdAt: req.user.createdAt,
  });
}