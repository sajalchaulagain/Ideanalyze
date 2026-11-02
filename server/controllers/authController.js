const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { AppError } = require("../utils/AppError");

function createToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return next(
        new AppError(
          "EMAIL_TAKEN",
          409,
          "An account with this email already exists. Try logging in instead.",
          "email"
        )
      );
    }

    const user = await User.create({ name, email, password });
    const token = createToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: { user: publicUser(user), token },
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return next(new AppError("LOGIN_FAILED", 401, "Invalid email or password"));
    }

    const token = createToken(user._id);
    return res.json({
      success: true,
      message: "Logged in successfully",
      data: { user: publicUser(user), token },
    });
  } catch (error) {
    return next(error);
  }
}

async function getMe(req, res, next) {
  try {
    return res.json({ success: true, data: { user: publicUser(req.user) } });
  } catch (error) {
    return next(error);
  }
}

async function updateMe(req, res, next) {
  try {
    req.user.name = req.body.name;
    await req.user.save();
    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user: publicUser(req.user) },
    });
  } catch (error) {
    return next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!user || !(await user.matchPassword(req.body.currentPassword))) {
      return next(new AppError("PASSWORD_MISMATCH", 400, "Current password is incorrect."));
    }
    if (await user.matchPassword(req.body.newPassword)) {
      return next(new AppError("PASSWORD_UNCHANGED", 400, "New password must be different from the current password."));
    }

    user.password = req.body.newPassword;
    await user.save();
    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return next(error);
  }
}

module.exports = { signup, login, getMe, updateMe, changePassword };
