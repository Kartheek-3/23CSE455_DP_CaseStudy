'use strict';
// Test runner for sensor_driver.js (reads the shared CSV).
const fs = require('fs');
const { Seesaw, WeatherApi, SoilInput, WeatherInput, updateMeasure } = require('./sensor_driver.js');

const CSV_PATH = '../../test-cases/sensor_driver_cases.csv';
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

function runCase(c) {
  const enabled = c.enabled.split('|').map(Number);
  const raw = {};
  for (const item of c.raw.split('|')) {
    const eq = item.indexOf('=');
    if (eq >= 0) raw[item.slice(0, eq)] = item.slice(eq + 1);
  }
  let device;
  if (c.input === 'soil') {
    device = new SoilInput(enabled, c.raw === 'unset' ? null : new Seesaw(raw));
  } else {
    const { api_key: apiKey = '', city = '', network = 'up', ...response } = raw;
    device = new WeatherInput(enabled, new WeatherApi(response, network !== 'down'), apiKey, city);
  }
  const values = updateMeasure(device);
  if (values === null) return 'None';
  return [...values.keys()].sort((p, q) => p - q).map((ch) => `${ch}=${values.get(ch)}`).join('|');
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
  console.log(`Adapter tests: ${passed}/${total} passed`);
  process.exit(passed === total ? 0 : 1);
}

main();
