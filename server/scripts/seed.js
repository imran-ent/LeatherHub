import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../src/config/db.js";
import { Product } from "../src/models/Product.js";
import { User } from "../src/models/User.js";
import { Coupon } from "../src/models/Coupon.js";

dotenv.config();

const products = [
  {
    name: "Classic Leather Wallet",
    slug: "classic-leather-wallet",
    description:
      "Genuine leather wallet, hand stitched with 6 card slots and 2 cash compartments. Ages beautifully with use.",
    price: 1499,
    category: "wallets",
    images: ["/images/products/classic-leather-wallet.svg"],
    stock: 12,
    material: "Full-grain leather",
    dimensions: "11 x 9 x 2 cm",
    colors: ["Black", "Tan"],
    rating: 4.8,
  },
  {
    name: "Slim Card Holder",
    slug: "slim-card-holder",
    description:
      "Minimalist card holder that fits in any pocket. Holds up to 8 cards with a quick-access center slot.",
    price: 799,
    category: "card-holders",
    images: ["/images/products/slim-card-holder.svg"],
    stock: 25,
    material: "Full-grain leather",
    dimensions: "10 x 7 x 1 cm",
    colors: ["Black", "Brown"],
    rating: 4.6,
  },
  {
    name: "Classic Leather Belt",
    slug: "classic-leather-belt",
    description:
      "Hand-finished full-grain leather belt with a solid brass buckle. Width 3.2cm, adjustable fit.",
    price: 999,
    category: "belts",
    images: ["/images/products/classic-leather-belt.svg"],
    stock: 30,
    material: "Full-grain leather",
    dimensions: "110 cm x 3.2 cm",
    colors: ["Black", "Cognac"],
    rating: 4.7,
  },
  {
    name: "Heritage Leather Bag",
    slug: "heritage-leather-bag",
    description:
      "A timeless everyday leather tote with a spacious main compartment, interior pockets, and a full-length zip.",
    price: 3499,
    category: "bags",
    images: ["/images/products/heritage-leather-bag.svg"],
    stock: 8,
    material: "Genuine leather",
    dimensions: "38 x 30 x 12 cm",
    colors: ["Black", "Tan"],
    rating: 4.9,
  },
  {
    name: "Laptop Leather Briefcase",
    slug: "laptop-leather-briefcase",
    description:
      "Fits laptops up to 15.6 inches. Padded sleeve, organizer pockets, and a comfortable carry handle.",
    price: 4299,
    category: "laptop-bags",
    images: ["/images/products/laptop-leather-briefcase.svg"],
    stock: 6,
    material: "Genuine leather",
    dimensions: "42 x 30 x 8 cm",
    colors: ["Black", "Brown"],
    rating: 4.7,
  },
  {
    name: "Key Holder with Brass Ring",
    slug: "key-holder-with-brass-ring",
    description:
      "A small leather key organiser with a solid brass ring and quick-release buckle.",
    price: 499,
    category: "accessories",
    images: ["/images/products/key-holder-with-brass-ring.svg"],
    stock: 40,
    material: "Full-grain leather",
    dimensions: "9 x 3.5 cm",
    colors: ["Black", "Cognac", "Green"],
    rating: 4.5,
  },
  {
    name: "Zip Around Wallet",
    slug: "zip-around-wallet",
    description:
      "Full-zip wallet with 10 card slots, a coin pocket, and two bill sections. Secure and compact.",
    price: 1899,
    category: "wallets",
    images: ["/images/products/zip-around-wallet.svg"],
    stock: 15,
    material: "Full-grain leather",
    dimensions: "12 x 9 x 3 cm",
    colors: ["Black", "Tan"],
    rating: 4.6,
  },
  {
    name: "Bifold Wallet for Men",
    slug: "bifold-wallet-for-men",
    description:
      "Classic bifold with RFID-blocking lining, 8 card slots, and a transparent ID window.",
    price: 1299,
    category: "wallets",
    images: ["/images/products/bifold-wallet-for-men.svg"],
    stock: 18,
    material: "Genuine leather",
    dimensions: "11.5 x 9 x 2.5 cm",
    colors: ["Black", "Brown"],
    rating: 4.4,
  },
  {
    name: "Everyday Leather Sling Bag",
    slug: "everyday-leather-sling-bag",
    description:
      "Compact crossbody sling with an adjustable strap, magnetic flap closure, and rear pocket.",
    price: 2799,
    category: "bags",
    images: ["/images/products/everyday-leather-sling-bag.svg"],
    stock: 10,
    material: "Genuine leather",
    dimensions: "28 x 20 x 7 cm",
    colors: ["Black", "Tan"],
    rating: 4.5,
  },
  {
    name: "Leather Passport Holder",
    slug: "leather-passport-holder",
    description:
      "Protect your passport with this slim leather cover. Includes boarding-pass slot and card pocket.",
    price: 899,
    category: "accessories",
    images: ["/images/products/leather-passport-holder.svg"],
    stock: 22,
    material: "Full-grain leather",
    dimensions: "14 x 10.5 x 1 cm",
    colors: ["Black", "Navy", "Cognac"],
    rating: 4.7,
  },
];

async function seed() {
  // Safety: prevent accidental wipe in production
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_SEED) {
    console.error("Refusing to seed in production. Set ALLOW_SEED=1 to force, or use createAdmin.js");
    process.exit(1);
  }

  try {
    await connectDB();
    await Product.deleteMany({});
    const created = await Product.insertMany(products);
    console.log(`Seeded ${created.length} products`);

    // Admin account (dev credentials printed at the end).
    // Recreate via save() so the bcrypt pre-save hook runs.
    await User.deleteOne({ email: "admin@leatherhub.com" });
    const admin = await User.create({
      name: "Leather-Hub Admin",
      email: "admin@leatherhub.com",
      password: "admin123456",
      role: "admin",
      phone: "9876543210",
    });
    console.log(`Admin ready: ${admin.email}`);

    // Sample coupons (upsert by code).
    const coupons = [
      { code: "WELCOME10", type: "percent", value: 10, minAmount: 999, maxDiscount: 300 },
      { code: "LEATHER20", type: "percent", value: 20, minAmount: 1999, maxDiscount: 500 },
      { code: "FLAT50", type: "fixed", value: 50, minAmount: 499, maxDiscount: 0 },
    ];
    for (const coupon of coupons) {
      await Coupon.findOneAndUpdate({ code: coupon.code }, coupon, { upsert: true, new: true });
    }
    console.log(`Seeded ${coupons.length} coupons`);

    console.log("\n--- DEV LOGIN ---");
    console.log(`Admin email:    admin@leatherhub.com`);
    console.log(`Admin password: admin123456`);
  } finally {
    await mongoose.connection.close();
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
