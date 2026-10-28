import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { InputFormatError, NOOP, TestRunner, report } from '../src/nullobject.js';

const data = (name) => fileURLToPath(new URL(`../../test-data/${name}`, import.meta.url));

test('report matches expected-output.txt', () => {
  assert.equal(report(data('tests.txt')), readFileSync(data('expected-output.txt'), 'utf8'));
});

test('a runner without listener uses the null object', () => {
  const runner = new TestRunner();
  assert.equal(runner.listener, NOOP);
  assert.equal(runner.run([['a', 'PASS'], ['b', 'FAIL']]), 'result: 1 passed, 1 failed');
});

test('invalid input is rejected with expected-error.txt', () => {
  const expected = readFileSync(data('expected-error.txt'), 'utf8').trim();
  assert.throws(() => report(data('invalid-tests.txt')), (error) => {
    assert.ok(error instanceof InputFormatError);
    assert.equal(error.message, expected);
    return true;
  });
});
