import express from "express";
import cors from "cors";
import morgan from "morgan";
import apiRouter from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import market from './routes/marketPrice.routes.js'

const app = express();
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

app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

// API Router
app.use("/api", apiRouter);
app.use('/',(req,res)=>{
  return res.json({
    success : true,
  })
})

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
