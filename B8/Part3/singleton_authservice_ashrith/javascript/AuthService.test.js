const assert=require('node:assert/strict');
const AuthService=require('./AuthService');
assert.strictEqual(new AuthService(),new AuthService());
console.log('AuthService Singleton test passed');
