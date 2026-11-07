const { AppError } = require("../utils/AppError");
const ideas = require("../db/repositories/ideas");

async function getIdeas(req, res, next) {
  try {
    const rows = await ideas.listByUser(req.user._id);
    return res.json({ success: true, data: { ideas: rows, count: rows.length } });
  } catch (error) {
    return next(error);
  }
}

async function createIdea(req, res, next) {
  try {
    const idea = await ideas.createForUser(req.user._id, req.body);
    return res.status(201).json({ success: true, message: "Idea created successfully", data: { idea } });
  } catch (error) {
    return next(error);
  }
}

async function getIdeaById(req, res, next) {
  try {
    const idea = await ideas.findByIdAndUser(req.params.id, req.user._id);
    if (!idea) return next(new AppError("IDEA_NOT_FOUND", 404, "Idea not found"));
    return res.json({ success: true, data: { idea } });
  } catch (error) {
    return next(error);
  }
}

async function updateIdea(req, res, next) {
  try {
    const idea = await ideas.updateByIdAndUser(req.params.id, req.user._id, req.body);
    if (!idea) return next(new AppError("IDEA_NOT_FOUND", 404, "Idea not found"));
    return res.json({ success: true, message: "Idea updated successfully", data: { idea } });
  } catch (error) {
    return next(error);
  }
}

async function deleteIdea(req, res, next) {
  try {
    const idea = await ideas.deleteByIdAndUser(req.params.id, req.user._id);
    if (!idea) return next(new AppError("IDEA_NOT_FOUND", 404, "Idea not found"));
    return res.json({ success: true, message: "Idea deleted successfully", data: { id: idea._id } });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getIdeas, createIdea, getIdeaById, updateIdea, deleteIdea };
