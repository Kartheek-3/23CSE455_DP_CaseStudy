const fs = require('fs');
const { AccountController } = require('./snippet');

class Recorder {                                // test double standing in for the service layer
  constructor() { this.log = []; }
  create(u, k, b) { this.log.push(`create(${u},${k},${b.toFixed(2)})`); }
  deposit(a, m) { this.log.push(`deposit(${a},${m.toFixed(2)})`); }
  withdraw(a, m) { this.log.push(`withdraw(${a},${m.toFixed(2)})`); }
  listAll() { this.log.push('list()'); return [1, 2, 3]; }
}

function execute(script) {
  const rec = new Recorder(), ctl = new AccountController(rec);
  const t = script.trim().split(/\s+/);
  let r;
  if (t[0] === 'create') r = ctl.create(parseInt(t[1], 10), t[2], parseFloat(t[3]));
  else if (t[0] === 'deposit') r = ctl.deposit(parseInt(t[1], 10), parseFloat(t[2]));
  else if (t[0] === 'withdraw') r = ctl.withdraw(parseInt(t[1], 10), parseFloat(t[2]));
  else r = ctl.list();
  return rec.log.join(',') + '|' + r.status + ' ' + r.message;
}

let passed = 0, total = 0;
for (const line of fs.readFileSync(process.argv[2], "utf8").split("\n")) {
  if (!line.trim() || line.startsWith("#")) continue;
  const i = line.indexOf(" => ");
  const script = line.slice(0, i), expected = line.slice(i + 4);
  total += 1;
  const got = execute(script);
  if (got === expected) { passed += 1; console.log("PASS case" + total); }
  else console.log(`FAIL case${total} expected=${expected} got=${got}`);
}
console.log(`RESULT passed=${passed} total=${total}`);
process.exit(passed === total ? 0 : 1);
