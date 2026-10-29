'use strict';
// Test runner for module_loading.js (reads the shared CSV).
const fs = require('fs');
const { parseInputInformation, InputController } = require('./module_loading.js');

const CSV_PATH = '../../test-cases/module_loading_cases.csv';
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

function attempt(fn) {
  try {
    return [fn(), false];
  } catch (err) {
    return [`${err.name}: ${err.message}`, true];
  }
}

const check = (expected, actual, raised) => (expected === 'ERROR' ? raised : (!raised && same(expected, actual)));

function registryText(registry, errors) {
  const entries = Object.keys(registry).sort().map((name) => `${name}=${registry[name].file_path}`);
  if (errors.length) entries.push(`duplicates=${errors.length}`);
  return entries.length ? entries.join('|') : 'none';
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
    const files = c.files.split('|').filter((f) => f !== '');
    const [result, raised] = attempt(() => parseInputInformation(files));
    let registry = result;
    let device = null;
    let deviceRaised = false;
    let ok;
    if (raised) {
      ok = check(c.expected_registry, registry, true);
    } else {
      registry = registryText(result[0], result[1]);
      [device, deviceRaised] = attempt(() => new InputController(result[0]).initialize(c.device).describe());
      ok = check(c.expected_registry, registry, false) && check(c.expected_device, device, deviceRaised);
    }
    if (ok) passed += 1;
    else {
      console.log(`FAIL ${c.case_id}: expected ${c.expected_registry} / ${c.expected_device}, got `
        + `${raised ? 'ERROR ' : ''}${registry} / ${deviceRaised ? 'ERROR ' : ''}${device}`);
    }
  }
  console.log(`Plugin tests: ${passed}/${total} passed`);
  process.exit(passed === total ? 0 : 1);
}

main();
