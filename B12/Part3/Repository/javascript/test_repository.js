'use strict';

const assert = require('assert');
const {
  User,
  InMemoryUserRepository,
  UserService,
} = require('./user_repository.js');

let passed = 0;
let total = 0;
function check(label, actual, expected) {
  total += 1;
  assert.strictEqual(
    actual,
    expected,
    label + ': expected ' + expected + ' got ' + actual,
  );
  passed += 1;
}

const service = new UserService(new InMemoryUserRepository());

service.register(new User(1, 'Ada'));
check('find-name', service.get(1).name, 'Ada');
check('all-1', service.all().length, 1);

service.register(new User(2, 'Bob'));
check('all-2', service.all().length, 2);

check('missing', service.get(99), null);

service.register(new User(1, 'Ada2'));
check('overwrite-count', service.all().length, 2);
check('overwrite-name', service.get(1).name, 'Ada2');

service.remove(1);
check('deleted', service.get(1), null);
check('all-after-delete', service.all().length, 1);

console.log('REPOSITORY_JS PASS ' + passed + '/' + total);
