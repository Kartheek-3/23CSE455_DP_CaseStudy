import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { DisabledInterceptor, InputFormatError, Invocation, LoggingInterceptor, report, runChain } from '../src/chain.js';

const data = (name) => fileURLToPath(new URL(`../../test-data/${name}`, import.meta.url));

test('report matches expected-output.txt', () => {
  assert.equal(report(data('invocations.txt')), readFileSync(data('expected-output.txt'), 'utf8'));
});

test('a handler can stop the chain before later links', () => {
  const invocation = new Invocation('div', 10, 'PASS', true);
  assert.equal(runChain([new DisabledInterceptor(), new LoggingInterceptor()], invocation), 'SKIPPED (disabled)');
  assert.deepEqual(invocation.trace, ['disabled']);
});

test('invalid input is rejected with expected-error.txt', () => {
  const expected = readFileSync(data('expected-error.txt'), 'utf8').trim();
  assert.throws(() => report(data('invalid-invocations.txt')), (error) => {
    assert.ok(error instanceof InputFormatError);
    assert.equal(error.message, expected);
    return true;
  });
});
