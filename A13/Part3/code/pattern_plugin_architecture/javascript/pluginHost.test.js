const fs = require('fs');
const { PluginHost } = require('./pluginHost');

function pluginSetup(name) {
  return (addHandler) => {
    if (name === 'upper') addHandler('note_view_interruptor', t => t.toUpperCase());
    else if (name === 'exclaim') addHandler('note_view_interruptor', t => t + '!');
    else if (name === 'share') addHandler('note_action', () => 'Share');
    else if (name === 'bad') {
      addHandler('note_view_interruptor', t => t + '?');
      throw new Error('boom');
    }
  };
}

function run(text) {
  const host = new PluginHost();
  const out = [];
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    try {
      if (parts[0] === 'install') {
        host.install(parts[1], pluginSetup(parts[1]));
      } else if (parts[0] === 'abort') {
        host.abort(parts[1]);
      } else if (parts[0] === 'view') {
        out.push(host.getHandlers('note_view_interruptor').reduce((value, fn) => fn(value), parts[1]));
      } else if (parts[0] === 'actions') {
        out.push(host.getHandlers('note_action').map(fn => fn('')).join(','));
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
