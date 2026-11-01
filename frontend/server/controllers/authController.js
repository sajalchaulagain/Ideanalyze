const jwt = require("jsonwebtoken");
const User = require("../models/User");

/*
  Creates a signed login token for a user id.
  The token proves "this request comes from user X" without sending
  the password again. Only OUR server can mint valid tokens because
  only we know JWT_SECRET.
*/
function createToken(userId) {
  return jwt.sign(
    { id: userId }, // Payload: deliberately tiny — just who the user is.
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// Shapes the public user object. Centralized so we never accidentally
// leak the password hash in some new endpoint later.
function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

/*
  POST /api/auth/signup
  Body: { name, email, password }
  Flow: validate → check duplicate → hash (model hook) → save → token → respond
*/
async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Basic presence checks with clear messages (the Mongoose schema
    // enforces format/length again as a second safety net).
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    // Friendly duplicate check BEFORE attempting to save (the unique index
    // in the schema is the real enforcer; this just gives a nicer message).
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "An account with this email already exists" });
    }

    // Password hashing happens automatically in the User pre-save hook.
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });
    const token = createToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: { user: publicUser(user), token },
    });
  } catch (error) {
    next(error); // Hand unexpected errors to the central error middleware.
  }
}

/*
  POST /api/auth/login
  Body: { email, password }
  Flow: find user → compare hash → token → respond
*/
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Password is select:false in the schema, so opt back in for this one query.
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    // Same generic message for "no such email" AND "wrong password".
    // Why? Specific messages ("email not found") would let attackers probe
    // which email addresses have accounts.
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = createToken(user._id);

    res.json({
      success: true,
      message: "Logged in successfully",
      data: { user: publicUser(user), token },
    });
  } catch (error) {
    next(error);
  }
}

/*
  GET /api/auth/me  (protected — requires "Authorization: Bearer <token>")
  Returns the currently logged-in user. The frontend calls this on page
  reload to restore the session from a stored token.
*/
async function getMe(req, res, next) {
  try {
    // req.user was attached by the protect middleware — no DB lookup needed.
    res.json({
      success: true,
      data: { user: publicUser(req.user) },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { signup, login, getMe };
