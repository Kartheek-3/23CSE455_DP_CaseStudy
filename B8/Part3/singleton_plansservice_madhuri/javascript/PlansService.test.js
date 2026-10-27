const assert=require('node:assert/strict');
const PlansService=require('./PlansService');
assert.strictEqual(new PlansService(),new PlansService());
console.log('PlansService Singleton test passed');
