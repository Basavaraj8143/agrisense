const express = require("express");

const profileController = require("../controllers/profile.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { validateBody } = require("../middlewares/validate.middleware");
const { updateProfileSchema, changePasswordSchema } = require("../validators/profile.validators");

const router = express.Router();

router.get("/me", requireAuth, profileController.getProfile);
router.patch("/me", requireAuth, validateBody(updateProfileSchema), profileController.updateProfile);
router.patch("/password", requireAuth, validateBody(changePasswordSchema), profileController.changePassword);

module.exports = router;
