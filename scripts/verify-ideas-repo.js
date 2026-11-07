require("../server/node_modules/dotenv").config({
  path: require("path").join(__dirname, "..", "server", ".env"),
});

const ideas = require("../server/db/repositories/ideas");

const input = {
  title: "Repository Verify",
  description: "Repository verification idea",
  category: "Education",
  targetAudience: "Students",
  aiAnalysis: { score: 7 },
};

async function main() {
  const userA = `verify-user-a-${Date.now()}`;
  const userB = `verify-user-b-${Date.now()}`;
  const first = await ideas.createForUser(userA, input);
  const second = await ideas.createForUser(userA, { ...input, title: "Repository Verify 2" });
  const listA = await ideas.listByUser(userA);
  const listB = await ideas.listByUser(userB);
  const crossUserFind = await ideas.findByIdAndUser(first._id, userB);
  const crossUserUpdate = await ideas.updateByIdAndUser(first._id, userB, { title: "Nope" });
  const crossUserDelete = await ideas.deleteByIdAndUser(first._id, userB);
  const deleted = await ideas.deleteByIdAndUser(first._id, userA);
  const gone = await ideas.findByIdAndUser(first._id, userA);
  const readBack = await ideas.findByIdAndUser(second._id, userA);

  let invalidId;
  let networkCalled = false;
  const originalClient = ideas.getIdeasRepositoryClient;
  ideas.getIdeasRepositoryClient = () => {
    networkCalled = true;
    return originalClient();
  };
  try {
    await ideas.findByIdAndUser("not-a-uuid", "x");
  } catch (error) {
    invalidId = `${error.code}/${error.statusCode}`;
  }
  ideas.getIdeasRepositoryClient = originalClient;

  console.log(
    `ideas repository verify: create=2 listA=${listA.length} listB=${listB.length} ` +
      `crossFind=${crossUserFind} crossUpdate=${crossUserUpdate} crossDelete=${crossUserDelete} ` +
      `deleted=${Boolean(deleted)} gone=${gone} invalidId=${invalidId} networkCalled=${networkCalled}`
  );
  console.log(`idea fields survived: targetAudience=${readBack.targetAudience} aiAnalysisScore=${readBack.aiAnalysis.score}`);
}

main().catch((error) => {
  console.error(`ideas repository verify: failed (${error.code || error.name || "unknown"}/${error.statusCode || "n/a"})`);
  process.exitCode = 1;
});
