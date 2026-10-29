const assert = require('node:assert/strict');
const { results } = require('./strategy_example');

assert.deepEqual(results(), [9000, 8000]);
console.log('Strategy tests passed: 2/2');
