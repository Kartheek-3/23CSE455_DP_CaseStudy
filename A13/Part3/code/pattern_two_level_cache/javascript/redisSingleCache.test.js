const fs = require('fs');
const { RedisSingleCache } = require('./redisSingleCache');

class FakeRedis {
  constructor() { this.data = new Map(); this.reads = 0; }
  get(key) { this.reads++; return this.data.get(key); }
  set(key, value) { this.data.set(key, value); }
  delete(key) { this.data.delete(key); }
}

function run(text) {
  const redis = new FakeRedis();
  let now = 0;
  let calls = 0;
  const fetcher = () => `v${++calls}`;
  const newCache = () => new RedisSingleCache(redis, 'demo', 100, fetcher, () => now);
  const answered = (action) => {
    const reads = redis.reads, fetched = calls;
    const value = action();
    if (value === undefined) return 'none';
    const level = calls > fetched ? 'fetcher' : redis.reads > reads ? 'L2' : 'L1';
    return `${value}@${level}`;
  };
  let cache = newCache();
  const out = [];
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    if (parts[0] === 'fetch') out.push(answered(() => cache.fetch()));
    else if (parts[0] === 'get') out.push(answered(() => cache.get()));
    else if (parts[0] === 'delete') cache.delete();
    else if (parts[0] === 'tick') now += Number(parts[1]);
    else if (parts[0] === 'newproc') cache = newCache();
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
