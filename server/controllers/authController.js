const jwt = require("jsonwebtoken");
const { AppError } = require("../utils/AppError");
const users = require("../db/repositories/users");
const { hashPassword, verifyPassword } = require("../utils/password");

function createToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    // Not a secret. Used by the admin guard and navigation.
    role: user.role || "user",
    createdAt: user.createdAt,
  };
}

async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const user = await users.create({ name, email, passwordHash: await hashPassword(password) });
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
    const user = await users.findByEmailWithPasswordHash(email);

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return next(new AppError("LOGIN_FAILED", 401, "Invalid email or password"));
    }

    const token = createToken(user._id);

    // Best-effort timestamp: never block or fail a login because of it.
    users.updateLastLogin(user._id).catch((error) => {
      console.error(`last_login_at update failed for user ${user._id}: ${error.message}`);
    });

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
    const user = await users.updateName(req.user._id, req.body.name);
    return res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user: publicUser(user) },
    });
  } catch (error) {
    return next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const user = await users.findByIdWithPasswordHash(req.user._id);
    if (!user || !(await verifyPassword(req.body.currentPassword, user.passwordHash))) {
      return next(new AppError("PASSWORD_MISMATCH", 400, "Current password is incorrect."));
    }
    if (await verifyPassword(req.body.newPassword, user.passwordHash)) {
      return next(new AppError("PASSWORD_UNCHANGED", 400, "New password must be different from the current password."));
    }

    await users.updatePasswordHash(req.user._id, await hashPassword(req.body.newPassword));
    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return next(error);
  }
}

module.exports = { signup, login, getMe, updateMe, changePassword };
