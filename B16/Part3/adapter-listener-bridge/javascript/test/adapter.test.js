import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { InputFormatError, ListenerAdapter, report } from '../src/adapter.js';

const data = (name) => fileURLToPath(new URL(`../../test-data/${name}`, import.meta.url));

test('report matches expected-output.txt', () => {
  assert.equal(report(data('events.txt')), readFileSync(data('expected-output.txt'), 'utf8'));
});

test('the adapter converts engine calls into client calls', () => {
  const received = [];
  new ListenerAdapter({ testFinished: (identifier, status) => received.push([identifier.displayName, identifier.isTest, identifier.parentName, status]) })
    .executionFinished('[engine:e]/[class:CalcTests]/[method:add]', 'FAILED');
  assert.deepEqual(received, [['add', true, 'CalcTests', 'FAILED']]);
});

test('invalid input is rejected with expected-error.txt', () => {
  const expected = readFileSync(data('expected-error.txt'), 'utf8').trim();
  assert.throws(() => report(data('invalid-events.txt')), (error) => {
    assert.ok(error instanceof InputFormatError);
    assert.equal(error.message, expected);
    return true;
  });
});
