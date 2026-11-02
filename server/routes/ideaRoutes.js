const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  getIdeas,
  createIdea,
  getIdeaById,
  updateIdea,
  deleteIdea,
} = require("../controllers/ideaController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");
const { userOrIpKey } = require("../utils/rateLimitKeys");
const { createIdeaSchema, updateIdeaSchema } = require("../validation/schemas");

const router = express.Router();

// Every idea route requires login — one line guards the whole file.
router.use(protect);

const ideaWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: Number(process.env.IDEA_WRITE_LIMIT || 60),
  keyGenerator: userOrIpKey,
});

router.get("/", getIdeas); // GET    /api/ideas
router.post("/", ideaWriteLimiter, validate(createIdeaSchema), createIdea); // POST   /api/ideas
router.get("/:id", getIdeaById); // GET    /api/ideas/:id
router.put("/:id", ideaWriteLimiter, validate(updateIdeaSchema), updateIdea); // PUT    /api/ideas/:id
router.delete("/:id", ideaWriteLimiter, deleteIdea); // DELETE /api/ideas/:id

module.exports = router;
