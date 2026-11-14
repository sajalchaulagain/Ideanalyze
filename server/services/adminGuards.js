const { AppError } = require("../utils/AppError");

/*
  Shared invariants for admin mutations. Keeping them in one place makes the
  "never lock the system out" rules explicit and testable.
*/

function assertNotSelf({ actorId, targetId, code, message }) {
  if (targetId !== null && targetId !== undefined && String(targetId) === String(actorId)) {
    throw new AppError(code, 400, message);
  }
}

function assertAdminRemains({ targetRole, adminCount }) {
  if (targetRole === "admin" && adminCount - 1 < 1) {
    throw new AppError(
      "LAST_ADMIN",
      400,
      "There must be at least one admin."
    );
  }
}

module.exports = { assertNotSelf, assertAdminRemains };
