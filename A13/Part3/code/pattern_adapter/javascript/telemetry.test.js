const fs = require('fs');
const { SentryTelemetryAdapter, TelemetryRegistry } = require('./telemetry');

class FakeSentry {
  constructor(log) { this.log = log; }
  captureMessage(message, options) {
    const user = options['user.id'] != null ? `,user.id=${options['user.id']}` : '';
    this.log.push(`sentry.captureMessage(${message},level=${options.level}${user})`);
  }
  startSpan(options, fn) { this.log.push(`sentry.startSpan(${options.name})`); return fn(); }
  close(timeout) { this.log.push(`sentry.close(${timeout})`); }
}

function run(text) {
  const log = [];
  let registry = null;
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    if (parts[0] === 'adapters') {
      registry = new TelemetryRegistry(Array.from({ length: Number(parts[1]) }, () => new SentryTelemetryAdapter(new FakeSentry(log))));
    } else if (parts[0] === 'msg') {
      registry.captureMessage(parts.slice(2).join(' '), parts[1] === '-' ? null : parts[1]);
    } else if (parts[0] === 'span') {
      const value = parts[2];
      try {
        log.push('result=' + registry.startSpan(parts[1], () => {
          if (value.startsWith('!')) throw new Error(value.slice(1));
          return value;
        }));
      } catch (e) {
        log.push('ERR:' + e.message);
      }
    } else if (parts[0] === 'shutdown') {
      registry.shutdown();
    }
  }
  return log.join('~');
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
