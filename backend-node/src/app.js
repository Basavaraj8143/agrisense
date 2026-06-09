const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const healthRouter = require("./routes/health.routes");
const authRouter = require("./routes/auth.routes");
const profileRouter = require("./routes/profile.routes");
const cropRouter = require("./routes/crop.routes");
const pestRouter = require("./routes/pest.routes");
const { attachRequestContext } = require("./middlewares/request-context.middleware");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");

const app = express();

morgan.token("request-id", (req) => req.requestId || "-");

function getAllowedOrigins() {
  const rawValue = process.env.CORS_ORIGIN;

  if (!rawValue || rawValue.trim() === "*") {
    return [];
  }

  return rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

const allowedOrigins = getAllowedOrigins();

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
    origin(origin, callback) {
      if (allowedOrigins.length === 0 || !origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
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
app.use("/api/profile", profileRouter);
app.use("/api/crop", cropRouter);
app.use("/api/pest", pestRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
