const mongoose = require("mongoose");
const { getSupabase } = require("./supabase");

const SUPABASE_HEALTH_TIMEOUT_MS = 2000;

function activeProvider() {
  return (process.env.DB_PROVIDER || "mongo").trim().toLowerCase() === "supabase"
    ? "supabase"
    : "mongo";
}

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
  const provider = activeProvider();
  const ok = provider === "mongo" ? mongoose.connection.readyState === 1 : await checkSupabaseHealth();
  return { ok, provider };
}

module.exports = { checkDbHealth };
