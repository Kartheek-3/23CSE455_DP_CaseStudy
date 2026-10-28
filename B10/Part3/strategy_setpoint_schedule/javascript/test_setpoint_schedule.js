'use strict';
// Test runner for setpoint_schedule.js (reads the shared CSV).
const fs = require('fs');
const { createMethodHandler } = require('./setpoint_schedule.js');

const CSV_PATH = '../../test-cases/setpoint_schedule_cases.csv';
const NUMBER = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;

const tokens = (text) => text.split(/[\s|;=,()]+/).filter((t) => t !== '');

function same(expected, actual) {
  const a = tokens(expected);
  const b = tokens(actual);
  if (a.length !== b.length) return false;
  return a.every((x, i) => {
    const y = b[i];
    if (NUMBER.test(x) && NUMBER.test(y)) return Math.abs(Number(x) - Number(y)) <= 1e-9;
    return x === y;
  });
}

const parseRows = (text, rowSeparator) => text.split(rowSeparator).map((row) => row.split(';').map((n) => {
  const value = Number(n);
  if (n.trim() === '' || Number.isNaN(value)) throw new Error(`not a number: '${n}'`);
  return value;
}));

function runCase(c) {
  const linked = [];
  let rows = [];
  if (c.method_type === 'Cascade') {
    for (const spec of c.params.split('|')) {
      const colon = spec.indexOf(':');
      linked.push(createMethodHandler(spec.slice(0, colon), parseRows(spec.slice(colon + 1), '/')));
    }
  } else {
    rows = parseRows(c.params, '|');
  }
  const method = createMethodHandler(c.method_type, rows, linked);
  const [setpoint, ended] = method.calculateSetpoint(Number(c.now), Number(c.start));
  return `${setpoint === null ? 'None' : setpoint}|${ended}`;
}

function main() {
  const lines = fs.readFileSync(CSV_PATH, 'utf8').split('\n')
    .map((l) => l.replace(/\r$/, '')).filter((l) => l.trim() !== '');
  const header = lines[0].split(',');
  let passed = 0;
  let total = 0;
  for (const line of lines.slice(1)) {
    const fields = line.split(',');
    const c = {};
    header.forEach((h, i) => { c[h] = fields[i]; });
    total += 1;
    let actual;
    let raised = false;
    try {
      actual = runCase(c);
    } catch (err) {
      actual = `${err.name}: ${err.message}`;
      raised = true;
    }
    const ok = c.expected === 'ERROR' ? raised : (!raised && same(c.expected, actual));
    if (ok) passed += 1;
    else console.log(`FAIL ${c.case_id}: expected ${c.expected}, got ${raised ? 'ERROR ' : ''}${actual}`);
  }
  console.log(`Strategy tests: ${passed}/${total} passed`);
  process.exit(passed === total ? 0 : 1);
}

main();
