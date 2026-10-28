const fs = require('fs');
const { AnnouncementService, AnnouncementRepository } = require('./announcementService');

function run(text) {
  const out = [];
  const events = {
    publishMainStream: (userId, type) => out.push(`event:main:${userId} ${type}`),
    publishBroadcastStream: (type) => out.push('event:broadcast ' + type),
  };
  const moderationLog = { log: (moderator, kind) => out.push('modlog:' + kind) };
  const repo = new AnnouncementRepository();
  const service = new AnnouncementService(repo, events, moderationLog);
  for (const command of text.split(';')) {
    const parts = command.split(' ');
    if (parts[0] === 'create') {
      const start = out.length;
      const created = service.create(parts.slice(3).join(' '), parts[1] === '-' ? null : parts[1], parts[2] === 'mod' ? 'admin' : null);
      out.splice(start, 0, `created#${created.id}`);
    } else if (parts[0] === 'read') {
      const target = repo.find(Number(parts[2]));
      const wasActive = target !== null && target.isActive;
      service.read(parts[1], Number(parts[2]));
      if (wasActive && !target.isActive) out.push(`deactivated#${target.id}`);
    } else if (parts[0] === 'get') {
      try {
        const { announcement, read } = service.get(Number(parts[1]), parts[2] === '-' ? null : parts[2]);
        out.push(`announcement#${announcement.id} title=${announcement.title}` + (read === null ? '' : ` read=${read}`));
      } catch (e) {
        out.push('ERR:' + e.message);
      }
    } else if (parts[0] === 'unread') {
      out.push('unread:' + (service.unread(parts[1]).map(a => a.id).join(',') || 'none'));
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
