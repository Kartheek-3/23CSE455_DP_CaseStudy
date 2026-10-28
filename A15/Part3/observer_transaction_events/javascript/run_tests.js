const fs = require('fs');
const { AccountService, AuditLog, EventPublisher, HighValueAlert, BadRequest } = require('./snippet');

function execute(script) {
  const publisher = new EventPublisher(), audit = new AuditLog(), alert = new HighValueAlert();
  publisher.subscribe(audit);
  publisher.subscribe(alert);
  const svc = new AccountService(publisher);
  let out = '';
  for (const cmd of script.split(';')) {
    const t = cmd.trim().split(/\s+/);
    try {
      if (t[0] === 'deposit') { svc.deposit(parseInt(t[1], 10), parseFloat(t[2])); out = 'ok'; }
      else if (t[0] === 'withdraw') { svc.withdraw(parseInt(t[1], 10), parseFloat(t[2])); out = 'ok'; }
      else if (t[0] === 'audit') out = audit.text(parseInt(t[1], 10));
      else out = alert.text();
    } catch (e) {
      if (e instanceof BadRequest) out = 'BAD_REQUEST'; else throw e;
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
