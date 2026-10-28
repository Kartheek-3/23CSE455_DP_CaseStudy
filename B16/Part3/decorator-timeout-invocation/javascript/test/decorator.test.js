import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { InputFormatError, LoggingInvocation, TestInvocation, TimeoutInvocation, report } from '../src/decorator.js';

const data = (name) => fileURLToPath(new URL(`../../test-data/${name}`, import.meta.url));

test('report matches expected-output.txt', () => {
  assert.equal(report(data('invocations.txt')), readFileSync(data('expected-output.txt'), 'utf8'));
});

test('decorators stack in any order', () => {
  const log = [];
  // Logging inside the timeout sees the raw outcome; the timeout still decides the final result.
  const result = new TimeoutInvocation(new LoggingInvocation(new TestInvocation('div', 250, 'PASS'), log), 100).proceed();
  assert.deepEqual(log, ['[log] calling div', '[log] div -> PASS']);
  assert.equal(result, 'TIMEOUT (250 ms > 100 ms limit)');
});

test('invalid input is rejected with expected-error.txt', () => {
  const expected = readFileSync(data('expected-error.txt'), 'utf8').trim();
  assert.throws(() => report(data('invalid-invocations.txt')), (error) => {
    assert.ok(error instanceof InputFormatError);
    assert.equal(error.message, expected);
    return true;
  });
});
