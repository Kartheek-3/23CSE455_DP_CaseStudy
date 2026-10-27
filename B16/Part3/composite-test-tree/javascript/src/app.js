// Reads the tree, removes the tests with one tag, prunes empty containers and builds the output.

import { readFileSync } from 'node:fs';
import { parse } from './tree-parser.js';

const listed = (names) => `(${names.length}): ${names.length > 0 ? names.join(', ') : 'none'}`;

export function report(treePath, tag) {
  const root = parse(readFileSync(treePath, 'utf8').split(/\r?\n/));
  let out = '== Tree as read ==\n' + root.render();

  const before = root.countTests();
  const removed = [];
  const pruned = [];
  root.removeTestsTagged(tag, removed);
  root.pruneEmpty(pruned);

  out += `== Remove tests tagged @${tag} ==\n`;
  out += `tests before: ${before}\n`;
  out += `removed ${listed(removed)}\n`;
  out += `pruned ${listed(pruned)}\n`;
  out += `tests after: ${root.countTests()}\n`;
  return out + '== Tree after ==\n' + root.render();
}
