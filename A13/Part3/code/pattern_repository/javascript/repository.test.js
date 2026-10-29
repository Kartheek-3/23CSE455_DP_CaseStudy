const fs = require('fs');
const { InMemoryRepository, miRepository, extend, UserService } = require('./repository');

function show(entity) {
  return '{' + Object.keys(entity).sort().map(k => `${k}=${entity[k]}`).join(',') + '}';
}

function run(text) {
  const service = new UserService(extend(new InMemoryRepository(), miRepository));
  const out = [];
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    try {
      if (parts[0] === 'insert') out.push(show(service.register(parts[1])));
      else if (parts[0] === 'find') {
        const found = service.findByName(parts[1]);
        out.push(found === null ? 'none' : show(found));
      } else if (parts[0] === 'findorfail') out.push(show(service.getByName(parts[1])));
      else if (parts[0] === 'count') out.push(String(service.count()));
    } catch (e) {
      out.push('ERR:' + e.message);
    }
  }
  return out.join('~');
}

let passed = 0;
const cases = fs.readFileSync(process.argv[2], 'utf8').split('\n')
  .filter(l => l.trim() && !l.startsWith('#'))
  .map(l => { const i = l.indexOf('|'), j = l.indexOf('|', i + 1); return [l.slice(0, i), l.slice(i + 1, j), l.slice(j + 1)]; });
for (const [name, text, expected] of cases) {
  const got = run(text);
  const ok = got === expected;
  if (ok) passed++;
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok ? '' : `: expected [${expected}] got [${got}]`));
}
console.log(`passed ${passed}/${cases.length}`);
process.exit(passed === cases.length ? 0 : 1);
