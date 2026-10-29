'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { MailMessage, MailLogger, MailDeliveryPublisher } = require('./main');
const common = path.resolve(__dirname, '../../common_specs');

function readLines(name) {
  return fs.readFileSync(path.join(common, name), 'utf8').trimEnd().split(/\r?\n/);
}

function processCase(line) {
  const fields = line.split('\t');
  if (fields.length !== 6) throw new Error(`Invalid fixture row: ${line}`);
  const [id, registerFlag, deliveredFlag, messageId, subject, recipient] = fields;
  if (!['YES', 'NO'].includes(registerFlag) || !['YES', 'NO'].includes(deliveredFlag)) {
    return `${id}\tERROR\tINVALID_FLAG`;
  }
  const publisher = new MailDeliveryPublisher();
  const logger = new MailLogger();
  if (registerFlag === 'YES') publisher.register(logger);
  // O07 has the frozen register -> unregister -> deliver setup sequence.
  if (id === 'O07') publisher.unregister(logger);
  const message = new MailMessage(messageId, subject, recipient === '~' ? null : recipient);
  try {
    publisher.deliver(message, deliveredFlag === 'YES');
  } catch (error) {
    return `${id}\tERROR\t${error.message}`;
  }
  if (logger.received.length === 0) return `${id}\tNO_NOTIFICATION`;
  const logged = logger.received[0];
  return [id, 'LOGGED', logged.messageId, logged.subject, logged.recipient].join('\t');
}

function main() {
  const inputs = readLines('observer_cases.tsv');
  const expected = readLines('observer_expected.tsv');
  if (inputs.length !== 8 || expected.length !== 8) throw new Error('Expected seven cases and headers');
  let failures = 0;
  for (let i = 1; i < inputs.length; i++) {
    const actual = processCase(inputs[i]);
    process.stdout.write(`${actual}\n`);
    if (actual !== expected[i]) {
      failures++;
      process.stderr.write(`FAIL ${i} expected=${expected[i]} actual=${actual}\n`);
    }
  }
  process.stderr.write(`passed=${7 - failures}/7 failures=${failures} errors=0\n`);
  if (failures) process.exitCode = 1;
}

main();
