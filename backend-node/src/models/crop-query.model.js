const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: ["image_gps", "manual_location"],
      required: true,
    },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    district: { type: String, required: true, trim: true },
    taluk: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const autofillSchema = new mongoose.Schema(
  {
    used: { type: Boolean, default: false },
    source: {
      type: String,
      enum: ["taluk_average", "district_average", "default_fallback", "manual"],
      default: "manual",
    },
  },
  { _id: false }
);

const cropSummarySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    score: { type: Number, required: true },
    yieldData: { type: String, default: null },
    marketPrice: { type: String, default: null },
  },
  { _id: false }
);

const cropQuerySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    input: {
      location: { type: locationSchema, required: true },
      soilType: { type: String, required: true, trim: true },
      season: { type: String, required: true, trim: true },
      n: { type: Number, required: true },
      p: { type: Number, required: true },
      k: { type: Number, required: true },
      ph: { type: Number, required: true },
      autofill: { type: autofillSchema, default: () => ({}) },
    },
    result: {
      primaryCrop: { type: cropSummarySchema, required: true },
      alternatives: { type: [cropSummarySchema], default: [] },
    },
    meta: {
      source: { type: String, required: true, trim: true },
      latencyMs: { type: Number, required: true },
      requestId: { type: String, required: true, trim: true },
    },
  },
  {
    timestamps: true,
  }
);

cropQuerySchema.index({ userId: 1, createdAt: -1 });
cropQuerySchema.index({ "input.location.district": 1, "input.season": 1 });

const CropQuery = mongoose.model("CropQuery", cropQuerySchema);

module.exports = CropQuery;
