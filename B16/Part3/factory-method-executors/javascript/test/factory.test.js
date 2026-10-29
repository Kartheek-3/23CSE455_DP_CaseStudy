import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { InputFormatError, PooledExecutor, TestEngine, report } from '../src/factory.js';

const data = (name) => fileURLToPath(new URL(`../../test-data/${name}`, import.meta.url));

test('report matches expected-output.txt', () => {
  assert.equal(report(data('tests.txt')), readFileSync(data('expected-output.txt'), 'utf8'));
});

test('a subclass changes only the created product', () => {
  class ThreeWorkerEngine extends TestEngine {
    name() {
      return 'three';
    }

    createExecutor() {
      return new PooledExecutor(3);
    }
  }
  assert.deepEqual(new ThreeWorkerEngine().execute([['a', 'PASS'], ['b', 'PASS'], ['c', 'PASS'], ['d', 'FAIL']]),
    ['== three ==', 'executor: pool of 3 workers', '[worker-1] a -> PASS', '[worker-2] b -> PASS', '[worker-3] c -> PASS', '[worker-1] d -> FAIL']);
});

test('invalid input is rejected with expected-error.txt', () => {
  const expected = readFileSync(data('expected-error.txt'), 'utf8').trim();
  assert.throws(() => report(data('invalid-tests.txt')), (error) => {
    assert.ok(error instanceof InputFormatError);
    assert.equal(error.message, expected);
    return true;
  });
});
