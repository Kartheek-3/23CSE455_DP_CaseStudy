const fs = require('fs');
const { AccountService, InMemoryAccountDao, NotFound } = require('./snippet');

function execute(script) {
  const svc = new AccountService(new InMemoryAccountDao());
  let out = '';
  for (const cmd of script.split(';')) {
    const t = cmd.trim().split(/\s+/);
    try {
      if (t[0] === 'save') out = String(svc.open(parseFloat(t[1])));
      else if (t[0] === 'find') out = svc.balanceOf(parseInt(t[1], 10)).toFixed(2);
      else out = svc.balances().map((b) => b.toFixed(2)).join(',') || '-';
    } catch (e) {
      if (!(e instanceof NotFound)) throw e;
      out = 'NOT_FOUND';
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
