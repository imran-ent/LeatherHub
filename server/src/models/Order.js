import mongoose from "mongoose";

export const ORDER_STATUSES = [
  "ORDER_PLACED",
  "PAYMENT_PENDING",
  "PAYMENT_VERIFIED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

/**
 * Orders store a snapshot of each item (name, price, quantity, image)
 * rather than only `productId`, so past orders never change when the
 * current product price/stock does.
 */
const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true },
    },
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    items: { type: [orderItemSchema], required: true },

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    couponCode: { type: String, default: null },

    payment: {
      method: { type: String, default: "UPI" },
      status: { type: String, enum: ["pending", "submitted", "verified", "failed"], default: "pending" },
      utr: { type: String, default: null },
    },

    status: { type: String, enum: ORDER_STATUSES, default: "ORDER_PLACED" },
    statusHistory: { type: [statusHistorySchema], default: [] },
  },
  { timestamps: true }
);

orderSchema.methods.addStatus = function (status) {
  this.status = status;
  this.statusHistory.push({ status, at: new Date() });
};

export const Order = mongoose.model("Order", orderSchema);