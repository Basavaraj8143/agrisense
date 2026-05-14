const express = require("express");

const pestController = require("../controllers/pest.controller");
const { requireAuth } = require("../middlewares/auth.middleware");
const { handlePestImageUpload } = require("../middlewares/upload.middleware");

const router = express.Router();

router.post("/detect", requireAuth, handlePestImageUpload, pestController.detect);

module.exports = router;
