import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { InputFormatError, RunTestCommand, TaskExecutor, report } from '../src/command.js';

const data = (name) => fileURLToPath(new URL(`../../test-data/${name}`, import.meta.url));

test('report matches expected-output.txt', () => {
  assert.equal(report(data('tasks.txt')), readFileSync(data('expected-output.txt'), 'utf8'));
});

test('commands run only when the invoker runs them', () => {
  const executor = new TaskExecutor();
  executor.submit(new RunTestCommand('a', 'PASS'));
  assert.deepEqual(executor.results, []); // queued, not executed yet
  assert.deepEqual(executor.runAll(), ['#1 test a -> PASS']);
  assert.deepEqual(executor.results, ['PASS']);
});

test('invalid input is rejected with expected-error.txt', () => {
  const expected = readFileSync(data('expected-error.txt'), 'utf8').trim();
  assert.throws(() => report(data('invalid-tasks.txt')), (error) => {
    assert.ok(error instanceof InputFormatError);
    assert.equal(error.message, expected);
    return true;
  });
});
