const mongoose = require("mongoose");

const pestResultSchema = new mongoose.Schema(
  {
    scientificName: { type: String, required: true, trim: true },
    confidencePercent: { type: Number, required: true },
    commonNames: { type: String, default: "Unknown" },
    treatmentSummary: { type: String, default: "Treatment guidance unavailable." },
  },
  { _id: false }
);

const providerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    providerResponseId: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const pestQuerySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    imageUrl: { type: String, default: null, trim: true },
    imageHash: { type: String, default: null, trim: true },
    result: { type: pestResultSchema, required: true },
    provider: { type: providerSchema, required: true },
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

pestQuerySchema.index({ userId: 1, createdAt: -1 });
pestQuerySchema.index({ imageHash: 1 });

const PestQuery = mongoose.model("PestQuery", pestQuerySchema);

module.exports = PestQuery;
