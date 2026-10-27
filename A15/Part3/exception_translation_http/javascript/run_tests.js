const fs = require('fs');
const { AccountService, translate } = require('./snippet');

function execute(script) {
  const svc = new AccountService();
  const t = script.trim().split(/\s+/);
  if (t[0] === 'deposit') return translate(() => svc.deposit(parseFloat(t[1])));
  if (t[0] === 'find') return translate(() => svc.find(parseInt(t[1], 10)));
  return translate(() => svc.boom());
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
