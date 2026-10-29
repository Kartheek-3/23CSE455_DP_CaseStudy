/** Template Method, modelled on JUnit's HierarchicalTestEngine.execute (instance B1). */
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

export class TestEngine {
  constructor() {
    if (new.target === TestEngine) throw new TypeError('TestEngine is abstract');
  }

  /** The template method. JavaScript has no "final", so this is a convention only. */
  execute(tests) {
    const lines = [`${this.name()}: start (${tests.length} tests)`];
    let passed = 0;
    for (const [name, outcome] of tests) {
      this.beforeEach(name, lines);
      const result = this.runTest(name, outcome);
      lines.push(`  run ${name} -> ${result}`);
      this.afterEach(name, lines);
      if (result === 'PASS') passed += 1;
    }
    lines.push(`${this.name()}: done ${passed} passed, ${tests.length - passed} failed`);
    return lines;
  }

  name() {
    throw new Error(`${this.constructor.name} must implement name()`);
  }

  /** Primitive operation. */
  runTest(name, outcome) {
    throw new Error(`${this.constructor.name} must implement runTest()`);
  }

  /** Hook: does nothing unless overridden. */
  beforeEach(name, lines) {}

  /** Hook: does nothing unless overridden. */
  afterEach(name, lines) {}
}

export class SimpleEngine extends TestEngine {
  name() {
    return 'simple';
  }

  runTest(name, outcome) {
    return outcome;
  }
}

export class LifecycleEngine extends TestEngine {
  name() {
    return 'lifecycle';
  }

  runTest(name, outcome) {
    return outcome;
  }

  beforeEach(name, lines) {
    lines.push(`  beforeEach ${name}`);
  }

  afterEach(name, lines) {
    lines.push(`  afterEach ${name}`);
  }
}

export function report(path) {
  const tests = parseTests(readLines(path));
  const out = [];
  for (const engine of [new SimpleEngine(), new LifecycleEngine()]) {
    out.push(`== ${engine.name()} ==`, ...engine.execute(tests));
  }
  return out.join('\n') + '\n';
}
