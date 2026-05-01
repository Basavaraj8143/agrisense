require("dotenv").config();

const app = require("./app");
const { connectDb } = require("./db/connect");

const PORT = Number(process.env.PORT) || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";

async function bootstrap() {
  try {
    await connectDb();

    app.listen(PORT, () => {
      console.log(`backend-node running on port ${PORT} (${NODE_ENV})`);
    });
  } catch (error) {
    console.error("Failed to start backend-node:", error.message);
    process.exit(1);
  }
}

bootstrap();
