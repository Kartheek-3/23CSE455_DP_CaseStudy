const fs = require('fs');
const { Container, Service, RealDao, FakeDao, MissingDependency } = require('./snippet');

function execute(script) {
  const c = new Container();
  c.register('Service', new Service());
  let out = '';
  for (const cmd of script.split(';')) {
    const t = cmd.trim().split(/\s+/);
    try {
      if (t[0] === 'register') { c.register('Dao', t[1] === 'real' ? new RealDao() : new FakeDao()); out = 'registered'; }
      else if (t[0] === 'wire') { c.wire(); out = 'wired'; }
      else out = c.get('Service').describe();
    } catch (e) {
      if (e instanceof MissingDependency) out = 'MISSING:' + e.message;
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
