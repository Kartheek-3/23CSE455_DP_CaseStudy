// Wires the listeners to the runner and builds the summary, the log and any listener failures.

import { readFileSync } from 'node:fs';
import {
  BrokenListener, CompositeTestExecutionListener, LoggingListener, SummaryListener,
} from './listeners.js';
import { EventRunner } from './runner.js';

export function report(eventsPath) {
  const summary = new SummaryListener();
  const log = new LoggingListener();

  const listeners = new CompositeTestExecutionListener();
  listeners.register(summary);
  listeners.register(new BrokenListener());
  listeners.register(log);

  new EventRunner(listeners).run(readFileSync(eventsPath, 'utf8').split(/\r?\n/));

  return '== Summary ==\n' + summary.render()
    + '== Log ==\n' + log.render()
    + `== Listener failures (${listeners.failures.length}) ==\n`
    + listeners.failures.map((failure) => `${failure}\n`).join('');
}
