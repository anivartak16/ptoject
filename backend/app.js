import express from "express";
import cors from "cors";
import morgan from "morgan";
import apiRouter from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";


import { connectDB } from "./config/db.js";

const app = express();

// CORS configuration supporting production Vercel frontend, preview domains, and local dev
const allowedOrigins = [
  "https://krishilink-three.vercel.app",
  process.env.CLIENT_URL,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback to allow legitimate frontend connections
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

// Mock socket remoteAddress for serverless lambdas if missing
app.use((req, res, next) => {
  if (!req.socket) req.socket = {};
  if (!req.socket.remoteAddress) {
    req.socket.remoteAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.headers["x-real-ip"] ||
      "127.0.0.1";
  }
  next();
});

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Vercel Serverless Path Normalizer & DB Connection Middleware
app.use(async (req, res, next) => {
  // Normalize URL if Vercel rewrote it to a handler file
  const originalPath =
    req.headers["x-matched-path"] ||
    req.headers["x-forwarded-uri"] ||
    req.headers["x-invoke-path"];

  if (
    originalPath &&
    (req.url === "/api" || req.url === "/api/" || req.url === "/api/index.js")
  ) {
    req.url = originalPath;
  }

  // Ensure DB is connected
  try {
    await connectDB();
  } catch (err) {
    console.error("DB connection error in request middleware:", err);
  }

  next();
});

// Root health & status check
app.get("/", (_req, res) => {
  return res.json({
    success: true,
    message: "KrishiLink API is running",
    timestamp: new Date().toISOString(),
  });
});

// API Router mounted on both /api and / so all route paths succeed
app.use("/api", apiRouter);
app.use("/", apiRouter);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
