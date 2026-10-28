'use strict';
// Test runner for automation_actions.js (reads the shared CSV).
const fs = require('fs');
const {
  EmailService, OutputControl, EmailAction, OutputOnOffAction, ActionInvoker,
} = require('./automation_actions.js');

const CSV_PATH = '../../test-cases/automation_actions_cases.csv';
const OUTPUTS = { pump1: 'Main Pump', valve2: 'Drip Valve' };
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

function pairs(text) {
  const out = {};
  for (const item of text.split('|')) {
    const eq = item.indexOf('=');
    if (eq >= 0) out[item.slice(0, eq)] = item.slice(eq + 1);
  }
  return out;
}

function runCase(c) {
  const config = pairs(c.config);
  const service = new EmailService(Number(config.hourly_max ?? '5'));
  const control = new OutputControl(OUTPUTS);
  const invoker = new ActionInvoker();
  invoker.register('email-1', new EmailAction((config.email ?? 'grower@farm.org').replace(/;/g, ','), service));
  invoker.register('output-1', new OutputOnOffAction(config.output_id ?? 'pump1', Number(config.channel ?? '0'),
    config.state ?? 'on', Number(config.duration ?? '0'), control));
  const dictVars = { value: pairs(c.value) };
  if (c.message !== '-') dictVars.message = c.message;
  const result = invoker.triggerAction(c.action_id, dictVars);
  const log = [...service.log, ...control.log];
  return [result.message, log.length ? log.join('|') : 'none'];
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
    const expected = [c.expected_message, c.expected_log];
    let actual;
    let raised = false;
    try {
      actual = runCase(c);
    } catch (err) {
      actual = [`${err.name}: ${err.message}`, ''];
      raised = true;
    }
    const ok = expected[0] === 'ERROR' ? raised
      : (!raised && same(expected[0], actual[0]) && same(expected[1], actual[1]));
    if (ok) passed += 1;
    else console.log(`FAIL ${c.case_id}: expected ${expected.join(' / ')}, got ${raised ? 'ERROR ' : ''}${actual.join(' / ')}`);
  }
  console.log(`Command tests: ${passed}/${total} passed`);
  process.exit(passed === total ? 0 : 1);
}

main();
