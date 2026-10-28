const fs = require('fs');
const { ApiController } = require('./apiController');

function build() {
  const tokens = { 't-alice': 'alice', 't-bob': 'bob' };
  const controller = new ApiController(token => tokens[token] ?? null);
  controller.register({ name: 'ping', requireCredential: false, execute: () => 'pong' });
  controller.register({ name: 'notes/create', requireCredential: true, execute: (body, user) => `created ${body} by ${user}` });
  controller.register({ name: 'i', requireCredential: true, execute: (body, user) => user });
  return controller;
}

function run(text) {
  const controller = build();
  const out = [];
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    const response = controller.handle(parts[1], parts[2], parts.slice(3).join(' '));
    out.push(`${response.status} ${response.text}`);
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
