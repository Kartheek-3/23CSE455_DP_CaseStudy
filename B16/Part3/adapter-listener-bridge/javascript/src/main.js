import { InputFormatError, report } from './adapter.js';

const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('usage: node src/main.js <events-file>');
  process.exit(2);
}
try {
  process.stdout.write(report(args[0]));
} catch (error) {
  if (!(error instanceof InputFormatError) && error.code !== 'ENOENT') throw error;
  console.error(`error: ${error.message}`);
  process.exit(1);
}
