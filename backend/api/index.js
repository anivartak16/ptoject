import app from "../app.js";
import { connectDB } from "../config/db.js";

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error("MongoDB connection error in serverless handler:", err);
  }
  return app(req, res);
}
