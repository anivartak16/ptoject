import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
dotenv.config({ path: path.join(__dirname, ".env"), override: true });

import { connectDB } from "./config/db.js";
import app from "./app.js";
import { startRealTimeSyncScheduler } from "./services/agmarknetService.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    
    // Start automated background mandi price sync daemon (runs every 30m + auto-sync on boot)
    startRealTimeSyncScheduler(30);

    app.listen(PORT, () => {
      console.log(`API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
