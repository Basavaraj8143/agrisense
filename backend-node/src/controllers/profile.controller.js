const bcrypt = require("bcryptjs");
const { prisma } = require("../db/prisma");
const { ensureDbConnected } = require("../utils/ensure-db-connected");
const { HttpError } = require("../utils/http-error");

function toUserProfileView(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    preferredLanguage: user.preferredLanguage,
    phone: user.phone || null,
    location: user.location || null,
    farmSizeAcres: user.farmSizeAcres || null,
    defaultSoilType: user.defaultSoilType || null,
    authProvider: user.authProvider,
    role: user.role,
  };
}

async function getProfile(req, res, next) {
  try {
    ensureDbConnected();
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new HttpError(404, "User not found", "RESOURCE_NOT_FOUND");
    }

    return res.status(200).json({
      success: true,
      message: "Profile fetched",
      data: toUserProfileView(user),
      meta: {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    ensureDbConnected();
    const updates = req.validatedBody;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updates,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      data: toUserProfileView(updatedUser),
      meta: {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    ensureDbConnected();
    const { currentPassword, newPassword } = req.validatedBody;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      throw new HttpError(404, "User not found", "RESOURCE_NOT_FOUND");
    }

    if (user.authProvider === "google" && !user.passwordHash) {
      throw new HttpError(
        403,
        "Password change is not available for Google-only accounts",
        "AUTH_PASSWORD_NOT_APPLICABLE"
      );
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash || "");
    if (!isMatch) {
      throw new HttpError(401, "Invalid current password", "AUTH_INVALID_CREDENTIALS");
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        passwordHash,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
      data: {},
      meta: {
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
