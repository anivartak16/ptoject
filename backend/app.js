import express from "express";
import cors from "cors";
import morgan from "morgan";
import apiRouter from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import chatRoutes from "./routes/chatRoutes.js";
const app = express();
<<<<<<< HEAD
import chatRoutes from "./routes/chatRoutes.js";
=======
>>>>>>> 719931bac6b098f0ff68f6a02fb3be01dceb4af8
app.use("/api/chat", chatRoutes);
app.use(
  cors({
    origin: (origin, cb) => {
      if (
        !origin ||
        origin === process.env.CLIENT_URL ||
        /^http:\/\/localhost:517\d$/.test(origin)
      ) {
        return cb(null, true);
      }
      cb(new Error("CORS origin not allowed"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(morgan("dev"));

// API Router
app.use("/api", apiRouter);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
