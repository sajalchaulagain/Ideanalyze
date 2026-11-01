const Idea = require("../models/Idea");

/*
  Idea controllers — every function here runs AFTER the `protect`
  middleware, so req.user is always the authenticated user.

  Ownership rule used everywhere: each query includes `user: req.user._id`,
  so MongoDB itself filters out other people's ideas. We never trust a
  user id sent from the frontend — the owner always comes from the token.
*/

/*
  GET /api/ideas — list MY ideas, newest first.
*/
async function getIdeas(req, res, next) {
  try {
    const ideas = await Idea.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: { ideas, count: ideas.length } });
  } catch (error) {
    next(error);
  }
}

/*
  POST /api/ideas — save a new idea (analysis optional at creation time).
  Body: { title, description, category?, targetAudience?, aiAnalysis? }
*/
async function createIdea(req, res, next) {
  try {
    const { title, description, category, targetAudience, aiAnalysis } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Description is required" });
    }

    const idea = await Idea.create({
      title: title.trim(),
      description: description.trim(),
      category: category?.trim() || "General",
      targetAudience: targetAudience?.trim() || "Not specified",
      // The frontend sends the analysis it got from POST /api/ai/analyze.
      ...(aiAnalysis ? { aiAnalysis } : {}),
      user: req.user._id, // Owner comes from the token, never from req.body.
    });

    res.status(201).json({ success: true, message: "Idea created successfully", data: { idea } });
  } catch (error) {
    next(error);
  }
}

/*
  GET /api/ideas/:id — fetch ONE of my ideas.
  Someone else's id returns 404 (not 403) on purpose: confirming
  "this exists but isn't yours" would leak other users' data.
*/
async function getIdeaById(req, res, next) {
  try {
    const idea = await Idea.findOne({ _id: req.params.id, user: req.user._id });
    if (!idea) {
      return res.status(404).json({ success: false, message: "Idea not found" });
    }
    res.json({ success: true, data: { idea } });
  } catch (error) {
    next(error);
  }
}

/*
  PUT /api/ideas/:id — update MY idea (title, description, category,
  audience, and/or aiAnalysis after a fresh AI run).
*/
async function updateIdea(req, res, next) {
  try {
    // Whitelist updatable fields — this blocks sneaky extras like `user`
    // that could transfer ownership to someone else.
    const allowed = ["title", "description", "category", "targetAudience", "aiAnalysis"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.title !== undefined && !String(updates.title).trim()) {
      return res.status(400).json({ success: false, message: "Title cannot be empty" });
    }
    if (updates.description !== undefined && !String(updates.description).trim()) {
      return res.status(400).json({ success: false, message: "Description cannot be empty" });
    }

    // runValidators re-applies the schema rules on update (off by default!).
    // new:true returns the UPDATED document instead of the old one.
    const idea = await Idea.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!idea) {
      return res.status(404).json({ success: false, message: "Idea not found" });
    }
    res.json({ success: true, message: "Idea updated successfully", data: { idea } });
  } catch (error) {
    next(error);
  }
}

/*
  DELETE /api/ideas/:id — delete MY idea.
*/
async function deleteIdea(req, res, next) {
  try {
    const idea = await Idea.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!idea) {
      return res.status(404).json({ success: false, message: "Idea not found" });
    }
    res.json({ success: true, message: "Idea deleted successfully", data: { id: idea._id } });
  } catch (error) {
    next(error);
  }
}

module.exports = { getIdeas, createIdea, getIdeaById, updateIdea, deleteIdea };
