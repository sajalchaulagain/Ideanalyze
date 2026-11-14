const { getSupabase, unwrap } = require("../supabase");
const { AppError } = require("../../utils/AppError");
const { escapeLikeTerm } = require("../../utils/postgrest");
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

/* --------------------------------------------------------------------------
   Admin queries. They are not scoped to the caller by design; the route layer
   has already enforced protect + requireAdmin.
   -------------------------------------------------------------------------- */

async function listForAdmin({ page, limit, search, userId }) {
  const offset = (page - 1) * limit;
  let query = getIdeasRepositoryClient()
    .from("ideas")
    .select(IDEA_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.ilike("title", `%${escapeLikeTerm(search)}%`);
  }
  if (userId) {
    query = query.eq("user_id", userId);
  }

  const result = await query;
  const rows = unwrapIdea(result) || [];
  const total = Number.isInteger(result.count) ? result.count : rows.length;
  return { ideas: rows.map(toIdea), total };
}

async function findById(id) {
  assertIdeaId(id);
  const result = await getIdeasRepositoryClient()
    .from("ideas")
    .select(IDEA_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  return toIdea(unwrapIdea(result));
}

async function deleteById(id) {
  assertIdeaId(id);
  const result = await getIdeasRepositoryClient()
    .from("ideas")
    .delete()
    .eq("id", id)
    .select(IDEA_COLUMNS)
    .maybeSingle();
  return toIdea(unwrapIdea(result));
}

async function countAll() {
  const result = await getIdeasRepositoryClient()
    .from("ideas")
    .select("id", { count: "exact", head: true });
  unwrap(result);
  return result.count || 0;
}

async function countWithAnalysis() {
  const result = await getIdeasRepositoryClient()
    .from("ideas")
    .select("id", { count: "exact", head: true })
    .neq("ai_analysis", "{}");
  unwrap(result);
  return result.count || 0;
}

async function countByUser(userId) {
  const result = await getIdeasRepositoryClient()
    .from("ideas")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  unwrap(result);
  return result.count || 0;
}

async function deleteByUser(userId) {
  const result = await getIdeasRepositoryClient()
    .from("ideas")
    .delete()
    .eq("user_id", userId)
    .select("id");
  return (unwrap(result) || []).length;
}

module.exports = {
  getIdeasRepositoryClient,
  createForUser,
  listByUser,
  findByIdAndUser,
  updateByIdAndUser,
  deleteByIdAndUser,
  listForAdmin,
  findById,
  deleteById,
  countAll,
  countWithAnalysis,
  countByUser,
  deleteByUser,
};
