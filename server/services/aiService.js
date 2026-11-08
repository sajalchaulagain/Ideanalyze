const axios = require("axios");

const colors = {
  bold: (t) => `\x1b[1m${t}\x1b[0m`,
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
};

const REQUIRED_KEYS = ["problem", "solution", "targetUsers", "features", "techStack", "challenges", "futureImprovements"];
let aiStatusCache = null;

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

function providerFailure(code, statusCode, message, providerStatus, hint, resetsAt) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.isOperational = true;
  if (Number.isInteger(providerStatus)) error.providerStatus = providerStatus;
  if (hint) error.hint = hint;
  if (resetsAt) error.resetsAt = resetsAt;
  return error;
}

function configuredModels(defaultModel) {
  const configured = (process.env.AI_MODELS || "")
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);
  if (configured.length) return configured.slice(0, 3);
  return [defaultModel || "gemini-flash-lite-latest"];
}

function headerValue(headers, name) {
  if (!headers) return undefined;
  if (typeof headers.get === "function") return headers.get(name);
  return headers[name] ?? headers[name.toLowerCase()] ?? headers[name.toUpperCase()];
}

function nextUtcMidnight() {
  const reset = new Date();
  reset.setUTCHours(24, 0, 0, 0);
  return reset.toISOString();
}

function providerResetAt(response) {
  const raw = headerValue(response?.headers, "x-ratelimit-reset");
  const milliseconds = Number(raw);
  return Number.isFinite(milliseconds) && milliseconds > 0
    ? new Date(milliseconds).toISOString()
    : nextUtcMidnight();
}

function providerErrorMessage(error) {
  return error.response?.data?.error?.message || error.response?.data?.message || "";
}

function isDailyLimit(error) {
  if (error.response?.status !== 429) return false;
  const message = providerErrorMessage(error).toLowerCase();
  const remaining = headerValue(error.response.headers, "x-ratelimit-remaining");
  return message.includes("free-models-per-day") || String(remaining) === "0";
}

function retryAfterMilliseconds(error, baseDelay) {
  if (process.env.NODE_ENV === "test") return 0;
  const retryAfter = Number(headerValue(error.response?.headers, "retry-after"));
  const retryAfterMilliseconds = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 0;
  const jitter = baseDelay * (0.8 + Math.random() * 0.4);
  return Math.max(jitter, retryAfterMilliseconds);
}

function wait(milliseconds) {
  return new Promise((resolve) => global.setTimeout(resolve, milliseconds));
}

function dailyLimitFailure(error, baseUrl, model) {
  return providerFailure(
    "AI_DAILY_LIMIT",
    429,
    "The free AI allowance for today is used up. It resets at 00:00 UTC.",
    429,
    providerHint(baseUrl, model),
    providerResetAt(error.response)
  );
}

function rateLimitedFailure(baseUrl, model) {
  return providerFailure(
    "AI_RATE_LIMITED",
    429,
    "The AI providers are busy right now. Try again in a minute.",
    429,
    providerHint(baseUrl, model)
  );
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

async function sendOpenAIRequest(baseUrl, model, apiKey, promptText, timeout) {
  const chatUrl = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  return axios.post(chatUrl, {
    model,
    messages: [
      { role: "system", content: "You are a startup idea analyst." },
      { role: "user", content: promptText },
    ],
    temperature: 0.7,
  }, { headers, timeout });
}

function numericOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function getAIStatus() {
  const now = Date.now();
  if (aiStatusCache && aiStatusCache.expiresAt > now) return aiStatusCache.value;

  const baseUrl = (process.env.AI_BASE_URL || "").trim().replace(/\/+$/, "");
  const apiKey = (process.env.AI_API_KEY || "").trim();
  const models = configuredModels((process.env.AI_MODEL || "").trim());
  const emptyStatus = { remaining: null, limit: null, resetsAt: null, models };

  if (!baseUrl || !apiKey) {
    aiStatusCache = { expiresAt: now + 60000, value: emptyStatus };
    return emptyStatus;
  }

  let value = emptyStatus;
  try {
    const response = await axios.get(`${baseUrl}/key`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 5000,
    });
    const data = response.data?.data || response.data || {};
    const resetHeader = headerValue(response.headers, "x-ratelimit-reset");
    const resetMilliseconds = Number(resetHeader);
    const resetsAt = Number.isFinite(resetMilliseconds) && resetMilliseconds > 0
      ? new Date(resetMilliseconds).toISOString()
      : typeof data.reset_at === "string"
      ? data.reset_at
      : null;
    value = {
      remaining: numericOrNull(data.limit_remaining),
      limit: numericOrNull(data.limit),
      resetsAt,
      models,
    };
  } catch {
    value = emptyStatus;
  }
  aiStatusCache = { expiresAt: now + 60000, value };
  return value;
}

async function sendOpenAIWithRotation(baseUrl, apiKey, promptText, timeout) {
  const models = configuredModels((process.env.AI_MODEL || "").trim());
  for (let modelIndex = 0; modelIndex < models.length; modelIndex += 1) {
    const model = models[modelIndex];
    const sameModelAttempts = modelIndex === 0 ? 3 : 1;
    for (let attempt = 0; attempt < sameModelAttempts; attempt += 1) {
      try {
        console.log(colors.cyan(`Requesting AI analysis via OpenAI-compatible endpoint (model: ${model})`));
        const response = await sendOpenAIRequest(baseUrl, model, apiKey, promptText, timeout);
        return response.data?.choices?.[0]?.message?.content;
      } catch (error) {
        if (error.response?.status === 429 && isDailyLimit(error)) {
          throw dailyLimitFailure(error, baseUrl, model);
        }
        if (error.response?.status !== 429) throw error;
        if (attempt + 1 < sameModelAttempts) {
          const delay = retryAfterMilliseconds(error, attempt === 0 ? 3000 : 6000);
          console.warn(colors.yellow(`AI provider busy; retrying model ${model} in ${Math.round(delay)}ms`));
          await wait(delay);
          continue;
        }
      }
    }
    if (modelIndex + 1 < models.length) {
      console.log(`AI rotation: ${model} -> ${models[modelIndex + 1]}`);
    }
  }
  throw rateLimitedFailure(baseUrl, models[models.length - 1]);
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
      rawText = await sendOpenAIWithRotation(baseUrl, hasUsableKey ? apiKey : "", promptText, timeout);
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
    if (error.isOperational || error.statusCode === 503 || error.message?.startsWith("The AI returned")) throw error;
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

module.exports = { analyzeIdea, parseAIResponse, getAIStatus };
