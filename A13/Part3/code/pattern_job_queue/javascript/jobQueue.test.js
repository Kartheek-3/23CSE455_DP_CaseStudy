const fs = require('fs');
const { JobQueue, DeliverService, DeliverProcessor } = require('./jobQueue');

class FakeTransport {
  constructor() { this.tried = new Set(); }
  send(url) {
    const host = url.split('/')[2];
    if (host.endsWith('.down')) throw new Error('unreachable');
    if (host.endsWith('.flaky') && !this.tried.has(url)) {
      this.tried.add(url);
      throw new Error('timeout');
    }
  }
}

function run(text) {
  const queue = new JobQueue();
  const blocked = new Set();
  const service = new DeliverService(queue);
  const processor = new DeliverProcessor(blocked, new FakeTransport());
  const out = [];
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    if (parts[0] === 'add') service.deliver(parts[1], parts.slice(2).join(' '));
    else if (parts[0] === 'block') blocked.add(parts[1]);
    else if (parts[0] === 'run') {
      for (const r of queue.run(job => processor.process(job))) out.push(`${r.id}:${r.label}:${r.result}@${r.attempts}`);
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
