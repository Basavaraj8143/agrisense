const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Service is healthy",
    data: {
      service: "backend-node",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;
