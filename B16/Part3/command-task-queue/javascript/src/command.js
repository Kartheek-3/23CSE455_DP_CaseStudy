/** Command, modelled on JUnit's NodeTestTask / MethodInvocation (instance B9). */
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

export class RunTestCommand {
  constructor(name, outcome) {
    this.name = name;
    this.outcome = outcome;
  }

  execute(results) {
    results.push(this.outcome);
    return `test ${this.name} -> ${this.outcome}`;
  }
}

export class NoteCommand {
  constructor(text) {
    this.text = text;
  }

  execute() {
    return `note: ${this.text}`;
  }
}

/** Invoker: holds commands and executes them later, in submission order, without knowing what they do. */
export class TaskExecutor {
  #queue = [];
  results = [];

  submit(command) {
    this.#queue.push(command);
  }

  runAll() {
    const lines = this.#queue.map((command, i) => `#${i + 1} ${command.execute(this.results)}`);
    this.#queue = [];
    return lines;
  }
}

export function parse(lines) {
  const commands = [];
  lines.forEach((line, i) => {
    const f = fields(line);
    if (f === null) return;
    if (f[0] === 'test' && f.length === 3 && (f[2] === 'PASS' || f[2] === 'FAIL')) {
      commands.push(new RunTestCommand(f[1], f[2]));
    } else if (f[0] === 'note' && f.length > 1) {
      commands.push(new NoteCommand(f.slice(1).join(' ')));
    } else if (f[0] === 'test' || f[0] === 'note') {
      throw new InputFormatError(`line ${i + 1}: expected 'test <name> PASS|FAIL' or 'note <text>'`);
    } else {
      throw new InputFormatError(`line ${i + 1}: unknown command '${f[0]}'`);
    }
  });
  return commands;
}

export function report(path) {
  const commands = parse(readLines(path));
  const executor = new TaskExecutor();
  commands.forEach((command) => executor.submit(command));
  const out = [`queued ${commands.length} commands`, ...executor.runAll()];
  const passed = executor.results.filter((r) => r === 'PASS').length;
  out.push(`executed ${commands.length} commands: ${executor.results.length} tests, ${passed} passed, ${executor.results.length - passed} failed`);
  return out.join('\n') + '\n';
}
