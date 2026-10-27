'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { QuoteEvaluator } = require('./main');
const dir = path.resolve(__dirname, '../../common_specs');
function lines(file) {
  return fs.readFileSync(path.join(dir, file), 'utf8').trimEnd().split(/\r?\n/).slice(1);
}
const cases = lines('strategy_cases.tsv');
const expected = lines('strategy_expected.tsv');
const evaluator = new QuoteEvaluator();
let passed = 0;
for (let i = 0; i < cases.length; i++) {
  const [id, code, seconds, amount, currency] = cases[i].split('\t');
  const actual = evaluator.evaluate(id, code, seconds, amount, currency);
  process.stdout.write(actual + '\n');
  if (actual === expected[i]) passed++;
  else process.stderr.write(`FAIL ${id}: expected=${expected[i] ?? 'MISSING'} actual=${actual}\n`);
}
const failures = cases.length - passed + Math.max(0, expected.length - cases.length);
process.stderr.write(`RESULT: passed=${passed}/${cases.length} failures=${failures} errors=0\n`);
process.exitCode = failures === 0 && cases.length === 15 ? 0 : 1;
