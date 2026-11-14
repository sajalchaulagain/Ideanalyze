const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getIdeas,
  deleteIdea,
  getAudit,
} = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/requireAdmin");
const { validate } = require("../middleware/validate");
const { createRateLimitHandler } = require("../middleware/rateLimitHandler");
const { updateUserRoleSchema } = require("../validation/schemas");
const { userOrIpKey } = require("../utils/rateLimitKeys");

const router = express.Router();

const adminLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  keyGenerator: userOrIpKey,
  handler: createRateLimitHandler({
    code: "ADMIN_RATE_LIMITED",
    message: "Too many admin requests. Please slow down.",
  }),
});

// protect() sets req.user, requireAdmin re-reads the role from the database,
// and every route below is rate limited as an authenticated user.
router.use(protect, requireAdmin, adminLimiter);

router.get("/stats", getStats);
router.get("/users", getUsers);
router.patch("/users/:id/role", validate(updateUserRoleSchema), updateUserRole);
router.delete("/users/:id", deleteUser);
router.get("/ideas", getIdeas);
router.delete("/ideas/:id", deleteIdea);
router.get("/audit", getAudit);

module.exports = router;
