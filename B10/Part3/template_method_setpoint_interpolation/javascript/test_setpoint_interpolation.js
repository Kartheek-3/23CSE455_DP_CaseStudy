'use strict';
// Test runner for setpoint_interpolation.js (reads the shared CSV).
const fs = require('fs');
const { MethodRow, DateMethod, DailyMethod } = require('./setpoint_interpolation.js');

const CSV_PATH = '../../test-cases/setpoint_interpolation_cases.csv';
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

const fmt = (value) => (value === null ? 'None' : String(value));

function runCase(c) {
  const rows = c.rows.split('|').map((item) => {
    const [start, end, spStart, spEnd] = item.split(';');
    return new MethodRow(start, end, Number(spStart), spEnd === '' ? null : Number(spEnd));
  });
  const method = c.method === 'Daily' ? new DailyMethod(rows) : new DateMethod(rows);
  const [setpoint, ended] = method.calculateSetpoint(c.now);
  return `${fmt(setpoint)}|${ended}`;
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
  console.log(`Template Method tests: ${passed}/${total} passed`);
  process.exit(passed === total ? 0 : 1);
}

main();
