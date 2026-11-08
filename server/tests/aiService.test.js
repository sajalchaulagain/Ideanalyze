const test = require("node:test");
const assert = require("node:assert/strict");
const axios = require("axios");
const { analyzeIdea, getAIStatus, parseAIResponse } = require("../services/aiService");

const analysis = {
  problem: "A problem",
  solution: "A solution",
  targetUsers: "Users",
  features: ["One"],
  techStack: ["Node.js"],
  challenges: "A challenge",
  futureImprovements: "An improvement",
};

test("parseAIResponse accepts fenced JSON", () => {
  assert.deepEqual(parseAIResponse(`\n\`\`\`json\n${JSON.stringify(analysis)}\n\`\`\``), analysis);
});

test("parseAIResponse extracts JSON from surrounding prose", () => {
  assert.deepEqual(parseAIResponse(`Here is the analysis:\n${JSON.stringify(analysis)}\nHope this helps.`), analysis);
});

function providerError(status, message, headers = {}) {
  const error = new Error("provider failure");
  error.response = { status, data: { error: { message } }, headers };
  return error;
}

test("congestion 429 retries the same model three times", async () => {
  const originalPost = axios.post;
  const originalSetTimeout = global.setTimeout;
  const originalModels = process.env.AI_MODELS;
  const originalBase = process.env.AI_BASE_URL;
  const originalKey = process.env.AI_API_KEY;
  let attempts = 0;
  axios.post = async () => {
    attempts += 1;
    throw providerError(429, "rate-limited upstream");
  };
  global.setTimeout = (callback) => {
    callback();
    return 0;
  };
  process.env.AI_MODELS = "google/one:free";
  process.env.AI_BASE_URL = "https://openrouter.ai/api/v1";
  process.env.AI_API_KEY = "test-key";
  try {
    await assert.rejects(
      analyzeIdea({ title: "Test", description: "A sufficiently detailed test description." }),
      (error) => error.code === "AI_RATE_LIMITED" && error.statusCode === 429
    );
    assert.equal(attempts, 3);
  } finally {
    axios.post = originalPost;
    global.setTimeout = originalSetTimeout;
    process.env.AI_MODELS = originalModels;
    process.env.AI_BASE_URL = originalBase;
    process.env.AI_API_KEY = originalKey;
  }
});

test("daily free-model cap does not retry and includes reset time", async () => {
  const originalPost = axios.post;
  const originalModels = process.env.AI_MODELS;
  const originalBase = process.env.AI_BASE_URL;
  const originalKey = process.env.AI_API_KEY;
  let attempts = 0;
  const resetMilliseconds = Date.now() + 60000;
  axios.post = async () => {
    attempts += 1;
    throw providerError(429, "free-models-per-day limit reached", {
      "x-ratelimit-reset": String(resetMilliseconds),
    });
  };
  process.env.AI_MODELS = "google/one:free,google/two:free";
  process.env.AI_BASE_URL = "https://openrouter.ai/api/v1";
  process.env.AI_API_KEY = "test-key";
  try {
    await assert.rejects(
      analyzeIdea({ title: "Test", description: "A sufficiently detailed test description." }),
      (error) => error.code === "AI_DAILY_LIMIT" && error.resetsAt === new Date(resetMilliseconds).toISOString()
    );
    assert.equal(attempts, 1);
  } finally {
    axios.post = originalPost;
    process.env.AI_MODELS = originalModels;
    process.env.AI_BASE_URL = originalBase;
    process.env.AI_API_KEY = originalKey;
  }
});

test("provider auth failure is immediate", async () => {
  const originalPost = axios.post;
  const originalModels = process.env.AI_MODELS;
  const originalBase = process.env.AI_BASE_URL;
  const originalKey = process.env.AI_API_KEY;
  let attempts = 0;
  axios.post = async () => {
    attempts += 1;
    throw providerError(401, "invalid credentials");
  };
  process.env.AI_MODELS = "google/one:free,google/two:free";
  process.env.AI_BASE_URL = "https://openrouter.ai/api/v1";
  process.env.AI_API_KEY = "test-key";
  try {
    await assert.rejects(
      analyzeIdea({ title: "Test", description: "A sufficiently detailed test description." }),
      (error) => error.code === "AI_AUTH_FAILED" && error.statusCode === 502
    );
    assert.equal(attempts, 1);
  } finally {
    axios.post = originalPost;
    process.env.AI_MODELS = originalModels;
    process.env.AI_BASE_URL = originalBase;
    process.env.AI_API_KEY = originalKey;
  }
});

test("AI status reads provider limits and caches for one minute", async () => {
  const originalGet = axios.get;
  const originalBase = process.env.AI_BASE_URL;
  const originalKey = process.env.AI_API_KEY;
  const originalModels = process.env.AI_MODELS;
  let calls = 0;
  axios.get = async () => {
    calls += 1;
    return {
      data: { data: { limit_remaining: 2, limit: 50 } },
      headers: { "x-ratelimit-reset": String(Date.now() + 60000) },
    };
  };
  process.env.AI_BASE_URL = "https://openrouter.ai/api/v1";
  process.env.AI_API_KEY = "test-key";
  process.env.AI_MODELS = "google/one:free,nvidia/two:free";
  try {
    const first = await getAIStatus();
    const second = await getAIStatus();
    assert.equal(first.remaining, 2);
    assert.equal(first.limit, 50);
    assert.deepEqual(first.models, ["google/one:free", "nvidia/two:free"]);
    assert.match(first.resetsAt, /^\d{4}-\d{2}-\d{2}T/);
    assert.deepEqual(second, first);
    assert.equal(calls, 1);
  } finally {
    axios.get = originalGet;
    process.env.AI_BASE_URL = originalBase;
    process.env.AI_API_KEY = originalKey;
    process.env.AI_MODELS = originalModels;
  }
});
