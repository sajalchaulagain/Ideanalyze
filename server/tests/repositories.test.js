const test = require("node:test");
const assert = require("node:assert/strict");
const users = require("../db/repositories/users");
const ideas = require("../db/repositories/ideas");

assert.equal(typeof users.getUsersRepositoryClient, "function");
assert.equal(typeof ideas.getIdeasRepositoryClient, "function");

test.todo("users.create");
test.todo("users.findByEmail");
test.todo("users.findById");
test.todo("users.updateName");
test.todo("ideas.createForUser");
test.todo("ideas.listByUser");
test.todo("ideas.findByIdAndUser");
test.todo("ideas.updateByIdAndUser");
test.todo("ideas.deleteByIdAndUser");
