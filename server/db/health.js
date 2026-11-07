const { getSupabase } = require("./supabase");

const SUPABASE_HEALTH_TIMEOUT_MS = 2000;

async function checkSupabaseHealth() {
  let timeout;
  try {
    const query = getSupabase().from("ideas").select("id", { count: "exact", head: true });
    const timeoutPromise = new Promise((resolve) => {
      timeout = setTimeout(() => resolve({ error: new Error("Supabase health check timed out") }), SUPABASE_HEALTH_TIMEOUT_MS);
      timeout.unref?.();
    });
    const result = await Promise.race([query, timeoutPromise]);
    return !result?.error;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function checkDbHealth() {
  return { ok: await checkSupabaseHealth(), provider: "supabase" };
}

module.exports = { checkDbHealth };
