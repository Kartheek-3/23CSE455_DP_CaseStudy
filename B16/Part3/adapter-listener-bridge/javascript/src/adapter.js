/** Adapter, modelled on JUnit's ExecutionListenerAdapter (instance B7). */
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

const UNIQUE_ID = /^(\[[a-z-]+:[^\]]+\])(\/\[[a-z-]+:[^\]]+\])*$/;
const SEGMENT = /\[([a-z-]+):([^\]]+)\]/g;

/** Target: what the engine calls, with raw unique ids (methods are no-ops unless overridden). */
export class EngineListener {
  executionStarted(uniqueId) {}

  executionFinished(uniqueId, status) {}
}

export class TestIdentifier {
  constructor(displayName, isTest, parentName) {
    this.displayName = displayName;
    this.isTest = isTest;
    this.parentName = parentName;
  }

  describe() {
    const parent = this.parentName ? ' (in ' + this.parentName + ')' : '';
    return `${this.isTest ? 'test' : 'container'} ${this.displayName}${parent}`;
  }
}

/** Adaptee: the client-side interface, in terms of TestIdentifier. */
export class TestListener {
  testStarted(identifier) {}

  testFinished(identifier, status) {}
}

export class PrintingTestListener extends TestListener {
  lines = [];

  testStarted(identifier) {
    this.lines.push(`started  ${identifier.describe()}`);
  }

  testFinished(identifier, status) {
    this.lines.push(`finished ${identifier.describe()}: ${status}`);
  }
}

export function toIdentifier(uniqueId) {
  const segments = [...uniqueId.matchAll(SEGMENT)].map((m) => [m[1], m[2]]);
  const [kind, name] = segments.at(-1);
  return new TestIdentifier(name, kind === 'method', segments.length > 1 ? segments.at(-2)[1] : null);
}

/** Adapter: implements the Target and forwards to the Adaptee in its own terms. */
export class ListenerAdapter extends EngineListener {
  #testListener;

  constructor(testListener) {
    super();
    this.#testListener = testListener;
  }

  executionStarted(uniqueId) {
    this.#testListener.testStarted(toIdentifier(uniqueId));
  }

  executionFinished(uniqueId, status) {
    this.#testListener.testFinished(toIdentifier(uniqueId), status);
  }
}

/** The engine side: knows only EngineListener and raw unique ids. */
export function runEngine(lines, listener) {
  lines.forEach((line, i) => {
    const f = fields(line);
    if (f === null) return;
    const where = `line ${i + 1}: `;
    if (f[0] !== 'started' && f[0] !== 'finished') throw new InputFormatError(`${where}unknown event '${f[0]}'`);
    if (f.length !== (f[0] === 'started' ? 2 : 3)) throw new InputFormatError(`${where}malformed ${f[0]} event`);
    if (!UNIQUE_ID.test(f[1])) throw new InputFormatError(`${where}malformed unique id '${f[1]}'`);
    if (f[0] === 'started') {
      listener.executionStarted(f[1]);
    } else if (['SUCCESSFUL', 'FAILED', 'ABORTED'].includes(f[2])) {
      listener.executionFinished(f[1], f[2]);
    } else {
      throw new InputFormatError(`${where}unknown status '${f[2]}'`);
    }
  });
}

export function report(path) {
  const client = new PrintingTestListener();
  runEngine(readLines(path), new ListenerAdapter(client));
  return client.lines.join('\n') + '\n';
}
