import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.join(__dirname, "..", ".env") });

let cachedPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.warn("⚠️ Warning: Neither MONGO_URI nor MONGODB_URI is set in environment variables!");
    return null;
  }

  if (!cachedPromise) {
    cachedPromise = mongoose
      .connect(uri)
      .then((conn) => {
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn;
      })
      .catch((error) => {
        cachedPromise = null;
        console.error("MongoDB connection error:", error);
        throw error;
      });
  }

  return cachedPromise;
};

