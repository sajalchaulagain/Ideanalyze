const { getSupabase, unwrap } = require("../supabase");
const { AppError } = require("../../utils/AppError");
const { toUser, toPublicUser } = require("../mappers");

const USER_COLUMNS = "id, name, email, password_hash, created_at, updated_at";

function getUsersRepositoryClient() {
  return getSupabase();
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
  return toPublicUser(unwrap(result));
}

async function findByEmail(email) {
  const result = await getUsersRepositoryClient()
    .from("users")
    .select(USER_COLUMNS)
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return toPublicUser(unwrap(result));
}

async function findById(id) {
  const result = await getUsersRepositoryClient()
    .from("users")
    .select(USER_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  return toPublicUser(unwrap(result));
}

async function updateName(id, name) {
  const result = await getUsersRepositoryClient()
    .from("users")
    .update({ name })
    .eq("id", id)
    .select(USER_COLUMNS)
    .maybeSingle();
  return toPublicUser(unwrap(result));
}

async function updatePasswordHash(id, passwordHash) {
  const result = await getUsersRepositoryClient()
    .from("users")
    .update({ password_hash: passwordHash })
    .eq("id", id)
    .select(USER_COLUMNS)
    .maybeSingle();
  return toPublicUser(unwrap(result));
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
  const result = await getUsersRepositoryClient()
    .from("users")
    .select(USER_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  return toUser(unwrap(result));
}

module.exports = {
  getUsersRepositoryClient,
  create,
  findByEmail,
  findById,
  updateName,
  updatePasswordHash,
  findByEmailWithPasswordHash,
  findByIdWithPasswordHash,
};
