const { getSupabase, unwrap } = require("../supabase");
const { AppError } = require("../../utils/AppError");
const { toIdea, fromIdeaInput, fromIdeaPatch } = require("../mappers");

const IDEA_COLUMNS = "id, user_id, title, description, category, target_audience, ai_analysis, created_at, updated_at";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getIdeasRepositoryClient() {
  return getSupabase();
}

function assertIdeaId(id) {
  if (!UUID_PATTERN.test(id)) {
    throw new AppError("INVALID_ID", 400, "Invalid idea id");
  }
}

function unwrapIdea(result) {
  if (result.error?.code === "22P02") {
    throw new AppError("INVALID_ID", 400, "Invalid idea id");
  }
  return unwrap(result);
}

async function createForUser(userId, input) {
  const result = await getIdeasRepositoryClient()
    .from("ideas")
    .insert(fromIdeaInput(input, userId))
    .select(IDEA_COLUMNS)
    .single();
  return toIdea(unwrapIdea(result));
}

async function listByUser(userId) {
  const result = await getIdeasRepositoryClient()
    .from("ideas")
    .select(IDEA_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (unwrapIdea(result) || []).map(toIdea);
}

async function findByIdAndUser(id, userId) {
  assertIdeaId(id);
  const result = await getIdeasRepositoryClient()
    .from("ideas")
    .select(IDEA_COLUMNS)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  return toIdea(unwrapIdea(result));
}

async function updateByIdAndUser(id, userId, patch) {
  assertIdeaId(id);
  const result = await getIdeasRepositoryClient()
    .from("ideas")
    .update(fromIdeaPatch(patch))
    .eq("id", id)
    .eq("user_id", userId)
    .select(IDEA_COLUMNS)
    .maybeSingle();
  return toIdea(unwrapIdea(result));
}

async function deleteByIdAndUser(id, userId) {
  assertIdeaId(id);
  const result = await getIdeasRepositoryClient()
    .from("ideas")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select(IDEA_COLUMNS)
    .maybeSingle();
  return toIdea(unwrapIdea(result));
}

module.exports = {
  getIdeasRepositoryClient,
  createForUser,
  listByUser,
  findByIdAndUser,
  updateByIdAndUser,
  deleteByIdAndUser,
};
