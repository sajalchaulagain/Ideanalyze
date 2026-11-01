const mongoose = require("mongoose");

/*
  Idea model — one saved idea + its AI analysis in MongoDB.

  The aiAnalysis shape below mirrors EXACTLY what the React frontend
  already renders (see src/components/AIAnalysis.jsx), so the frontend
  can display API data without any changes to its components.
*/

const aiAnalysisSchema = new mongoose.Schema(
  {
    problem: { type: String, default: "" },
    solution: { type: String, default: "" },
    targetUsers: { type: String, default: "" },
    features: { type: [String], default: [] },
    techStack: { type: [String], default: [] },
    challenges: { type: String, default: "" },
    futureImprovements: { type: String, default: "" },
  },
  { _id: false } // Sub-documents don't need their own ids — keeps data clean.
);

const ideaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: { type: String, default: "General", trim: true },
    targetAudience: { type: String, default: "Not specified", trim: true },

    // Filled in after calling POST /api/ai/analyze (or left empty for drafts).
    aiAnalysis: { type: aiAnalysisSchema, default: () => ({}) },

    // Owner of this idea. Every query filters by this field, which is what
    // guarantees User A can never see User B's ideas.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Links this field to the User collection.
      required: true,
    },
  },
  { timestamps: true } // createdAt / updatedAt, shown in the frontend as "Created ..."
);

// Speed up the most common query: "give me all ideas of THIS user".
ideaSchema.index({ user: 1 });

module.exports = mongoose.model("Idea", ideaSchema);
