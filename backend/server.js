<<<<<<< HEAD
// import 'dotenv/config';import {connectDB} from './config/db.js';import app from './app.js';connectDB().then(()=>app.listen(process.env.PORT||5000,()=>console.log('API running on port '+(process.env.PORT||5000))));
=======
>>>>>>> 719931bac6b098f0ff68f6a02fb3be01dceb4af8
import "dotenv/config";
import { connectDB } from "./config/db.js";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

<<<<<<< HEAD
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
=======
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
>>>>>>> 719931bac6b098f0ff68f6a02fb3be01dceb4af8
