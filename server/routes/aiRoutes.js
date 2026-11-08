const express = require("express");
const rateLimit = require("express-rate-limit");
const { analyze, status } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { userOrIpKey } = require("../utils/rateLimitKeys");
const { createRateLimitHandler } = require("../middleware/rateLimitHandler");
const { analyzeSchema } = require("../validation/schemas");

const router = express.Router();

// AI calls cost quota/money, so analysis requires a logged-in user.
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: Number(process.env.AI_RATE_LIMIT_MAX || 20),
  keyGenerator: userOrIpKey,
  handler: createRateLimitHandler({
    code: "AI_RATE_LIMITED",
    message:
      "You have reached the hourly AI analysis limit. Please try again later.",
  }),
});

router.get("/status", protect, status);
router.post("/analyze", protect, validate(analyzeSchema), aiLimiter, analyze); // POST /api/ai/analyze

module.exports = router;
