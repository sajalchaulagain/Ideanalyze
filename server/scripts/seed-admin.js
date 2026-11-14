const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const users = require("../db/repositories/users");
const { hashPassword } = require("../utils/password");

function readCredentials() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!email || !password) {
    console.error(
      "Refusing to seed an admin: set ADMIN_EMAIL and ADMIN_PASSWORD in the environment.\n" +
        "Example (PowerShell):\n" +
        '  $env:ADMIN_EMAIL="you@example.com"; $env:ADMIN_PASSWORD="<a strong password>"; npm run seed:admin'
    );
    process.exit(1);
  }

  return { email, password };
}

async function main() {
  const { email, password } = readCredentials();

  const existing = await users.findByEmail(email);
  if (existing) {
    await users.updateRole(existing._id, "admin");
    console.log(`Promoted existing user: ${email} (role: admin)`);
    return;
  }

  const created = await users.create({
    name: (process.env.ADMIN_NAME || "").trim() || "Admin",
    email,
    passwordHash: await hashPassword(password),
  });
  await users.updateRole(created._id, "admin");
  console.log(`Created admin user: ${email} (role: admin)`);
}

main().catch((error) => {
  console.error(`Admin seed failed: ${error.message}`);
  process.exit(1);
});
