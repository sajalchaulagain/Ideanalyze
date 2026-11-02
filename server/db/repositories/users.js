const { getSupabase } = require("../supabase");

function getUsersRepositoryClient() {
  return getSupabase();
}

module.exports = { getUsersRepositoryClient };
