import mongoose from "mongoose";

/**
 * Connect to MongoDB.
 * Reads the connection string from MONGODB_URI in .env.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(uri, {
      // Avoid hanging forever on bad URI in prod
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
}
