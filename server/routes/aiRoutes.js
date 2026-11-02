const express = require("express");
const rateLimit = require("express-rate-limit");
const { analyze } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { userOrIpKey } = require("../utils/rateLimitKeys");
const { analyzeSchema } = require("../validation/schemas");

const router = express.Router();

// AI calls cost quota/money, so analysis requires a logged-in user.
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: Number(process.env.AI_RATE_LIMIT_MAX || 20),
  keyGenerator: userOrIpKey,
});

router.post("/analyze", protect, aiLimiter, validate(analyzeSchema), analyze); // POST /api/ai/analyze

module.exports = router;
