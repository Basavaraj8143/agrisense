const { prisma } = require("./prisma");

const dbState = {
  connected: false,
  lastError: null,
};

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Database connection timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

async function connectDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    dbState.connected = false;
    dbState.lastError = "DATABASE_URL is not set";
    console.warn("DATABASE_URL is not set. Starting without database connection.");
    return false;
  }

  try {
    const timeoutMs = Number(process.env.DATABASE_CONNECT_TIMEOUT_MS) || 5000;
    await withTimeout(prisma.$connect(), timeoutMs);

    dbState.connected = true;
    dbState.lastError = null;
    console.log("PostgreSQL connected through Prisma");
    return true;
  } catch (error) {
    dbState.connected = false;
    dbState.lastError = error.message;
    console.warn(`PostgreSQL connection failed. Continuing without DB. (${error.message})`);
    return false;
  }
}

function isDbConnected() {
  return dbState.connected;
}

function getDbState() {
  return { ...dbState };
}

module.exports = {
  connectDb,
  isDbConnected,
  getDbState,
};
