const jwt = require("jsonwebtoken");

function createAccessToken(user) {
  const jwtSecret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "1d";

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
    },
    jwtSecret,
    { expiresIn }
  );
}

module.exports = {
  createAccessToken,
};
