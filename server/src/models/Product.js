import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "wallets",
        "belts",
        "bags",
        "card-holders",
        "laptop-bags",
        "accessories",
      ],
      index: true,
    },
    images: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    material: {
      type: String,
      default: "Genuine leather",
    },
    dimensions: {
      type: String,
      default: "",
    },
    colors: {
      type: [String],
      default: ["Black"],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model("Product", productSchema);
