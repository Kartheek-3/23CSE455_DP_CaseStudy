const fs = require('fs');
const { Bank, BadRequest, NotFound } = require('./snippet');

function execute(script) {
  const bank = new Bank();
  let out = '';
  for (const cmd of script.split(';')) {
    const t = cmd.trim().split(/\s+/);
    try {
      if (t[0] === 'open') out = String(bank.open(t[1], parseFloat(t[2])));
      else if (t[0] === 'deposit') out = bank.deposit(parseInt(t[1], 10), parseFloat(t[2])).toFixed(2);
      else if (t[0] === 'withdraw') out = bank.withdraw(parseInt(t[1], 10), parseFloat(t[2])).toFixed(2);
      else if (t[0] === 'transfer') { bank.transfer(parseInt(t[1], 10), parseInt(t[2], 10), parseFloat(t[3])); out = 'OK'; }
      else out = bank.balance(parseInt(t[1], 10)).toFixed(2);
    } catch (e) {
      if (e instanceof BadRequest) out = 'BAD_REQUEST';
      else if (e instanceof NotFound) out = 'NOT_FOUND';
      else throw e;
    }
  }
  return out;
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
