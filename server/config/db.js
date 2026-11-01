const mongoose = require("mongoose");

const colors = {
  bold: (t) => `\x1b[1m${t}\x1b[0m`,
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
};

const ATLAS_HINTS = [
  {
    test: /authentication failed|bad auth|auth(?:entication)? error|invalid credentials/i,
    text:
      "Authentication failed — check the username/password inside MONGO_URI. " +
      "URL-encode special characters (for example @ → %40 and : → %3A) and confirm the database user exists.",
  },
  {
    test: /whitelist|not allowed|ip address|access list|could not connect to any servers/i,
    text:
      "IP not whitelisted — in MongoDB Atlas open Network Access and add 0.0.0.0/0 " +
      "(or your Render egress IP) to the allowlist.",
  },
  {
    test: /querySrv|_mongodb._tcp|eservfail|enotfound|dns|srv/i,
    text:
      "DNS/SRV lookup failed — verify the cluster hostname in MONGO_URI, that the cluster still exists, " +
      "and that DNS resolution works from this host.",
  },
  {
    test: /27017|econnrefused|etimedout|timeout|timed out|server selection/i,
    text:
      "Port 27017 blocked/timed out — allow outbound TCP 27017 through the firewall. " +
      "Serverless hosts such as Render must be able to reach Atlas directly.",
  },
];

function printConnectionHints(error) {
  const message = `${error?.message || ""} ${error?.cause?.message || ""}`;
  const hints = ATLAS_HINTS.filter((hint) => hint.test.test(message)).map((hint) => hint.text);

  if (hints.length === 0) {
    hints.push(
      "Check MONGO_URI, the Atlas Network Access allowlist, DNS resolution, and outbound TCP 27017."
    );
  }

  console.error(colors.yellow("\nConnection troubleshooting:"));
  for (const hint of hints) {
    console.error(colors.yellow(`  • ${hint}`));
  }
}

async function connectDB() {
  const uri = (process.env.MONGO_URI || "").trim();

  if (!uri || uri.includes("your_mongodb")) {
    const error = new Error(
      "MONGO_URI is missing or still set to a placeholder. Set a real MongoDB Atlas connection string in server/.env."
    );
    console.error(colors.red(`\n❌ ${error.message}\n`));
    throw error;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
      maxPoolSize: 10,
      autoIndex: process.env.NODE_ENV !== "production",
    });

    console.log(
      colors.bold(colors.green(`✅ MongoDB connected successfully: ${colors.cyan(conn.connection.host)}`))
    );
    return conn;
  } catch (error) {
    console.error(colors.red(`\n❌ MongoDB connection failed: ${error.message}`));
    printConnectionHints(error);
    console.error("");
    throw error;
  }
}

module.exports = connectDB;
