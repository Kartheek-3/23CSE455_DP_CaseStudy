import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { InputFormatError, TestSelector, parse, report } from '../src/strategy.js';

const data = (name) => fileURLToPath(new URL(`../../test-data/${name}`, import.meta.url));

test('report matches expected-output.txt', () => {
  assert.equal(report(data('tests.txt')), readFileSync(data('expected-output.txt'), 'utf8'));
});

test('a new strategy plugs in without changing the selector', () => {
  const singleTag = { includes: (test) => test.tags.length === 1 }; // any object with includes() works
  const tests = parse(readFileSync(data('tests.txt'), 'utf8').split(/\r?\n/));
  assert.deepEqual(new TestSelector(singleTag).select(tests).map((t) => t.name),
    ['CalcTests#add', 'CalcTests#sub', 'StringTests#concat', 'StringTests#upper', 'SlowTests#bigSum']);
});

test('invalid input is rejected with expected-error.txt', () => {
  const expected = readFileSync(data('expected-error.txt'), 'utf8').trim();
  assert.throws(() => report(data('invalid-tests.txt')), (error) => {
    assert.ok(error instanceof InputFormatError);
    assert.equal(error.message, expected);
    return true;
  });
});
