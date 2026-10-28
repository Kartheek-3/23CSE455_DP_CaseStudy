
const assert = require("node:assert/strict");
const { IsEmployer, IsEmployee, IsJobCreator, checkPermission } = require("./main");

const employer = { id: 1, role: "employer" };
const employee = { id: 2, role: "employee" };
const otherEmployer = { id: 3, role: "employer" };
const job = { id: 101, owner_id: 1 };

function testEmployerPermission() {
    assert.equal(checkPermission(new IsEmployer(), employer), true);
    assert.equal(checkPermission(new IsEmployer(), employee), false);
    console.log("PASS: Employer permission");
}

function testEmployeePermission() {
    assert.equal(checkPermission(new IsEmployee(), employee), true);
    assert.equal(checkPermission(new IsEmployee(), employer), false);
    console.log("PASS: Employee permission");
}

function testJobCreatorPermission() {
    assert.equal(checkPermission(new IsJobCreator(), employer, job), true);
    assert.equal(checkPermission(new IsJobCreator(), otherEmployer, job), false);
    assert.equal(checkPermission(new IsJobCreator(), employer, null), false);
    console.log("PASS: Job creator permission");
}

testEmployerPermission();
testEmployeePermission();
testJobCreatorPermission();
console.log("All Strategy tests passed.");
