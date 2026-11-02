const { createClient } = require("@supabase/supabase-js");

class AppError extends Error {
  constructor(code, statusCode, message) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

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

module.exports = { AppError, getSupabase };
