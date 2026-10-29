// Builds the tree from an indented text file (two spaces per level).

import { TestCase, TestContainer } from './nodes.js';

const KINDS = new Set(['engine', 'class', 'test']);

export class TreeFormatError extends Error {
  constructor(message, lineNumber) {
    super(lineNumber === undefined ? message : `line ${lineNumber}: ${message}`);
    this.name = 'TreeFormatError';
  }
}

export function parse(lines) {
  let root = null;
  let path = []; // path[d] is the last node seen at depth d

  lines.forEach((line, i) => {
    const lineNumber = i + 1;
    const fail = (message) => { throw new TreeFormatError(message, lineNumber); };
    const text = line.trim();
    if (text === '' || text.startsWith('#')) return;

    const indent = line.length - line.replace(/^ +/, '').length;
    if (indent % 2 !== 0) fail('indentation must be a multiple of 2 spaces');
    const [kind, name, ...tagFields] = text.split(/\s+/);
    if (!KINDS.has(kind)) fail(`unknown kind '${kind}'`);
    if (name === undefined) fail('missing name');
    if (tagFields.some((field) => !field.startsWith('@') || field === '@')) fail('tags must look like @name');
    const tags = tagFields.map((field) => field.slice(1));
    if (tags.length > 0 && kind !== 'test') fail('only tests can have tags');

    const depth = indent / 2;
    if (root === null) {
      if (depth !== 0 || kind !== 'engine') fail('the first node must be an engine at the top level');
      root = new TestContainer(kind, name);
      path = [root];
      return;
    }
    if (depth === 0 || kind === 'engine') fail('only one engine is allowed, at the top level');
    if (depth > path.length) fail('indented too far');
    const parent = path[depth - 1];
    if (!(parent instanceof TestContainer)) fail('a test cannot have children');
    const node = kind === 'test' ? new TestCase(name, tags) : new TestContainer(kind, name);
    parent.addChild(node);
    path = [...path.slice(0, depth), node];
  });

  if (root === null) throw new TreeFormatError('no engine found');
  return root;
}
