const mongoose = require("mongoose");

const colors = {
  bold: (t) => `\x1b[1m${t}\x1b[0m`,
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
};

async function connectDB() {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.includes("your_mongodb")) {
    console.warn(colors.yellow("\n⚠️ MONGO_URI is missing or unconfigured in server/.env"));
    console.warn(colors.yellow("   Set a valid MONGO_URI in server/.env to enable database operations.\n"));
    return false;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(colors.bold(colors.green(`✅ MongoDB connected successfully: ${colors.cyan(conn.connection.host)}`)));
    return true;
  } catch (error) {
    console.error(colors.red(`\n❌ MongoDB connection failed: ${error.message}`));
    console.error(colors.yellow("   Check MONGO_URI in server/.env, IP whitelist, and network connection.\n"));
    return false;
  }
}

module.exports = connectDB;
