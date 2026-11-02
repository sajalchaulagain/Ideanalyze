const { getSupabase } = require("../supabase");

function getIdeasRepositoryClient() {
  return getSupabase();
}

module.exports = { getIdeasRepositoryClient };
