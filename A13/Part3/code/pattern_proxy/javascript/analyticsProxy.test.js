const fs = require('fs');
const { AnalyticsProxy, RealAnalytics } = require('./analyticsProxy');

function run(text) {
  const proxy = new AnalyticsProxy();
  const out = [];
  for (const command of text.split(';')) {
    const [verb, arg] = command.split(' ');
    try {
      if (verb === 'set') proxy.setAnalytics(new RealAnalytics());
      else out.push(proxy[verb](arg));
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
