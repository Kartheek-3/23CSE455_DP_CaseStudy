const fs = require('fs');
const { FederatedInstanceService, InMemoryInstanceRepository, KeyValueCache } = require('./federatedInstanceService');

function run(text) {
  const repo = new InMemoryInstanceRepository();
  const cache = new KeyValueCache();
  const service = new FederatedInstanceService(repo, cache);
  const out = [];
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    if (parts[0] === 'dropcache') {
      cache.dispose();
      continue;
    }
    const finds = repo.finds, inserts = repo.inserts;
    const result = parts[0] === 'fetch' ? service.fetchOrRegister(parts[1]) : service.lookup(parts[1]);
    const source = repo.inserts > inserts ? 'insert' : repo.finds > finds ? 'db' : 'cache';
    out.push((result == null ? 'none' : `${result.host}#${result.id}`) + '@' + source);
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
