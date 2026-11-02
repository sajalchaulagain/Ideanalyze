const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { AppError } = require("../utils/AppError");

/*
  Route guard for protected endpoints (ideas, AI, /auth/me).

  How to use in a route file:
      router.get("/ideas", protect, ideaController.getIdeas);
                            ^^^^^^^ runs FIRST, blocks strangers

  Expected header from the React frontend (via Axios):
      Authorization: Bearer <token>
*/
async function protect(req, res, next) {
  let token;

  // Tokens arrive as "Bearer <token>" — split off the "Bearer " prefix.
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("TOKEN_MISSING", 401, "Not authorized: no token provided"));
  }

  try {
    // Verify the signature AND expiry in one step. Throws if the token was
    // forged, tampered with, or expired — all of which land in the catch below.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load the fresh user from the database (without the password).
    // Why not trust the token alone? So deleted/deactivated accounts
    // instantly lose access even if their old token hasn't expired yet.
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return next(new AppError("TOKEN_INVALID", 401, "Not authorized: user no longer exists"));
    }

    next(); // Token is valid — let the request continue to the controller.
  } catch (error) {
    if (error.name === "AppError") return next(error);
    return next(new AppError("TOKEN_INVALID", 401, "Not authorized: invalid or expired token"));
  }
}

module.exports = { protect };
