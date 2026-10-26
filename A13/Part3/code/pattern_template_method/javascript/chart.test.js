const fs = require('fs');
const { Chart, UsersChart, NotesChart } = require('./chart');

class FaultyChart extends Chart {
  tickMajor() { throw new Error('source unavailable'); }
  tickMinor() { return {}; }
}

function run(text) {
  const [name, kind] = text.split(' ');
  const chart = { users: new UsersChart(), notes: new NotesChart(), faulty: new FaultyChart() }[name];
  try {
    const columns = chart.tick(kind === 'major');
    return Object.keys(columns).sort().map(k => `${k}=${columns[k]}`).join(',') || 'none';
  } catch (e) {
    return 'ERR:' + e.message;
  }
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
