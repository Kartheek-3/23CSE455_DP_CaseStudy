'use strict';
// Test runner for user_role.js (reads the shared CSV).
const fs = require('fs');
const { Session, User, Role } = require('./user_role.js');

const CSV_PATH = '../../test-cases/user_role_cases.csv';
const NUMBER = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;

const tokens = (text) => text.split(/[\s|;=,()]+/).filter((t) => t !== '');

function same(expected, actual) {
  const a = tokens(expected);
  const b = tokens(actual);
  if (a.length !== b.length) return false;
  return a.every((x, i) => {
    const y = b[i];
    if (NUMBER.test(x) && NUMBER.test(y)) return Math.abs(Number(x) - Number(y)) <= 1e-9;
    return x === y;
  });
}

function runCase(c) {
  const session = new Session();
  const users = {};
  return c.operations.split('|').map((operation) => {
    const [name, ...p] = operation.split(':');
    if (name === 'user') {
      const user = new User(session, p[0], p[1]);
      users[p[0]] = user;
      user.setPassword(p[2]);
      return user.save() !== null ? 'saved' : 'None';
    }
    if (name === 'role') return new Role(session, p[0] === '!' ? null : p[0]).save() !== null ? 'saved' : 'None';
    if (name === 'delete_user' || name === 'delete_new') {
      const user = name === 'delete_user' ? users[p[0]] : new User(session, p[0], `${p[0]}@new`);
      const logSize = session.log.length;
      user.delete();
      return session.log.length > logSize ? 'error_logged' : 'deleted';
    }
    if (name === 'check') {
      const user = users[p[0]];
      return User.checkPassword(p[1], user.passwordHash) === user.passwordHash ? 'match' : 'no_match';
    }
    if (name === 'check_hash') return User.checkPassword(p[0], p[1]);
    if (name === 'count_users') return String(session.count(User));
    return String(session.count(Role));
  }).join('|');
}

function main() {
  const lines = fs.readFileSync(CSV_PATH, 'utf8').split('\n')
    .map((l) => l.replace(/\r$/, '')).filter((l) => l.trim() !== '');
  const header = lines[0].split(',');
  let passed = 0;
  let total = 0;
  for (const line of lines.slice(1)) {
    const fields = line.split(',');
    const c = {};
    header.forEach((h, i) => { c[h] = fields[i]; });
    total += 1;
    let actual;
    let raised = false;
    try {
      actual = runCase(c);
    } catch (err) {
      actual = `${err.name}: ${err.message}`;
      raised = true;
    }
    const ok = c.expected === 'ERROR' ? raised : (!raised && same(c.expected, actual));
    if (ok) passed += 1;
    else console.log(`FAIL ${c.case_id}: expected ${c.expected}, got ${raised ? 'ERROR ' : ''}${actual}`);
  }
  console.log(`Active Record tests: ${passed}/${total} passed`);
  process.exit(passed === total ? 0 : 1);
}

main();
