import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { report } from '../src/app.js';
import { TestCase, TestContainer } from '../src/nodes.js';
import { TreeFormatError } from '../src/tree-parser.js';

const data = (name) => fileURLToPath(new URL(`../../test-data/${name}`, import.meta.url));

test("report for tag 'slow' matches expected-output.txt", () => {
  assert.equal(report(data('tree.txt'), 'slow'), readFileSync(data('expected-output.txt'), 'utf8'));
});

test('a leaf and a container answer countTests the same way', () => {
  const engine = new TestContainer('engine', 'e');
  const cls = new TestContainer('class', 'C');
  cls.addChild(new TestCase('a'));
  cls.addChild(new TestCase('b', ['x']));
  engine.addChild(cls);
  assert.deepEqual([new TestCase('t'), cls, engine].map((node) => node.countTests()), [1, 2, 2]);
});

test('invalid input is rejected with expected-error.txt', () => {
  const expected = readFileSync(data('expected-error.txt'), 'utf8').trim();
  assert.throws(() => report(data('invalid-tree.txt'), 'slow'), (error) => {
    assert.ok(error instanceof TreeFormatError);
    assert.equal(error.message, expected);
    return true;
  });
});
