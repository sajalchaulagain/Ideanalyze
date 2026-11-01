const express = require("express");
const {
  getIdeas,
  createIdea,
  getIdeaById,
  updateIdea,
  deleteIdea,
} = require("../controllers/ideaController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Every idea route requires login — one line guards the whole file.
router.use(protect);

router.get("/", getIdeas); // GET    /api/ideas
router.post("/", createIdea); // POST   /api/ideas
router.get("/:id", getIdeaById); // GET    /api/ideas/:id
router.put("/:id", updateIdea); // PUT    /api/ideas/:id
router.delete("/:id", deleteIdea); // DELETE /api/ideas/:id

module.exports = router;
