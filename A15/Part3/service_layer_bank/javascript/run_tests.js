const fs = require('fs');
const { BankService, UserRepo, AccountRepo, NoUser, NotFound } = require('./snippet');

function execute(script) {
  const svc = new BankService(new UserRepo(), new AccountRepo());
  let out = '';
  for (const cmd of script.split(';')) {
    const t = cmd.trim().split(/\s+/);
    try {
      if (t[0] === 'user') { svc.createUser(parseInt(t[1], 10)); out = 'ok'; }
      else if (t[0] === 'open') out = String(svc.openAccount(parseInt(t[1], 10), parseFloat(t[2])));
      else out = svc.balance(parseInt(t[1], 10)).toFixed(2);
    } catch (e) {
      if (e instanceof NoUser) out = 'NO_USER';
      else if (e instanceof NotFound) out = 'NOT_FOUND';
      else throw e;
    }
  }
  return out;
}

let passed = 0, total = 0;
for (const line of fs.readFileSync(process.argv[2], 'utf8').split('\n')) {
  if (!line.trim() || line.startsWith('#')) continue;
  const i = line.indexOf(' => ');
  const script = line.slice(0, i), expected = line.slice(i + 4);
  total += 1;
  const got = execute(script);
  if (got === expected) { passed += 1; console.log('PASS case' + total); }
  else console.log(`FAIL case${total} expected=${expected} got=${got}`);
}
console.log(`RESULT passed=${passed} total=${total}`);
process.exit(passed === total ? 0 : 1);
