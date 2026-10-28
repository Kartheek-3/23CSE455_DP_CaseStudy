'use strict';
// Test runner for daemon_rpc.js (reads the shared CSV).
const fs = require('fs');
const { Daemon, DaemonControl } = require('./daemon_rpc.js');

const CSV_PATH = '../../test-cases/daemon_rpc_cases.csv';
const URI = 'PYRO:mycodo@localhost:9080';
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

function buildNetwork(spec) {
  const colon = spec.indexOf(':');
  const kind = colon < 0 ? spec : spec.slice(0, colon);
  const arg = colon < 0 ? '' : spec.slice(colon + 1);
  const network = new Map();
  if (kind === 'up') network.set(URI, new Daemon());
  else if (kind === 'slow') network.set(URI, new Daemon(Number(arg)));
  else if (kind === 'unhealthy') network.set(URI, new Daemon(0, arg));
  return network;
}

function runCase(c) {
  const timeout = c.timeout === '' ? null : Number(c.timeout);
  const control = new DaemonControl(buildNetwork(c.daemon), URI, timeout);
  return c.operations.split('|').map((operation) => {
    const [name, ...p] = operation.split(':');
    if (name === 'check_daemon') return control.checkDaemon();
    if (name === 'output_on') return control.outputOn(p[0], Number(p[2]), Number(p[1]));
    if (name === 'output_off') return control.outputOff(p[0], Number(p[1]));
    if (name === 'output_state') return control.outputState(p[0], Number(p[1]));
    return control.outputOnOff(p[0], p[2], Number(p[3]), Number(p[1]));
  }).join('|');
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
  console.log(`Proxy tests: ${passed}/${total} passed`);
  process.exit(passed === total ? 0 : 1);
}

main();
