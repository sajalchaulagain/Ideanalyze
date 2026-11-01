const axios = require("axios");

// ANSI color helpers for styled terminal output
const colors = {
  bold: (t) => `\x1b[1m${t}\x1b[0m`,
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
  magenta: (t) => `\x1b[35m${t}\x1b[0m`,
};

const REQUIRED_KEYS = [
  "problem",
  "solution",
  "targetUsers",
  "features",
  "techStack",
  "challenges",
  "futureImprovements",
];

function buildPrompt({ title, description, category, targetAudience }) {
  return `You are a startup idea analyst. Analyze the following idea and respond with ONLY a valid JSON object (no markdown, no code fences, no extra text) with exactly these keys:

{
  "problem": "the core problem this idea solves (2-3 sentences)",
  "solution": "the proposed solution (2-3 sentences)",
  "targetUsers": "who will use this (1-2 sentences)",
  "features": ["4-6 key features as short strings"],
  "techStack": ["4-6 suggested technologies, e.g. React, Node.js, MongoDB"],
  "challenges": "possible challenges and risks (2-3 sentences)",
  "futureImprovements": "ideas for future versions (2-3 sentences)"
}

Idea title: ${title}
Description: ${description}
Category: ${category || "General"}
Target audience: ${targetAudience || "Not specified"}`;
}

function parseAIResponse(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("The AI returned an empty response. Please try again.");
  }

  const cleaned = rawText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error(colors.yellow(`⚠️ AI returned invalid JSON:`), cleaned.slice(0, 500));
    throw new Error("The AI returned an unreadable response. Please try again.");
  }

  for (const key of REQUIRED_KEYS) {
    const value = parsed[key];
    const isTextKey = key !== "features" && key !== "techStack";
    const valid = isTextKey ? typeof value === "string" : Array.isArray(value);
    if (!valid) {
      console.error(colors.yellow(`⚠️ AI response missing/invalid key "${key}":`), JSON.stringify(parsed).slice(0, 500));
      throw new Error("The AI returned an incomplete analysis. Please try again.");
    }
  }

  return {
    problem: parsed.problem,
    solution: parsed.solution,
    targetUsers: parsed.targetUsers,
    features: parsed.features,
    techStack: parsed.techStack,
    challenges: parsed.challenges,
    futureImprovements: parsed.futureImprovements,
  };
}

async function sendGeminiRequest(model, apiKey, promptText) {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  return axios.post(
    geminiUrl,
    {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    },
    {
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      timeout: 60000,
    }
  );
}

async function analyzeIdea({ title, description, category, targetAudience }) {
  const apiKey = (process.env.AI_API_KEY || "").trim();
  if (!apiKey || apiKey.includes("your_ai_api_key")) {
    const error = new Error("AI service is not configured. Add your AI_API_KEY to server/.env.");
    error.statusCode = 503;
    throw error;
  }

  let model = (process.env.AI_MODEL || "").trim();
  let baseUrl = (process.env.AI_BASE_URL || "").trim();

  if (model.startsWith("http://") || model.startsWith("https://")) {
    baseUrl = model;
    model = (process.env.AI_MODEL_NAME || "gpt-3.5-turbo").trim();
  }

  if (!model) model = "gemini-flash-lite-latest";

  const promptText = buildPrompt({ title, description, category, targetAudience });
  let rawText = "";

  try {
    const isOpenAICompatible = Boolean(baseUrl || apiKey.startsWith("sk-"));

    if (isOpenAICompatible) {
      const finalBaseUrl = (baseUrl || "https://api.bazaarlink.ai/v1").replace(/\/+$/, "");
      const chatUrl = `${finalBaseUrl}/chat/completions`;

      console.log(colors.cyan(`🤖 Requesting AI analysis via OpenAI-compatible endpoint: ${chatUrl} (model: ${model})`));

      const response = await axios.post(
        chatUrl,
        {
          model: model,
          messages: [
            { role: "system", content: "You are a startup idea analyst." },
            { role: "user", content: promptText },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      );

      rawText = response.data?.choices?.[0]?.message?.content;
    } else {
      console.log(colors.cyan(`🤖 Requesting AI analysis via Gemini endpoint (model: ${model})`));

      let response;
      try {
        response = await sendGeminiRequest(model, apiKey, promptText);
      } catch (err) {
        if ((err.response?.status === 404 || err.response?.status === 503) && model !== "gemini-3.5-flash-lite") {
          console.warn(colors.yellow(`⚠️ Model '${model}' returned ${err.response?.status}. Falling back to 'gemini-3.5-flash-lite'...`));
          response = await sendGeminiRequest("gemini-3.5-flash-lite", apiKey, promptText);
        } else {
          throw err;
        }
      }

      rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    }

    console.log(colors.green(`✨ AI Analysis generated successfully!`));
    return parseAIResponse(rawText);
  } catch (error) {
    if (error.statusCode === 503 || error.message.startsWith("The AI returned")) {
      throw error;
    }

    const providerMessage = error.response?.data?.error?.message || error.message;
    const providerStatus = error.response?.status;
    console.error(colors.red(`⚠️ AI provider request failed [${providerStatus || "ERROR"}]:`), providerMessage);

    if (providerStatus === 401 || providerStatus === 403) {
      throw new Error("AI request rejected. Please check that AI_API_KEY in server/.env is valid.");
    }
    if (providerStatus === 402) {
      throw new Error("AI provider account balance insufficient. Please check credits or use a Google Gemini key.");
    }
    if (providerStatus === 429) {
      throw new Error("AI quota exceeded. Please wait a minute and try again.");
    }
    throw new Error(`AI analysis failed (${providerMessage}). Please try again in a moment.`);
  }
}

module.exports = { analyzeIdea, parseAIResponse };
