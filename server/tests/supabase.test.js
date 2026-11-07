const test = require("node:test");
const assert = require("node:assert/strict");
const { AppError } = require("../utils/AppError");
const { unwrap } = require("../db/supabase");

test("unwrap returns data or throws a shared database AppError", () => {
  assert.throws(
    () => unwrap({ data: null, error: { message: "boom" } }),
    (error) =>
      error instanceof AppError &&
      error.code === "DB_UNAVAILABLE" &&
      error.statusCode === 503
  );
  assert.deepEqual(unwrap({ data: [], error: null }), []);
});
