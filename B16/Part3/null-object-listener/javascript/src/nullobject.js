/** Null Object, modelled on JUnit's EngineExecutionListener.NOOP (instance C7). */
import { readFileSync } from 'node:fs';

export class InputFormatError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InputFormatError';
  }
}

/** Splits a line into fields; returns null for blank lines and comments. */
function fields(line) {
  const trimmed = line.trim();
  return trimmed === '' || trimmed.startsWith('#') ? null : trimmed.split(/\s+/);
}

function readLines(path) {
  return readFileSync(path, 'utf8').split(/\r?\n/);
}

/** Lines of the form "<test> PASS|FAIL". */
export function parseTests(lines) {
  const tests = [];
  lines.forEach((line, i) => {
    const f = fields(line);
    if (f === null) return;
    if (f.length !== 2) throw new InputFormatError(`line ${i + 1}: expected '<test> PASS|FAIL'`);
    if (f[1] !== 'PASS' && f[1] !== 'FAIL') {
      throw new InputFormatError(`line ${i + 1}: outcome must be PASS or FAIL, got '${f[1]}'`);
    }
    tests.push([f[0], f[1]]);
  });
  return tests;
}

/** The null object: a real (frozen) listener that does nothing. */
export const NOOP = Object.freeze({ testFinished() {} });

export class ConsoleListener {
  #lines;

  constructor(lines) {
    this.#lines = lines;
  }

  testFinished(name, outcome) {
    this.#lines.push(`listener: ${name} ${outcome}`);
  }
}

export class TestRunner {
  constructor(listener = NOOP) {
    this.listener = listener;
  }

  run(tests) {
    let passed = 0;
    for (const [name, outcome] of tests) {
      this.listener.testFinished(name, outcome); // no null check anywhere
      if (outcome === 'PASS') passed += 1;
    }
    return `result: ${passed} passed, ${tests.length - passed} failed`;
  }
}

export function report(path) {
  const tests = parseTests(readLines(path));
  const out = ['== with a console listener =='];
  out.push(new TestRunner(new ConsoleListener(out)).run(tests));
  out.push('== with no listener (null object) ==', new TestRunner().run(tests));
  return out.join('\n') + '\n';
}
