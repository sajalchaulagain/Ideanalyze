const { getSupabase, unwrap } = require("../supabase");
const { AppError } = require("../../utils/AppError");
const { ilikeAny } = require("../../utils/postgrest");
const { toUser, toPublicUser } = require("../mappers");

const USER_COLUMNS =
  "id, name, email, password_hash, role, last_login_at, created_at, updated_at";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getUsersRepositoryClient() {
  return getSupabase();
}

function isUserId(value) {
  return UUID_PATTERN.test(String(value || ""));
}

function assertUserId(id) {
  if (!isUserId(id)) {
    throw new AppError("INVALID_ID", 400, "Invalid user id");
  }
}

function unwrapUser(result) {
  if (result.error?.code === "22P02") {
    throw new AppError("INVALID_ID", 400, "Invalid user id");
  }
  return unwrap(result);
}

async function create({ name, email, passwordHash }) {
  const result = await getUsersRepositoryClient()
    .from("users")
    .insert({ name, email, password_hash: passwordHash })
    .select(USER_COLUMNS)
    .single();
  if (result.error?.code === "23505") {
    throw new AppError(
      "EMAIL_TAKEN",
      409,
      "An account with this email already exists. Try logging in instead.",
      "email"
    );
  }
  return toPublicUser(unwrapUser(result));
}

async function findByEmail(email) {
  const result = await getUsersRepositoryClient()
    .from("users")
    .select(USER_COLUMNS)
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return toPublicUser(unwrapUser(result));
}

async function findById(id) {
  assertUserId(id);
  const result = await getUsersRepositoryClient()
    .from("users")
    .select(USER_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  return toPublicUser(unwrapUser(result));
}

async function findByIds(ids) {
  const validIds = [...new Set((ids || []).filter(isUserId))];
  if (!validIds.length) return [];

  const result = await getUsersRepositoryClient()
    .from("users")
    .select(USER_COLUMNS)
    .in("id", validIds);
  return (unwrapUser(result) || []).map(toPublicUser);
}

async function updateName(id, name) {
  assertUserId(id);
  const result = await getUsersRepositoryClient()
    .from("users")
    .update({ name })
    .eq("id", id)
    .select(USER_COLUMNS)
    .maybeSingle();
  return toPublicUser(unwrapUser(result));
}

async function updatePasswordHash(id, passwordHash) {
  assertUserId(id);
  const result = await getUsersRepositoryClient()
    .from("users")
    .update({ password_hash: passwordHash })
    .eq("id", id)
    .select(USER_COLUMNS)
    .maybeSingle();
  return toPublicUser(unwrapUser(result));
}

async function updateRole(id, role) {
  assertUserId(id);
  const result = await getUsersRepositoryClient()
    .from("users")
    .update({ role })
    .eq("id", id)
    .select(USER_COLUMNS)
    .maybeSingle();
  return toPublicUser(unwrapUser(result));
}

async function updateLastLogin(id) {
  assertUserId(id);
  const result = await getUsersRepositoryClient()
    .from("users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", id)
    .select(USER_COLUMNS)
    .maybeSingle();
  return toPublicUser(unwrapUser(result));
}

async function deleteById(id) {
  assertUserId(id);
  const result = await getUsersRepositoryClient()
    .from("users")
    .delete()
    .eq("id", id)
    .select(USER_COLUMNS)
    .maybeSingle();
  return toPublicUser(unwrapUser(result));
}

async function listForAdmin({ page, limit, search }) {
  const offset = (page - 1) * limit;
  let query = getUsersRepositoryClient()
    .from("users")
    .select(USER_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(ilikeAny(["email", "name"], search));
  }

  const result = await query;
  const rows = unwrapUser(result) || [];
  const total = Number.isInteger(result.count) ? result.count : rows.length;
  const users = rows.map(toPublicUser);
  const ideaCounts = await countIdeasByUserIds(users.map((user) => user._id));

  return {
    users: users.map((user) => ({
      ...user,
      ideaCount: ideaCounts.get(user._id) || 0,
    })),
    total,
  };
}

async function countIdeasByUserIds(ids) {
  const counts = new Map();
  if (!ids.length) return counts;

  const result = await getUsersRepositoryClient()
    .from("ideas")
    .select("user_id")
    .in("user_id", ids);
  for (const row of unwrap(result) || []) {
    counts.set(row.user_id, (counts.get(row.user_id) || 0) + 1);
  }
  return counts;
}

async function countAll() {
  const result = await getUsersRepositoryClient()
    .from("users")
    .select("id", { count: "exact", head: true });
  unwrap(result);
  return result.count || 0;
}

async function countByRole(role) {
  const result = await getUsersRepositoryClient()
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("role", role);
  unwrap(result);
  return result.count || 0;
}

async function countCreatedSince(isoDate) {
  const result = await getUsersRepositoryClient()
    .from("users")
    .select("id", { count: "exact", head: true })
    .gte("created_at", isoDate);
  unwrap(result);
  return result.count || 0;
}

// Credential checks only; never send this result to a response.
async function findByEmailWithPasswordHash(email) {
  const result = await getUsersRepositoryClient()
    .from("users")
    .select(USER_COLUMNS)
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return toUser(unwrap(result));
}

// Credential checks only; never send this result to a response.
async function findByIdWithPasswordHash(id) {
  assertUserId(id);
  const result = await getUsersRepositoryClient()
    .from("users")
    .select(USER_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  return toUser(unwrapUser(result));
}

module.exports = {
  USER_COLUMNS,
  isUserId,
  getUsersRepositoryClient,
  create,
  findByEmail,
  findById,
  findByIds,
  updateName,
  updatePasswordHash,
  updateRole,
  updateLastLogin,
  deleteById,
  listForAdmin,
  countAll,
  countByRole,
  countCreatedSince,
  findByEmailWithPasswordHash,
  findByIdWithPasswordHash,
};
