const mongoose = require("mongoose");

async function connectDb() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn("MONGO_URI is not set. Starting without database connection.");
    return false;
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("MongoDB connected");
    return true;
  } catch (error) {
    console.warn(`MongoDB connection failed. Continuing without DB. (${error.message})`);
    return false;
  }
}

module.exports = {
  connectDb,
};
