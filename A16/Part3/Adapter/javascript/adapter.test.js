const assert = require('node:assert/strict');
const { asLine, result } = require('./adapter_example');

assert.equal(asLine(result()), 'status=APPROVED,amount_cents=2599,reference=legacy-25.99');
console.log('Adapter tests passed: 1/1');
