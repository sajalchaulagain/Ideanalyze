const express = require("express");
const rateLimit = require("express-rate-limit");
const { signup, login, getMe, updateMe, changePassword } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const {
  signupSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require("../validation/schemas");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  handler: (req, res) =>
    res.status(429).json({ success: false, code: "AUTH_RATE_LIMITED", message: "Too many authentication attempts." }),
});

router.post("/signup", authLimiter, validate(signupSchema), signup);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/me", protect, getMe);
router.patch("/me", protect, validate(updateProfileSchema), updateMe);
router.patch("/password", protect, validate(changePasswordSchema), changePassword);

module.exports = router;
