require("../server/node_modules/dotenv").config({
  path: require("path").join(__dirname, "..", "server", ".env"),
});

const users = require("../server/db/repositories/users");

async function main() {
  const email = `repo-verify-${Date.now()}@example.invalid`;
  const created = await users.create({
    name: "Repository Verify",
    email,
    passwordHash: "redacted-test-hash",
  });
  const foundByEmail = await users.findByEmail(email.toUpperCase());
  const foundById = await users.findById(created._id);
  const foundByIdWithPasswordHash = await users.findByIdWithPasswordHash(created._id);
  const renamed = await users.updateName(created._id, "Repository Renamed");
  const passwordUpdated = await users.updatePasswordHash(created._id, "redacted-test-hash-2");

  let duplicate;
  try {
    await users.create({ name: "Duplicate", email, passwordHash: "redacted-test-hash" });
  } catch (error) {
    duplicate = `${error.code}/${error.statusCode}/${error.field}`;
  }

  console.log(
    `users repository verify: create=${Boolean(created)} findByEmail=${Boolean(foundByEmail)} ` +
      `findById=${Boolean(foundById)} updateName=${Boolean(renamed)} ` +
      `updatePasswordHash=${Boolean(passwordUpdated)} duplicate=${duplicate}`
  );
  console.log(`public user keys: ${Object.keys(foundById).sort().join(",")}`);
  console.log(`credential user keys: ${Object.keys(foundByIdWithPasswordHash).sort().join(",")}`);
}

main().catch((error) => {
  console.error(`users repository verify: failed (${error.code || error.name || "unknown"}/${error.statusCode || "n/a"})`);
  process.exitCode = 1;
});
