const fs = require('fs');
const { User, UserDto, UserAssembler } = require('./snippet');

function execute(script) {
  const [cmd, name, age, phone, address] = script.trim().split(/\s+/);
  const asm = new UserAssembler();
  if (cmd === 'toDto') return asm.toDto(new User(7, name, parseInt(age, 10), phone, address)).text();
  const dto = new UserDto(name, parseInt(age, 10), phone, address);
  if (cmd === 'toEntity') return asm.toEntity(dto).text();
  return asm.toDto(asm.toEntity(dto)).text();
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
