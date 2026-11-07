function toUser(row) {
  if (!row) return null;

  return {
    _id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toPublicUser(row) {
  if (!row) return null;

  const { passwordHash, ...user } = toUser(row);
  void passwordHash;
  return user;
}

function toIdea(row) {
  if (!row) return null;

  return {
    _id: row.id,
    user: row.user_id,
    title: row.title,
    description: row.description,
    category: row.category,
    targetAudience: row.target_audience,
    aiAnalysis: row.ai_analysis ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function fromIdeaInput(payload = {}, userId) {
  const row = { user_id: userId };
  if (payload.title !== undefined) row.title = payload.title;
  if (payload.description !== undefined) row.description = payload.description;
  if (payload.category !== undefined) row.category = payload.category;
  if (payload.targetAudience !== undefined) row.target_audience = payload.targetAudience;
  if (payload.aiAnalysis !== undefined) row.ai_analysis = payload.aiAnalysis;
  return row;
}

function fromIdeaPatch(payload = {}) {
  const row = {};
  if (payload.title !== undefined) row.title = payload.title;
  if (payload.description !== undefined) row.description = payload.description;
  if (payload.category !== undefined) row.category = payload.category;
  if (payload.targetAudience !== undefined) row.target_audience = payload.targetAudience;
  if (payload.aiAnalysis !== undefined) row.ai_analysis = payload.aiAnalysis;
  return row;
}

module.exports = { toUser, toPublicUser, toIdea, fromIdeaInput, fromIdeaPatch };
