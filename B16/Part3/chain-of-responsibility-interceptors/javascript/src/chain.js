/** Chain of Responsibility, modelled on JUnit's InvocationInterceptorChain (instance D9). */
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

export class Invocation {
  constructor(name, durationMs, outcome, disabled) {
    Object.assign(this, { name, durationMs, outcome, disabled });
    this.trace = [];
  }
}

/** Handlers: each returns a result, either by calling proceed() or without it (which ends the chain). */
export class LoggingInterceptor {
  label = 'logging';

  intercept(invocation, proceed) {
    return proceed();
  }
}

export class DisabledInterceptor {
  label = 'disabled';

  intercept(invocation, proceed) {
    return invocation.disabled ? 'SKIPPED (disabled)' : proceed();
  }
}

export class TimeoutInterceptor {
  label = 'timeout';

  intercept(invocation, proceed) {
    const result = proceed();
    return invocation.durationMs > LIMIT_MS ? `TIMEOUT (${invocation.durationMs} ms > ${LIMIT_MS} ms limit)` : result;
  }
}

/** Link i calls interceptor i with a proceed() that runs link i + 1; the last link calls the test. */
export function runChain(interceptors, invocation) {
  const link = (index) => {
    if (index === interceptors.length) {
      invocation.trace.push('invocation');
      return invocation.outcome;
    }
    invocation.trace.push(interceptors[index].label);
    return interceptors[index].intercept(invocation, () => link(index + 1));
  };
  return link(0);
}

export function parse(lines) {
  const invocations = [];
  lines.forEach((line, i) => {
    const f = fields(line);
    if (f === null) return;
    const where = `line ${i + 1}: `;
    if (f.length !== 3 && f.length !== 4) throw new InputFormatError(`${where}expected '<test> <duration-ms> PASS|FAIL [disabled]'`);
    if (!/^[0-9]+$/.test(f[1])) throw new InputFormatError(`${where}duration must be a whole number of milliseconds, got '${f[1]}'`);
    if (f[2] !== 'PASS' && f[2] !== 'FAIL') throw new InputFormatError(`${where}outcome must be PASS or FAIL, got '${f[2]}'`);
    if (f.length === 4 && f[3] !== 'disabled') throw new InputFormatError(`${where}unknown flag '${f[3]}'`);
    invocations.push(new Invocation(f[0], Number(f[1]), f[2], f.length === 4));
  });
  return invocations;
}

export function report(path) {
  const chain = [new LoggingInterceptor(), new DisabledInterceptor(), new TimeoutInterceptor()];
  return parse(readLines(path))
    .map((invocation) => {
      const result = runChain(chain, invocation);
      return `${invocation.name} -> ${result}  [${invocation.trace.join(' > ')}]`;
    })
    .join('\n') + '\n';
}
