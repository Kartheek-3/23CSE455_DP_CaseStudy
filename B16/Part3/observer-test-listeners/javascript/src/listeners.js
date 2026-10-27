// Observer side: the listener base class, the composite that notifies each one, and three listeners.

export const STATUSES = Object.freeze(['SUCCESSFUL', 'FAILED', 'ABORTED']);

// Base class with no-op callbacks, like JUnit's TestExecutionListener defaults.
// Extending it is optional: the composite only calls these methods.
export class TestExecutionListener {
  executionStarted(testId) {}
  executionSkipped(testId, reason) {}
  executionFinished(testId, status) {}
}

// Forwards each event to every registered listener. Like JUnit's
// CompositeTestExecutionListener.notifyEach, a listener that throws is recorded
// in `failures` and the remaining listeners still get the event.
export class CompositeTestExecutionListener extends TestExecutionListener {
  #listeners = [];
  failures = [];

  register(listener) {
    this.#listeners.push(listener);
  }

  executionStarted(testId) {
    this.#notifyEach(`started ${testId}`, (l) => l.executionStarted(testId));
  }

  executionSkipped(testId, reason) {
    this.#notifyEach(`skipped ${testId}`, (l) => l.executionSkipped(testId, reason));
  }

  executionFinished(testId, status) {
    this.#notifyEach(`finished ${testId}`, (l) => l.executionFinished(testId, status));
  }

  #notifyEach(event, call) {
    for (const listener of this.#listeners) {
      try {
        call(listener);
      } catch (error) {
        this.failures.push(`${listener.constructor.name} failed on ${event}: ${error.message}`);
      }
    }
  }
}

// Counts results per status.
export class SummaryListener extends TestExecutionListener {
  #counts = new Map([...STATUSES, 'SKIPPED'].map((name) => [name, 0]));

  executionSkipped(testId, reason) {
    this.#counts.set('SKIPPED', this.#counts.get('SKIPPED') + 1);
  }

  executionFinished(testId, status) {
    this.#counts.set(status, this.#counts.get(status) + 1);
  }

  render() {
    const counts = [...this.#counts];
    const total = counts.reduce((sum, [, count]) => sum + count, 0);
    return [`total: ${total}`, ...counts.map(([name, count]) => `${name}: ${count}`)]
      .map((line) => `${line}\n`).join('');
  }
}

// Writes one log line per event.
export class LoggingListener extends TestExecutionListener {
  #lines = [];

  executionStarted(testId) {
    this.#lines.push(`started ${testId}`);
  }

  executionSkipped(testId, reason) {
    this.#lines.push(`skipped ${testId} (${reason})`);
  }

  executionFinished(testId, status) {
    this.#lines.push(`finished ${testId} ${status}`);
  }

  render() {
    return this.#lines.map((line, i) => `${i + 1}. ${line}\n`).join('');
  }
}

// Throws on every event, to show the others are not affected.
export class BrokenListener extends TestExecutionListener {
  executionStarted() {
    throw new Error('listener is broken');
  }

  executionSkipped() {
    throw new Error('listener is broken');
  }

  executionFinished() {
    throw new Error('listener is broken');
  }
}
