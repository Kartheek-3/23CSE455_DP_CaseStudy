const assert=require('node:assert/strict');
const {getDb,MemberRepository}=require('./DatabaseInjection');
const db=getDb(), repo=new MemberRepository(db);
assert.strictEqual(repo.db,db); assert.equal(repo.listMembers(),'database result');
console.log('Database injection test passed');
