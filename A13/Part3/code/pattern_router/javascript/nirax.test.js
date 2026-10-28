const fs = require('fs');
const { Router } = require('./nirax');

const ROUTES = [
  { path: '/', component: 'home', loginRequired: false },
  { path: '/notes/:id', component: 'note-detail', loginRequired: false },
  { path: '/settings', component: 'settings', loginRequired: true },
  { path: '/search', component: 'search', loginRequired: false },
];

function describe(res) {
  let text = res.component;
  for (const key of Object.keys(res.params).sort()) text += ` ${key}=${res.params[key]}`;
  if (res.query) text += ' query=' + res.query;
  if (res.hash) text += ' hash=' + res.hash;
  return text + (res.popup ? ' popup' : '');
}

function run(text) {
  let loggedIn = false, router = null, changes = 0;
  const out = [];
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    if (parts[0] === 'login') {
      loggedIn = parts[1] === 'on';
    } else if (parts[0] === 'nav') {
      if (router === null) {
        router = new Router(ROUTES, loggedIn, 'notfound');
        router.onChange(() => { changes++; });
      }
      out.push(describe(router.navigate(parts[1])));
    }
  }
  out.push('changes=' + changes);
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
