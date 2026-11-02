const { analyzeIdea } = require("../services/aiService");

/*
  POST /api/ai/analyze  (protected)
  Body: { title, description, category?, targetAudience? }

  This endpoint GENERATES an analysis but does NOT save it — the frontend
  then saves it with POST /api/ideas or PUT /api/ideas/:id.
  Why two steps? So users can re-run the analysis ("Analyze Again") and
  preview results without creating duplicate database records each time.

  Full flow:
    React → Axios → this controller → aiService → Gemini → back up the chain.
*/
async function analyze(req, res, next) {
  try {
    const { title, description, category, targetAudience } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: "Title is required for analysis" });
    }
    if (!description || !String(description).trim()) {
      return res.status(400).json({ success: false, message: "Description is required for analysis" });
    }

    // All provider communication + parsing lives in the service.
    const analysis = await analyzeIdea({
      title: String(title).trim(),
      description: String(description).trim(),
      category: category ? String(category).trim() : "",
      targetAudience: targetAudience ? String(targetAudience).trim() : "",
    });

    res.json({ success: true, message: "Analysis generated successfully", data: { analysis } });
  } catch (error) {
    // 503 from the service means "AI not configured" — keep that status code.
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        code: error.code,
        message: error.message,
      });
    }
    next(error);
  }
}

module.exports = { analyze };
