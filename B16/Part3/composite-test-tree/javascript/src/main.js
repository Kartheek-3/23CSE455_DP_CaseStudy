// Command-line entry point: node src/main.js <tree-file> <tag>

import { report } from './app.js';
import { TreeFormatError } from './tree-parser.js';

const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('usage: node src/main.js <tree-file> <tag>');
  process.exit(2);
}
try {
  process.stdout.write(report(args[0], args[1]));
} catch (error) {
  if (!(error instanceof TreeFormatError) && error.code === undefined) throw error;
  console.error(`error: ${error.message}`);
  process.exitCode = 1;
}
