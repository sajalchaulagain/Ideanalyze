const axios = require("../server/node_modules/axios");

const BASE_URL = process.env.API_URL || "http://localhost:5000/api";

async function testHealth() {
  try {
    const res = await axios.get(`${BASE_URL}/health`);
    console.log(`API health: ${res.status} ${res.data.provider || "unknown"}`);
  } catch (error) {
    console.error(`API health failed: ${error.message}`);
  }
}

if (require.main === module) testHealth();

module.exports = { testHealth };
