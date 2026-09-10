// import 'dotenv/config';import {connectDB} from './config/db.js';import app from './app.js';connectDB().then(()=>app.listen(process.env.PORT||5000,()=>console.log('API running on port '+(process.env.PORT||5000))));
import "dotenv/config";
import { connectDB } from "./config/db.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });