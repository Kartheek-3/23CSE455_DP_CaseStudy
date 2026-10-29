const assert = require("node:assert/strict");
const { StateServer, AlertParser } = require("./state_parser_strategy");

const server = new StateServer(new AlertParser());
assert.equal(server.process("sample-data"), "Parsed alert: sample-data");
console.log("PASS: Alert parser strategy delegation");
