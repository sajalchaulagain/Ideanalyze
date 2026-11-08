const test = require("node:test");
const assert = require("node:assert/strict");
const { parseAIResponse } = require("../services/aiService");

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
