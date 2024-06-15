import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
const app = express();
const PORT = process.env.PORT || 8080;
dotenv.config({});

// Router Imports
import { router as userRouter } from "./src/routers/user/base.js";
import { router as adminRouter } from "./src/routers/admin/base.js";
// Server Imports
import { establishMongoConnection } from "./config/database/mongo.js";
import { redisClient } from "./config/database/redis.js";

// Server Middle-wares and config
app.use(express.json({ limit: "10mb", extended: true })); // limits the request size to 10mib.
app.use(express.urlencoded({ extended: true })); // express only parses urlencoded requests.
app.use((req, res, next) => {
  // Excluding razorpay webhook route from CORS
  if (req.path === "/user/payment/success") {
    next();
  } else {
    // Applying CORS middleware with options
    cors({
      origin: "*",
    })(req, res, next);
  }
}); // CORS security policy.
app.use(morgan("dev")); // For logging of requests

// Loading Routers
app.use("/user", userRouter);
app.use("/admin", adminRouter);

/**
 * Test Request
 */

app.get("/", async (req, res) => {
  try {
    res.status(200).send("Hey Wassup!!");
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

Promise.all([establishMongoConnection()])
  .then(async () => {
    await redisClient
      .on("error", (err) => console.error("Redis error", err))
      .on("ready", () => console.log("Redis is ready"))
      .connect()
      .then(async () => {
        console.log("Connect to Redis");
      })
      .catch((err) => {
        console.error("Redis connection error: ", e);
        process.exit(1);
      });
  })
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server started on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
