// Command-line entry point: node src/main.js <events-file>

import { report } from './app.js';
import { EventFormatError } from './runner.js';

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('usage: node src/main.js <events-file>');
  process.exit(2);
}
try {
  process.stdout.write(report(args[0]));
} catch (error) {
  if (!(error instanceof EventFormatError) && error.code === undefined) throw error;
  console.error(`error: ${error.message}`);
  process.exitCode = 1;
}
