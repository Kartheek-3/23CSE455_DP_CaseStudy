
const assert = require("node:assert/strict");
const { CreateJobMutation, UpdateJobMutation } = require("./main");

const allowed = new CreateJobMutation().mutate(true, "Developer");
assert.equal(allowed.success, true);
assert.equal(allowed.type, "job");
console.log("PASS: Allowed mutation");

const updated = new UpdateJobMutation().mutate(true, "Engineer");
assert.equal(updated.success, true);
assert.equal(updated.type, "updated_job");
console.log("PASS: Update mutation");

const denied = new CreateJobMutation().mutate(false, "Denied");
assert.equal(denied.success, false);
assert.equal(denied.error, "Permission denied");
console.log("PASS: Permission denial returns error payload");

console.log("All 3 Template Method tests passed.");
