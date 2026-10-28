import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { run } from './implementation.mjs';

const fixtures = resolve(fileURLToPath(new URL('.', import.meta.url)), '../fixtures.json');
const cases = JSON.parse(readFileSync(fixtures, 'utf8'));

for (const fixture of cases) {
  test(fixture.name, () => {
    const before = JSON.stringify(fixture.input);
    assert.deepStrictEqual(run(fixture.input), fixture.expected);
    assert.equal(JSON.stringify(fixture.input), before, 'input must not change');
  });
}
