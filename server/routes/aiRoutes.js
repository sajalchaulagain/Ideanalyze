const express = require("express");
const { analyze } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// AI calls cost quota/money, so analysis requires a logged-in user.
router.post("/analyze", protect, analyze); // POST /api/ai/analyze

module.exports = router;
