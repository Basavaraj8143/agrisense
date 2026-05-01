const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const healthRouter = require("./routes/health.routes");
const authRouter = require("./routes/auth.routes");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
    error: { code: "RATE_LIMITED" },
  },
});

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(limiter);
app.use(express.json({ limit: "1mb" }));

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
