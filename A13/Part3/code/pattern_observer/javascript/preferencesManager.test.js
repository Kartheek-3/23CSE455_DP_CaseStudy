const fs = require('fs');
const { PreferencesManager } = require('./preferencesManager');

function run(text) {
  const manager = new PreferencesManager();
  const out = [];
  const listeners = {};
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    try {
      if (parts[0] === 'on') {
        const name = parts[1];
        listeners[name] = (event) => {
          if (name === 'boom') throw new Error('listener failed');
          out.push(`${name}:${event.key}=${event.value}(oldValue=${event.oldValue})`);
        };
        manager.on('committed', listeners[name]);
      } else if (parts[0] === 'off') {
        manager.off('committed', listeners[parts[1]] ?? (() => {})); // EventEmitter rejects undefined, so pass a function that was never registered
      } else if (parts[0] === 'commit') {
        manager.commit(parts[1], parts[2]);
      }
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
