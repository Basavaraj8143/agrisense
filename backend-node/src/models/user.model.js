const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    authProvider: {
      type: String,
      enum: ["local", "google", "hybrid"],
      default: "local",
    },
    googleId: { type: String, default: null, sparse: true, unique: true },
    avatarUrl: { type: String, default: null },
    emailVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    preferredLanguage: { type: String, enum: ["en", "hi", "kn"], default: "en" },
    phone: { type: String, default: null },
    location: { type: String, default: null },
    farmSizeAcres: { type: Number, default: null },
    defaultSoilType: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
