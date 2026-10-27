/** Decorator, modelled on JUnit's timeout invocation wrappers (instance D10). */
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

export const LIMIT_MS = 100;

/** Concrete component: the test method itself (its duration is given, not measured). */
export class TestInvocation {
  constructor(name, durationMs, outcome) {
    this.name = name;
    this.durationMs = durationMs;
    this.outcome = outcome;
  }

  proceed() {
    return this.outcome;
  }
}

/** Base decorator: same interface (name, durationMs, proceed), forwards to the wrapped invocation. */
export class InvocationDecorator {
  constructor(inner) {
    this.inner = inner;
  }

  get name() {
    return this.inner.name;
  }

  get durationMs() {
    return this.inner.durationMs;
  }

  proceed() {
    return this.inner.proceed();
  }
}

export class TimeoutInvocation extends InvocationDecorator {
  #limitMs;

  constructor(inner, limitMs) {
    super(inner);
    this.#limitMs = limitMs;
  }

  proceed() {
    const result = this.inner.proceed();
    return this.durationMs > this.#limitMs ? `TIMEOUT (${this.durationMs} ms > ${this.#limitMs} ms limit)` : result;
  }
}

export class LoggingInvocation extends InvocationDecorator {
  #log;

  constructor(inner, log) {
    super(inner);
    this.#log = log;
  }

  proceed() {
    this.#log.push(`[log] calling ${this.name}`);
    const result = this.inner.proceed();
    this.#log.push(`[log] ${this.name} -> ${result}`);
    return result;
  }
}

export function parse(lines) {
  const invocations = [];
  lines.forEach((line, i) => {
    const f = fields(line);
    if (f === null) return;
    const where = `line ${i + 1}: `;
    if (f.length !== 3) throw new InputFormatError(`${where}expected '<test> <duration-ms> PASS|FAIL'`);
    if (!/^[0-9]+$/.test(f[1])) throw new InputFormatError(`${where}duration must be a whole number of milliseconds, got '${f[1]}'`);
    if (f[2] !== 'PASS' && f[2] !== 'FAIL') throw new InputFormatError(`${where}outcome must be PASS or FAIL, got '${f[2]}'`);
    invocations.push(new TestInvocation(f[0], Number(f[1]), f[2]));
  });
  return invocations;
}

export function report(path) {
  const log = [];
  const counts = { PASS: 0, FAIL: 0, TIMEOUT: 0 };
  for (const invocation of parse(readLines(path))) {
    const result = new LoggingInvocation(new TimeoutInvocation(invocation, LIMIT_MS), log).proceed();
    counts[result.split(' ')[0]] += 1;
  }
  return [...log, '== Summary ==', ...Object.entries(counts).map(([key, value]) => `${key} ${value}`)].join('\n') + '\n';
}
