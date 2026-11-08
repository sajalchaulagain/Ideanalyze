const test = require("node:test");
const assert = require("node:assert/strict");
const axios = require("axios");
process.env.NODE_ENV = "test";
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

test("parseAIResponse normalizes partial responses and string lists", () => {
  const result = parseAIResponse(
    JSON.stringify({
      problem: "  A problem  ",
      features: "One, Two\n3) Three",
      techStack: "React, Node.js",
    })
  );

  assert.deepEqual(result, {
    problem: "A problem",
    solution: "",
    targetUsers: "",
    features: ["One", "Two", "Three"],
    techStack: ["React", "Node.js"],
    challenges: "",
    futureImprovements: "",
  });
});

test("parseAIResponse clamps long text and list values to schema limits", () => {
  const result = parseAIResponse(
    JSON.stringify({
      problem: "p".repeat(3000),
      features: ["f".repeat(120), "ok"],
      techStack: Array.from({ length: 15 }, (_, index) => `tech-${index}`),
    })
  );

  assert.equal(result.problem.length, 2000);
  assert.equal(result.features[0].length, 80);
  assert.equal(result.techStack.length, 10);
});

test("parseAIResponse rejects an analysis with no usable content", () => {
  assert.throws(
    () => parseAIResponse(JSON.stringify({ problem: "", features: [] })),
    /empty analysis/
  );
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

test("congestion rotates to the next configured free model after retries", async () => {
  const originalPost = axios.post;
  const originalSetTimeout = global.setTimeout;
  const originalModels = process.env.AI_MODELS;
  const originalBase = process.env.AI_BASE_URL;
  const originalKey = process.env.AI_API_KEY;
  let attempts = 0;
  axios.post = async (url, body) => {
    attempts += 1;
    if (body.model === "google/one:free") throw providerError(429, "rate-limited upstream");
    return { data: { choices: [{ message: { content: JSON.stringify(analysis) } }] } };
  };
  global.setTimeout = (callback) => {
    callback();
    return 0;
  };
  process.env.AI_MODELS = "google/one:free,nvidia/two:free,openai/three:free";
  process.env.AI_BASE_URL = "https://openrouter.ai/api/v1";
  process.env.AI_API_KEY = "test-key";
  try {
    const result = await analyzeIdea({ title: "Test", description: "A sufficiently detailed test description." });
    assert.deepEqual(result, analysis);
    assert.equal(attempts, 4);
  } finally {
    axios.post = originalPost;
    global.setTimeout = originalSetTimeout;
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
      data: { data: { limit_remaining: null, limit: null, free_model_daily_requests: { remaining: 2, limit: 50 } } },
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
