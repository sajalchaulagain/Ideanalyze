const axios = require("axios");

const colors = {
  bold: (t) => `\x1b[1m${t}\x1b[0m`,
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
};

const REQUIRED_KEYS = ["problem", "solution", "targetUsers", "features", "techStack", "challenges", "futureImprovements"];

function notConfigured(detail) {
  const error = new Error(detail || "AI not configured");
  error.statusCode = 503;
  error.code = "AI_NOT_CONFIGURED";
  return error;
}

function providerHint(baseUrl, model) {
  let base = "gemini";
  if (baseUrl) {
    try {
      base = new URL(baseUrl).hostname;
    } catch {
      base = "openai-compatible provider";
    }
  }
  return `model: ${model}; base: ${base}`;
}

function providerFailure(code, statusCode, message, providerStatus, hint) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.isOperational = true;
  if (Number.isInteger(providerStatus)) error.providerStatus = providerStatus;
  if (hint) error.hint = hint;
  return error;
}

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

function extractBalancedObject(text) {
  const start = text.indexOf("{");
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const character = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === "{") depth += 1;
    else if (character === "}" && --depth === 0) return text.slice(start, index + 1);
  }
  return null;
}

function parseAIResponse(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("The AI returned an empty response. Please try again.");
  }
  const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    const balancedObject = extractBalancedObject(cleaned);
    if (balancedObject) {
      try {
        parsed = JSON.parse(balancedObject);
      } catch {
        parsed = undefined;
      }
    }
    if (parsed === undefined) {
      console.error(colors.yellow("AI returned invalid JSON"));
      throw new Error("The AI returned an unreadable response. Please try again.", { cause: error });
    }
  }
  for (const key of REQUIRED_KEYS) {
    const value = parsed[key];
    const isTextKey = key !== "features" && key !== "techStack";
    const valid = isTextKey ? typeof value === "string" : Array.isArray(value);
    if (!valid) {
      console.error(colors.yellow(`AI response missing/invalid key "${key}"`));
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

async function sendGeminiRequest(model, apiKey, promptText, timeout) {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  return axios.post(geminiUrl, {
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: { responseMimeType: "application/json", temperature: 0.7, maxOutputTokens: 2048 },
  }, { headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" }, timeout });
}

async function analyzeIdea({ title, description, category, targetAudience }) {
  const apiKey = (process.env.AI_API_KEY || "").trim();
  const configuredBaseUrl = (process.env.AI_BASE_URL || "").trim();
  const hasBaseUrl = Boolean(configuredBaseUrl);
  const keyIsPlaceholder = !apiKey || apiKey.includes("your_ai_api_key") || apiKey.startsWith("change_me");
  const hasUsableKey = !keyIsPlaceholder;
  const isGeminiKey = /^AIza[0-9A-Za-z_-]+$/.test(apiKey);
  if (!hasBaseUrl && !hasUsableKey) {
    throw notConfigured("AI not configured: set AI_API_KEY for Google Gemini, or set both AI_BASE_URL and AI_API_KEY for an OpenAI-compatible provider.");
  }
  let model = (process.env.AI_MODEL || "").trim();
  let baseUrl = configuredBaseUrl;
  if (model.startsWith("http://") || model.startsWith("https://")) {
    baseUrl = model;
    model = (process.env.AI_MODEL_NAME || "gpt-3.5-turbo").trim();
  }
  if (!model) model = "gemini-flash-lite-latest";
  const fallbackModel = (process.env.AI_FALLBACK_MODEL || "gemini-flash-latest").trim();
  const configuredTimeout = Number.parseInt(process.env.AI_TIMEOUT_MS || "25000", 10);
  const timeout = Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : 25000;
  if (!baseUrl && !isGeminiKey) {
    throw notConfigured("AI not configured: AI_BASE_URL is required when AI_API_KEY is an OpenAI-compatible key.");
  }
  const promptText = buildPrompt({ title, description, category, targetAudience });
  let rawText;
  try {
    if (baseUrl) {
      const chatUrl = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
      console.log(colors.cyan(`Requesting AI analysis via OpenAI-compatible endpoint (model: ${model})`));
      const headers = { "Content-Type": "application/json" };
      if (hasUsableKey) headers.Authorization = `Bearer ${apiKey}`;
      const response = await axios.post(chatUrl, {
        model,
        messages: [{ role: "system", content: "You are a startup idea analyst." }, { role: "user", content: promptText }],
        temperature: 0.7,
      }, { headers, timeout });
      rawText = response.data?.choices?.[0]?.message?.content;
    } else {
      console.log(colors.cyan(`Requesting AI analysis via Gemini endpoint (model: ${model})`));
      let response;
      try {
        response = await sendGeminiRequest(model, apiKey, promptText, timeout);
      } catch (err) {
        if ((err.response?.status === 404 || err.response?.status === 503) && fallbackModel && model !== fallbackModel) {
          console.warn(colors.yellow(`AI model ${model} returned ${err.response.status}; using fallback model.`));
          response = await sendGeminiRequest(fallbackModel, apiKey, promptText, timeout);
        } else throw err;
      }
      rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    }
    console.log(colors.green("AI analysis generated successfully"));
    return parseAIResponse(rawText);
  } catch (error) {
    if (error.statusCode === 503 || error.message.startsWith("The AI returned")) throw error;
    const providerMessage = error.response?.data?.error?.message || error.message;
    const providerStatus = error.response?.status;
    const hint = providerHint(baseUrl, model);
    const timedOut = error.code === "ECONNABORTED" || error.code === "ETIMEDOUT" || (!error.response && Boolean(error.request));
    if (timedOut) {
      console.error(colors.red("AI provider request failed [TIMEOUT]"));
      throw providerFailure("AI_TIMEOUT", 504, "The AI provider did not respond in time.", undefined, hint);
    }
    console.error(colors.red(`AI provider request failed [${providerStatus || "ERROR"}]`));
    if (providerStatus === 401 || providerStatus === 403) throw providerFailure("AI_AUTH_FAILED", 502, "The AI provider rejected our credentials.", providerStatus, hint);
    if (providerStatus === 402) throw providerFailure("AI_QUOTA_EXCEEDED", 502, "The AI provider account has no credit.", providerStatus, hint);
    if ((providerStatus === 400 || providerStatus === 404) && typeof providerMessage === "string" && /model/i.test(providerMessage)) {
      throw providerFailure("AI_MODEL_NOT_FOUND", 502, "The configured AI model is not available from the provider.", providerStatus, hint);
    }
    if (providerStatus === 429) throw providerFailure("AI_RATE_LIMITED", 429, "The AI provider is rate limiting us. Try again shortly.", providerStatus, hint);
    throw providerFailure("AI_PROVIDER_FAILED", 502, "The AI provider request failed. Please try again in a moment.", providerStatus, hint);
  }
}

module.exports = { analyzeIdea, parseAIResponse };
