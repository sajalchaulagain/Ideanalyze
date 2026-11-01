/*
  test-api.js — Simple test script to verify API server availability.
  Run with: node test-api.js
*/
const axios = require("axios");

const BASE_URL = process.env.API_URL || "http://localhost:5000/api";

async function testHealth() {
  try {
    console.log(`🔍 Testing connection to ${BASE_URL}/health ...`);
    const res = await axios.get(`${BASE_URL}/health`);
    console.log("✅ API Health Response:", res.data);
  } catch (error) {
    console.error("❌ Health check failed:", error.message);
  }
}

if (require.main === module) {
  testHealth();
}

module.exports = { testHealth };
