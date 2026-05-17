const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const healthRouter = require("./routes/health.routes");
const authRouter = require("./routes/auth.routes");
const cropRouter = require("./routes/crop.routes");
const pestRouter = require("./routes/pest.routes");
const { attachRequestContext } = require("./middlewares/request-context.middleware");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");

const app = express();

morgan.token("request-id", (req) => req.requestId || "-");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler(req, res) {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
      error: { code: "RATE_LIMITED", details: [] },
      meta: {
        requestId: req.requestId || null,
        timestamp: new Date().toISOString(),
      },
    });
  },
});

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);
app.use(attachRequestContext);
app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? ':remote-addr :method :url :status :res[content-length] - :response-time ms req=:request-id'
      : ":method :url :status :response-time ms req=:request-id"
  )
);
app.use(limiter);
app.use(express.json({ limit: "1mb" }));

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/crop", cropRouter);
app.use("/api/pest", pestRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
