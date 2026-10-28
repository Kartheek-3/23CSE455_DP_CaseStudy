import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { InputFormatError, TestEngine, report } from '../src/template.js';

const data = (name) => fileURLToPath(new URL(`../../test-data/${name}`, import.meta.url));

test('report matches expected-output.txt', () => {
  assert.equal(report(data('tests.txt')), readFileSync(data('expected-output.txt'), 'utf8'));
});

test('a new engine gets the whole skeleton from one primitive', () => {
  class AlwaysPass extends TestEngine {
    name() {
      return 'always-pass';
    }

    runTest() {
      return 'PASS';
    }
  }
  assert.deepEqual(new AlwaysPass().execute([['a', 'FAIL']]),
    ['always-pass: start (1 tests)', '  run a -> PASS', 'always-pass: done 1 passed, 0 failed']);
});

test('invalid input is rejected with expected-error.txt', () => {
  const expected = readFileSync(data('expected-error.txt'), 'utf8').trim();
  assert.throws(() => report(data('invalid-tests.txt')), (error) => {
    assert.ok(error instanceof InputFormatError);
    assert.equal(error.message, expected);
    return true;
  });
});
