import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
);

/** Reduces/merges an items array so each product appears once. */
cartSchema.methods.mergeItems = function (newItems) {
  for (const { productId, quantity } of newItems) {
    const existing = this.items.find(
      (i) => String(i.productId) === String(productId)
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({ productId, quantity });
    }
  }
};

export const Cart = mongoose.model("Cart", cartSchema);