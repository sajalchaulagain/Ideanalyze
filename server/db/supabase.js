const { createClient } = require("@supabase/supabase-js");
const { AppError } = require("../utils/AppError");

let client;

function getSupabase() {
  if (client) return client;

  const url = (process.env.SUPABASE_URL || "").trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

  if (!url || !serviceRoleKey) {
    throw new AppError(
      "DB_UNAVAILABLE",
      503,
      "Supabase is unavailable: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured."
    );
  }

  client = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return client;
}

function unwrap({ data, error }, code = "DB_UNAVAILABLE") {
  if (error) throw new AppError(code, 503, "A database request failed.");
  return data;
}

module.exports = { getSupabase, unwrap };
