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
  return {
    user_id: userId,
    title: payload.title ?? null,
    description: payload.description ?? null,
    category: payload.category ?? null,
    target_audience: payload.target_audience ?? null,
    ai_analysis: payload.ai_analysis ?? null,
  };
}

module.exports = { toUser, toPublicUser, toIdea, fromIdeaInput };
