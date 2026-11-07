const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

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
