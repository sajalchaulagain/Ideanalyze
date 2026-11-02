const Idea = require("../models/Idea");
const { AppError } = require("../utils/AppError");

async function getIdeas(req, res, next) {
  try {
    const ideas = await Idea.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: { ideas, count: ideas.length } });
  } catch (error) {
    return next(error);
  }
}

async function createIdea(req, res, next) {
  try {
    const idea = await Idea.create({ ...req.body, user: req.user._id });
    return res.status(201).json({ success: true, message: "Idea created successfully", data: { idea } });
  } catch (error) {
    return next(error);
  }
}

async function getIdeaById(req, res, next) {
  try {
    const idea = await Idea.findOne({ _id: req.params.id, user: req.user._id });
    if (!idea) return next(new AppError("IDEA_NOT_FOUND", 404, "Idea not found"));
    return res.json({ success: true, data: { idea } });
  } catch (error) {
    return next(error);
  }
}

async function updateIdea(req, res, next) {
  try {
    const idea = await Idea.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!idea) return next(new AppError("IDEA_NOT_FOUND", 404, "Idea not found"));
    return res.json({ success: true, message: "Idea updated successfully", data: { idea } });
  } catch (error) {
    return next(error);
  }
}

async function deleteIdea(req, res, next) {
  try {
    const idea = await Idea.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!idea) return next(new AppError("IDEA_NOT_FOUND", 404, "Idea not found"));
    return res.json({ success: true, message: "Idea deleted successfully", data: { id: idea._id } });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getIdeas, createIdea, getIdeaById, updateIdea, deleteIdea };
