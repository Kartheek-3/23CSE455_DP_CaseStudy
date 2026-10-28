import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { report } from '../src/app.js';
import { BrokenListener, CompositeTestExecutionListener } from '../src/listeners.js';
import { EventFormatError } from '../src/runner.js';

const data = (name) => fileURLToPath(new URL(`../../test-data/${name}`, import.meta.url));

test('report matches expected-output.txt', () => {
  assert.equal(report(data('events.txt')), readFileSync(data('expected-output.txt'), 'utf8'));
});

test('a throwing listener does not stop the next one', () => {
  const seen = [];
  const listeners = new CompositeTestExecutionListener();
  listeners.register(new BrokenListener());
  listeners.register({ executionStarted: (testId) => seen.push(testId) }); // plain object works too
  listeners.executionStarted('T#a');
  assert.deepEqual(seen, ['T#a']);
  assert.equal(listeners.failures.length, 1);
});

test('invalid input is rejected with expected-error.txt', () => {
  const expected = readFileSync(data('expected-error.txt'), 'utf8').trim();
  assert.throws(() => report(data('invalid-events.txt')), (error) => {
    assert.ok(error instanceof EventFormatError);
    assert.equal(error.message, expected);
    return true;
  });
});
