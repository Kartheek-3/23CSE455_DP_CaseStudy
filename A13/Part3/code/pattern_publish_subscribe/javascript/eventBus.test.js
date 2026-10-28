const fs = require('fs');
const { Broker, GlobalEventService } = require('./eventBus');

function run(text) {
  const broker = new Broker();
  const events = new GlobalEventService(broker);
  const out = [];
  const handlers = new Map();
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    const rest = (n) => parts.slice(n).join(' ');
    if (parts[0] === 'sub') {
      const key = parts[1] + ' ' + parts[2];
      if (!handlers.has(key)) handlers.set(key, (channel, message) => out.push(`${parts[1]}<-${channel}:${message}`));
      broker.subscribe(parts[2], handlers.get(key));
    } else if (parts[0] === 'unsub') {
      broker.unsubscribe(parts[2], handlers.get(parts[1] + ' ' + parts[2]));
    } else if (parts[0] === 'main') {
      if (events.publishMainStream(parts[1], parts[2], rest(3)) === 0) out.push('dropped:mainStream:' + parts[1]);
    } else if (parts[0] === 'broadcast') {
      if (events.publishBroadcastStream(parts[1], rest(2)) === 0) out.push('dropped:broadcast');
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
