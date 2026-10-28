// The subject: reads events line by line and pushes each one to its listener.

import { STATUSES } from './listeners.js';

const REASON_PREFIX = 'reason=';

export class EventFormatError extends Error {
  constructor(lineNumber, message) {
    super(`line ${lineNumber}: ${message}`);
    this.name = 'EventFormatError';
  }
}

export class EventRunner {
  #listener;

  constructor(listener) {
    this.#listener = listener;
  }

  run(lines) {
    lines.forEach((line, i) => this.#dispatch(i + 1, line.trim()));
  }

  #dispatch(lineNumber, text) {
    if (text === '' || text.startsWith('#')) return;
    const fields = text.split(/\s+/);
    const [event, testId] = fields;
    const require = (condition) => {
      if (!condition) throw new EventFormatError(lineNumber, `malformed ${event} event`);
    };

    switch (event) {
      case 'started':
        require(fields.length === 2);
        this.#listener.executionStarted(testId);
        break;
      case 'finished':
        require(fields.length === 3);
        if (!STATUSES.includes(fields[2])) {
          throw new EventFormatError(lineNumber, `unknown status '${fields[2]}'`);
        }
        this.#listener.executionFinished(testId, fields[2]);
        break;
      case 'skipped': {
        require(fields.length >= 3 && fields[2].startsWith(REASON_PREFIX));
        const reason = fields.slice(2).join(' ').slice(REASON_PREFIX.length);
        require(reason !== '');
        this.#listener.executionSkipped(testId, reason);
        break;
      }
      default:
        throw new EventFormatError(lineNumber, `unknown event '${event}'`);
    }
  }
}
