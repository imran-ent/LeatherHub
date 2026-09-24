import { User } from "../models/User.js";

function badRequest(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function validateAddress(address) {
  if (!address?.address || !address?.city || !address?.state || !address?.pincode) {
    throw badRequest("Address needs address, city, state and pincode");
  }
  if (!/^\d{6}$/.test(String(address.pincode).trim())) {
    throw badRequest("Pincode must be 6 digits");
  }
}

/**
 * PUT /api/users/profile  Body: { name?, phone? }
 * Returns updated user (minus password).
 */
export async function updateProfile(req, res, next) {
  try {
    const { name, phone } = req.body;

    if (name !== undefined && !String(name).trim()) {
      throw badRequest("Name cannot be empty");
    }

    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (phone !== undefined) updates.phone = String(phone).trim();

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    res.json(user);
  } catch (error) {
    next(error);
  }
}

/** GET /api/users/addresses */
export async function getAddresses(req, res) {
  res.json(req.user.addresses || []);
}

/** POST /api/users/addresses  Body: { address, city, state, pincode } */
export async function addAddress(req, res, next) {
  try {
    validateAddress(req.body);
    const user = await User.findById(req.user._id);
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json(user.addresses);
  } catch (error) {
    next(error);
  }
}

/** PUT /api/users/addresses/:id  Body: { address, city, state, pincode } */
export async function updateAddress(req, res, next) {
  try {
    validateAddress(req.body);
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);
    if (!address) throw badRequest("Address not found");

    address.set(req.body);
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/users/addresses/:id */
export async function deleteAddress(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);
    if (!address) throw badRequest("Address not found");

    user.addresses.pull({ _id: req.params.id });
    await user.save();
    res.json(user.addresses);
  } catch (error) {
    next(error);
  }
}