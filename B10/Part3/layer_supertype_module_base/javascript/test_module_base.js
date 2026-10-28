'use strict';
// Test runner for module_base.js (reads the shared CSV).
const fs = require('fs');
const { OptionStore, AbstractInput, AbstractFunction } = require('./module_base.js');

const CSV_PATH = '../../test-cases/module_base_cases.csv';
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

const fmt = (value) => (value === null || value === undefined ? 'None' : String(value));

function optionDefs(text) {
  return text.split('|').map((item) => {
    const def = {};
    ['id', 'type', 'default_value', 'required'].forEach((key, i) => {
      const field = item.split(':')[i];
      if (field !== '!') def[key] = key === 'required' ? field === 'true' : field;
    });
    return def;
  });
}

function pairs(text) {
  const out = {};
  for (const item of text.split('|')) {
    const eq = item.indexOf('=');
    if (eq >= 0) out[item.slice(0, eq)] = item.slice(eq + 1).replace(/;/g, ',');
  }
  return out;
}

function runCase(c) {
  const store = new OptionStore();
  const [MemberClass, OtherClass] = c.member === 'input' ? [AbstractInput, AbstractFunction] : [AbstractFunction, AbstractInput];
  const member = new MemberClass('u1', store);
  member.setupCustomOptions(optionDefs(c.option_defs), pairs(c.stored));
  const parts = Object.keys(member.options).sort().map((name) => `${name}=${fmt(member.options[name])}`);
  if (member.errors.length) parts.push(`errors=${member.errors.length}`);
  if (c.persist !== '-') {
    const eq = c.persist.indexOf('=');
    const [name, value] = [c.persist.slice(0, eq), c.persist.slice(eq + 1)];
    member.setCustomOption(name, value);
    parts.push(`stored=${fmt(member.getCustomOption(name))}`);
    parts.push(`other_table=${fmt(new OtherClass('u1', store).getCustomOption(name))}`);
  }
  return parts.join('|');
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
  console.log(`Layer Supertype tests: ${passed}/${total} passed`);
  process.exit(passed === total ? 0 : 1);
}

main();
