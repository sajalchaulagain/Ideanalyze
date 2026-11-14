const { getSupabase, unwrap } = require("../supabase");
const { toAuditEntry } = require("../mappers");

const AUDIT_COLUMNS =
  "id, actor_id, actor_email, action, target_type, target_id, detail, created_at";

function getAuditRepositoryClient() {
  return getSupabase();
}

/*
  Audit writes are best-effort by design: a failed insert must never fail the
  admin request that triggered it. Callers get null and the failure is logged
  without any credential material.
*/
async function record({
  actorId,
  actorEmail = null,
  action,
  targetType = null,
  targetId = null,
  detail = {},
}) {
  try {
    const result = await getAuditRepositoryClient()
      .from("admin_audit")
      .insert({
        actor_id: String(actorId),
        actor_email: actorEmail,
        action,
        target_type: targetType,
        target_id: targetId === null ? null : String(targetId),
        detail,
      })
      .select(AUDIT_COLUMNS)
      .single();
    return toAuditEntry(unwrap(result));
  } catch (error) {
    console.error(
      `admin_audit insert failed (action=${action}, target=${targetType}:${targetId}, actor=${actorId}): ${error.message}`
    );
    return null;
  }
}

async function list({ page, limit }) {
  const offset = (page - 1) * limit;
  const result = await getAuditRepositoryClient()
    .from("admin_audit")
    .select(AUDIT_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(offset, offset + limit - 1);

  const rows = unwrap(result) || [];
  const total = Number.isInteger(result.count) ? result.count : rows.length;
  return { entries: rows.map(toAuditEntry), total };
}

module.exports = {
  getAuditRepositoryClient,
  record,
  list,
};
