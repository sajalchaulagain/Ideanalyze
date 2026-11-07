const test = require("node:test");
const assert = require("node:assert/strict");
const { toUser, toPublicUser, toIdea, fromIdeaInput } = require("../db/mappers");

test("toIdea maps database columns to the app shape", () => {
  const idea = toIdea({
    id: "idea-1",
    user_id: "mongo-user-1",
    title: "A title",
    description: "A description",
    category: "SaaS",
    target_audience: "Founders",
    ai_analysis: { score: 9 },
    created_at: "created",
    updated_at: "updated",
  });

  assert.equal(idea._id, "idea-1");
  assert.equal(idea.user, "mongo-user-1");
  assert.equal(idea.targetAudience, "Founders");
  assert.deepEqual(idea.aiAnalysis, { score: 9 });
  assert.deepEqual(Object.keys(idea).sort(), [
    "_id",
    "aiAnalysis",
    "category",
    "createdAt",
    "description",
    "targetAudience",
    "title",
    "updatedAt",
    "user",
  ]);
  assert.equal("id" in idea, false);
  assert.equal("user_id" in idea, false);
  assert.equal("created_at" in idea, false);
});

test("toPublicUser removes passwordHash by key presence", () => {
  const row = {
    id: "user-1",
    name: "Ada",
    email: "ada@example.com",
    password_hash: "redacted-hash",
    created_at: "created",
    updated_at: "updated",
  };
  const user = toUser(row);
  const publicUser = toPublicUser(row);

  assert.equal(user.passwordHash, "redacted-hash");
  assert.equal("passwordHash" in publicUser, false);
});

test("fromIdeaInput uses the authenticated user and whitelists fields", () => {
  const input = fromIdeaInput({ title: "x", isAdmin: true, user_id: "evil" }, "u1");
  assert.equal(input.user_id, "u1");
  assert.equal("isAdmin" in input, false);
  assert.equal("user_id" in input, true);
});

test("mappers are null-safe", () => {
  assert.equal(toIdea(null), null);
  assert.equal(toUser(null), null);
});
