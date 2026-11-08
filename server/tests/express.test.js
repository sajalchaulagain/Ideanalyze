const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const jwt = require("jsonwebtoken");
const users = require("../db/repositories/users");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-only-jwt-secret";
process.env.AI_API_KEY = "";
process.env.AI_BASE_URL = "";
process.env.CLIENT_URL = "http://localhost:5173";

const app = require("../server");

test("unknown API routes return JSON 404", async () => {
  const response = await request(app).get("/api/does-not-exist");
  assert.equal(response.status, 404);
  assert.equal(response.body.code, "ROUTE_NOT_FOUND");
  assert.match(response.headers["content-type"], /json/);
});

test("CORS rejects an unknown origin", async () => {
  const response = await request(app)
    .options("/api/ideas")
    .set("Origin", "https://evil.example");
  assert.equal(response.status, 403);
  assert.equal(response.body.code, "CORS_ORIGIN_DENIED");
});

test("signup validates password strength", async () => {
  const response = await request(app)
    .post("/api/auth/signup")
    .send({ name: "Weak", email: "weak@test.com", password: "short" });
  assert.equal(response.status, 422);
  assert.equal(response.body.code, "VALIDATION_FAILED");
  assert.equal(response.body.field, "password");
});

test("invalid JSON returns a coded 400", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .set("Content-Type", "application/json")
    .send('{"not json');
  assert.equal(response.status, 400);
  assert.equal(response.body.code, "INVALID_JSON");
});

test("missing token returns a coded 401", async () => {
  const response = await request(app).get("/api/ideas");
  assert.equal(response.status, 401);
  assert.equal(response.body.code, "TOKEN_MISSING");
});

test("invalid token returns a coded 401", async () => {
  const response = await request(app)
    .get("/api/ideas")
    .set("Authorization", "Bearer definitely-not-a-jwt");
  assert.equal(response.status, 401);
  assert.equal(response.body.code, "TOKEN_INVALID");
});

test("invalid idea id returns a coded 400 without database access", async () => {
  const originalFindById = users.findById;
  users.findById = async () => ({ _id: "test-user", name: "Test", email: "test@example.com" });
  try {
    const token = jwt.sign({ id: "test-user" }, process.env.JWT_SECRET);
    const response = await request(app)
      .get("/api/ideas/not-an-id")
      .set("Authorization", `Bearer ${token}`);
    assert.equal(response.status, 400);
    assert.equal(response.body.code, "INVALID_ID");
  } finally {
    users.findById = originalFindById;
  }
});
