const { AppError } = require("../utils/AppError");
const users = require("../db/repositories/users");
const ideas = require("../db/repositories/ideas");
const audit = require("../db/repositories/audit");
const { assertNotSelf, assertAdminRemains } = require("../services/adminGuards");

const MAX_LIMIT = 100;

function readPagination(query, defaultLimit = 20) {
  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);
  return {
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    limit: Math.min(
      MAX_LIMIT,
      Math.max(1, Number.isFinite(parsedLimit) ? parsedLimit : defaultLimit)
    ),
  };
}

function pageCount(total, limit) {
  return Math.max(1, Math.ceil(total / limit));
}

function readSearch(query) {
  return typeof query.search === "string" ? query.search.trim() : "";
}

function auditActor(req) {
  return {
    actorId: req.adminUser._id,
    actorEmail: req.adminUser.email,
  };
}

async function getStats(req, res, next) {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [userCount, ideaCount, ideasWithAnalysis, signups7d, admins] =
      await Promise.all([
        users.countAll(),
        ideas.countAll(),
        ideas.countWithAnalysis(),
        users.countCreatedSince(since),
        users.countByRole("admin"),
      ]);

    return res.json({
      success: true,
      data: {
        users: userCount,
        ideas: ideaCount,
        ideasWithAnalysis,
        signups7d,
        admins,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function getUsers(req, res, next) {
  try {
    const { page, limit } = readPagination(req.query);
    const { users: rows, total } = await users.listForAdmin({
      page,
      limit,
      search: readSearch(req.query),
    });

    return res.json({
      success: true,
      data: { users: rows, total, page, pages: pageCount(total, limit) },
    });
  } catch (error) {
    return next(error);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const target = await users.findById(req.params.id);
    if (!target) {
      return next(new AppError("USER_NOT_FOUND", 404, "User not found."));
    }

    assertNotSelf({
      actorId: req.adminUser._id,
      targetId: target._id,
      code: "SELF_ROLE_CHANGE",
      message: "You cannot change your own role.",
    });

    if (target.role === "admin" && req.body.role === "user") {
      assertAdminRemains({
        targetRole: target.role,
        adminCount: await users.countByRole("admin"),
      });
    }

    const updated = await users.updateRole(target._id, req.body.role);

    await audit.record({
      ...auditActor(req),
      action: "user.role_changed",
      targetType: "user",
      targetId: target._id,
      detail: {
        email: target.email,
        from: target.role,
        to: req.body.role,
      },
    });

    return res.json({ success: true, data: { user: updated } });
  } catch (error) {
    return next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const target = await users.findById(req.params.id);
    if (!target) {
      return next(new AppError("USER_NOT_FOUND", 404, "User not found."));
    }

    assertNotSelf({
      actorId: req.adminUser._id,
      targetId: target._id,
      code: "SELF_DELETE",
      message: "You cannot delete your own account.",
    });

    if (target.role === "admin") {
      assertAdminRemains({
        targetRole: target.role,
        adminCount: await users.countByRole("admin"),
      });
    }

    const ideaCount = await ideas.countByUser(target._id);

    // ideas.user_id has no foreign key, so remove the children first. If this
    // fails the request aborts before the user row is touched.
    await ideas.deleteByUser(target._id);

    const deleted = await users.deleteById(target._id);
    if (!deleted) {
      return next(new AppError("USER_NOT_FOUND", 404, "User not found."));
    }

    await audit.record({
      ...auditActor(req),
      action: "user.deleted",
      targetType: "user",
      targetId: target._id,
      detail: {
        email: target.email,
        role: target.role,
        deletedIdeas: ideaCount,
      },
    });

    return res.json({ success: true, deletedIdeas: ideaCount });
  } catch (error) {
    return next(error);
  }
}

async function getIdeas(req, res, next) {
  try {
    const { page, limit } = readPagination(req.query);
    const userId =
      typeof req.query.userId === "string" && req.query.userId.trim()
        ? req.query.userId.trim()
        : "";
    const { ideas: rows, total } = await ideas.listForAdmin({
      page,
      limit,
      search: readSearch(req.query),
      userId,
    });

    const owners = await users.findByIds(rows.map((idea) => idea.user));
    const ownersById = new Map(owners.map((owner) => [owner._id, owner]));
    const items = rows.map((idea) => {
      const owner = ownersById.get(idea.user);
      return {
        ...idea,
        userId: idea.user,
        userName: owner?.name || "Deleted user",
        userEmail: owner?.email || null,
      };
    });

    return res.json({
      success: true,
      data: { ideas: items, total, page, pages: pageCount(total, limit) },
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteIdea(req, res, next) {
  try {
    const idea = await ideas.findById(req.params.id);
    if (!idea) {
      return next(new AppError("IDEA_NOT_FOUND", 404, "Idea not found."));
    }

    const [owner] = await users.findByIds([idea.user]);
    await ideas.deleteById(idea._id);

    await audit.record({
      ...auditActor(req),
      action: "idea.deleted",
      targetType: "idea",
      targetId: idea._id,
      detail: {
        title: idea.title,
        ownerId: idea.user,
        ownerEmail: owner?.email || null,
      },
    });

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}

async function getAudit(req, res, next) {
  try {
    const { page, limit } = readPagination(req.query, 50);
    const { entries, total } = await audit.list({ page, limit });

    return res.json({
      success: true,
      data: { entries, total, page, pages: pageCount(total, limit) },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getIdeas,
  deleteIdea,
  getAudit,
};
