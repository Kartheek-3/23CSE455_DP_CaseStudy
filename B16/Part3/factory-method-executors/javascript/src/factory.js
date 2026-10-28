/** Factory Method, modelled on JUnit's HierarchicalTestEngine.createExecutorService (instance B2). */
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

export class SameThreadExecutor {
  describe() {
    return 'same thread';
  }

  run(tests) {
    return tests.map(([name, outcome]) => `[main] ${name} -> ${outcome}`);
  }
}

/** Hands tests to its workers in turn (deterministic, so the output can be compared). */
export class PooledExecutor {
  #workers;

  constructor(workers) {
    this.#workers = workers;
  }

  describe() {
    return `pool of ${this.#workers} workers`;
  }

  run(tests) {
    return tests.map(([name, outcome], i) => `[worker-${(i % this.#workers) + 1}] ${name} -> ${outcome}`);
  }
}

/** Creator: execute() is written once; subclasses implement the factory method createExecutor(). */
export class TestEngine {
  constructor() {
    if (new.target === TestEngine) throw new TypeError('TestEngine is abstract');
  }

  name() {
    throw new Error(`${this.constructor.name} must implement name()`);
  }

  createExecutor() {
    throw new Error(`${this.constructor.name} must implement createExecutor()`);
  }

  execute(tests) {
    const executor = this.createExecutor();
    return [`== ${this.name()} ==`, `executor: ${executor.describe()}`, ...executor.run(tests)];
  }
}

export class SameThreadEngine extends TestEngine {
  name() {
    return 'same-thread engine';
  }

  createExecutor() {
    return new SameThreadExecutor();
  }
}

export class PooledEngine extends TestEngine {
  name() {
    return 'pooled engine';
  }

  createExecutor() {
    return new PooledExecutor(2);
  }
}

export function report(path) {
  const tests = parseTests(readLines(path));
  return [new SameThreadEngine(), new PooledEngine()].flatMap((engine) => engine.execute(tests)).join('\n') + '\n';
}
