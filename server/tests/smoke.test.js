const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { getSupabase } = require("../db/supabase");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-only-jwt-secret";
process.env.JWT_EXPIRES_IN = "1h";
process.env.AI_API_KEY = "";
process.env.AI_BASE_URL = "";
process.env.CLIENT_URL = "http://localhost:5173";

test("API smoke suite", async (t) => {
  if (process.env.RUN_INTEGRATION !== "1" || (process.env.DB_PROVIDER || "").trim().toLowerCase() !== "supabase") {
    t.skip("credentialed Supabase suite; run with RUN_INTEGRATION=1 DB_PROVIDER=supabase");
    return;
  }
  const app = require("../server");
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const firstEmail = `test+${suffix}@example.com`;
  const secondEmail = `test+second-${suffix}@example.com`;
  const userIds = [];

  t.after(async () => {
    if (!userIds.length) return;
    await getSupabase().from("ideas").delete().in("user_id", userIds);
    await getSupabase().from("users").delete().in("id", userIds);
  });

  let firstToken;
  let firstUser;
  let ideaId;

  await t.test("health reports connected Supabase", async () => {
    const response = await request(app).get("/api/health");
    assert.equal(response.status, 200);
    assert.equal(response.body.provider, "supabase");
  });

  await t.test("duplicate signup is rejected", async () => {
    const first = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Dupe", email: firstEmail, password: "validpass1" });
    assert.equal(first.status, 201);
    firstToken = first.body.data.token;
    firstUser = first.body.data.user;
    userIds.push(firstUser.id);

    const second = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Dupe Two", email: firstEmail.toUpperCase(), password: "validpass1" });
    assert.equal(second.status, 409);
    assert.equal(second.body.code, "EMAIL_TAKEN");
  });

  await t.test("unknown and wrong-password login messages match", async () => {
    const unknown = await request(app)
      .post("/api/auth/login")
      .send({ email: "unknown@test.com", password: "validpass1" });
    const wrong = await request(app)
      .post("/api/auth/login")
      .send({ email: firstEmail, password: "wrongpass1" });
    assert.equal(unknown.status, 401);
    assert.equal(wrong.status, 401);
    assert.equal(unknown.body.message, wrong.body.message);
  });

  await t.test("ideas require a token", async () => {
    const response = await request(app).get("/api/ideas");
    assert.equal(response.status, 401);
    assert.equal(response.body.code, "TOKEN_MISSING");
  });

  await t.test("profile name can be updated and read back", async () => {
    const update = await request(app)
      .patch("/api/auth/me")
      .set("Authorization", `Bearer ${firstToken}`)
      .send({ name: "Renamed" });
    assert.equal(update.status, 200);

    const read = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${firstToken}`);
    assert.equal(read.status, 200);
    assert.equal(read.body.data.user.name, "Renamed");
  });

  await t.test("wrong current password is rejected", async () => {
    const response = await request(app)
      .patch("/api/auth/password")
      .set("Authorization", `Bearer ${firstToken}`)
      .send({ currentPassword: "wrongpass1", newPassword: "newpass123" });
    assert.equal(response.status, 400);
    assert.equal(response.body.code, "PASSWORD_MISMATCH");
  });

  await t.test("idea description is validated", async () => {
    const response = await request(app)
      .post("/api/ideas")
      .set("Authorization", `Bearer ${firstToken}`)
      .send({ title: "A valid title", description: "short" });
    assert.equal(response.status, 422);
    assert.equal(response.body.field, "description");
  });

  await t.test("idea ownership comes from the token", async () => {
    const response = await request(app)
      .post("/api/ideas")
      .set("Authorization", `Bearer ${firstToken}`)
      .send({
        title: "A properly detailed idea",
        description: "This description is long enough for the validation rules.",
        user: "000000000000000000000000",
      });
    assert.equal(response.status, 201);
    assert.notEqual(String(response.body.data.idea.user), "000000000000000000000000");
    ideaId = response.body.data.idea._id;
  });

  await t.test("ideas can be listed and fetched", async () => {
    const list = await request(app)
      .get("/api/ideas")
      .set("Authorization", `Bearer ${firstToken}`);
    assert.equal(list.status, 200);
    assert.equal(String(list.body.data.ideas[0]._id), String(ideaId));

    const read = await request(app)
      .get(`/api/ideas/${ideaId}`)
      .set("Authorization", `Bearer ${firstToken}`);
    assert.equal(read.status, 200);
    assert.equal(String(read.body.data.idea._id), String(ideaId));
  });

  let secondToken;
  await t.test("another user cannot discover the idea", async () => {
    const signup = await request(app)
      .post("/api/auth/signup")
      .send({ name: "Second", email: secondEmail, password: "validpass1" });
    secondToken = signup.body.data.token;
    userIds.push(signup.body.data.user.id);
    const response = await request(app)
      .get(`/api/ideas/${ideaId}`)
      .set("Authorization", `Bearer ${secondToken}`);
    assert.equal(response.status, 404);
    assert.equal(response.body.code, "IDEA_NOT_FOUND");
  });

  await t.test("invalid idea ids return a coded 400", async () => {
    const response = await request(app)
      .get("/api/ideas/not-an-id")
      .set("Authorization", `Bearer ${firstToken}`);
    assert.equal(response.status, 400);
    assert.equal(response.body.code, "INVALID_ID");
  });

  await t.test("AI returns not configured without a key", async () => {
    const response = await request(app)
      .post("/api/ai/analyze")
      .set("Authorization", `Bearer ${firstToken}`)
      .send({
        title: "A properly detailed idea",
        description: "This description is long enough for the validation rules.",
      });
    assert.equal(response.status, 503);
    assert.equal(response.body.code, "AI_NOT_CONFIGURED");
  });

  assert.equal(firstUser.email, firstEmail.toLowerCase());
});
