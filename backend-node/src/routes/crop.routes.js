const express = require("express");

const cropController = require("../controllers/crop.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { validateBody } = require("../middlewares/validate.middleware");
const { cropRecommendationSchema } = require("../validators/crop.validators");

const router = express.Router();

router.post("/recommend", requireAuth, validateBody(cropRecommendationSchema), cropController.recommend);

module.exports = router;
