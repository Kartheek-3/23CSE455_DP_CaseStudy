const fs = require('fs');
const { Account, PolicyResolver, NoPolicy } = require('./snippet');

function execute(script) {
  const [kind, op, balance, amount] = script.trim().split(/\s+/);
  let account;
  try { account = new Account(parseFloat(balance), new PolicyResolver().forType(kind)); }
  catch (e) { if (e instanceof NoPolicy) return 'NO_POLICY'; throw e; }
  if (op === 'deposit') { account.deposit(parseFloat(amount)); return account.balance.toFixed(2); }
  return account.withdraw(parseFloat(amount)) ? 'ALLOWED' : 'DENIED';
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
