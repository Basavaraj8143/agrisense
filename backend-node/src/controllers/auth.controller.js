const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("../models/user.model");
const { HttpError } = require("../utils/http-error");
const { createAccessToken } = require("../utils/token");

function toUserView(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    preferredLanguage: user.preferredLanguage,
    authProvider: user.authProvider,
    avatarUrl: user.avatarUrl,
    role: user.role,
  };
}

function ensureDbConnected() {
  if (mongoose.connection.readyState !== 1) {
    throw new HttpError(503, "Database unavailable", "SERVICE_UNAVAILABLE");
  }
}

async function register(req, res, next) {
  try {
    ensureDbConnected();
    const { name, email, password, preferredLanguage } = req.validatedBody;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new HttpError(409, "Email already registered", "CONFLICT_DUPLICATE", [
        { field: "email", issue: "Already in use" },
      ]);
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      name,
      email,
      passwordHash,
      authProvider: "local",
      preferredLanguage: preferredLanguage || "en",
    });

    const token = createAccessToken(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: toUserView(user),
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    ensureDbConnected();
    const { email, password } = req.validatedBody;

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      throw new HttpError(401, "Invalid email or password", "AUTH_INVALID_CREDENTIALS");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new HttpError(401, "Invalid email or password", "AUTH_INVALID_CREDENTIALS");
    }

    const token = createAccessToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: toUserView(user),
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    ensureDbConnected();
    return res.status(200).json({
      success: true,
      message: "Current user fetched",
      data: toUserView(req.user),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  me,
};
