const { AppError } = require("../utils/AppError");
const users = require("../db/repositories/users");

/*
  Runs after protect(). The role is always re-read from the database so a
  demotion takes effect on the next request instead of waiting for the JWT to
  expire. Never trust a role claim from the token for this decision.
*/
async function requireAdmin(req, res, next) {
  try {
    if (!req.user?._id) {
      return next(new AppError("TOKEN_INVALID", 401, "Not authorized"));
    }

    const fresh = await users.findById(req.user._id);
    if (!fresh) {
      return next(new AppError("TOKEN_INVALID", 401, "Not authorized"));
    }

    if (fresh.role !== "admin") {
      return next(new AppError("FORBIDDEN", 403, "Admin access required."));
    }

    req.adminUser = fresh;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { requireAdmin };
