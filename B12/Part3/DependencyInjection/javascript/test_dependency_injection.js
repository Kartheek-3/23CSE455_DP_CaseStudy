'use strict';

const assert = require('assert');
const {
  EmailSender,
  SmsSender,
  NotificationService,
  buildNotificationService,
} = require('./notification_service.js');

let passed = 0;
let total = 0;
function check(label, actual, expected) {
  total += 1;
  assert.strictEqual(
    actual,
    expected,
    label + ': expected ' + expected + ' got ' + actual,
  );
  passed += 1;
}

const email = new EmailSender();
check('email-channel', email.channel(), 'email');

const emailService = new NotificationService(email);
check('email-send', emailService.notify('hi'), 'email:hi');

const sms = new SmsSender();
check('sms-channel', sms.channel(), 'sms');

const smsService = new NotificationService(sms);
check('sms-send', smsService.notify('hi'), 'sms:hi');

check(
  'inject-different',
  emailService.notify('x') !== smsService.notify('x') ? 1 : 0,
  1,
);
check(
  'composition-root',
  buildNotificationService().notify('p') === 'email:p' ? 1 : 0,
  1,
);

console.log('DEPENDENCY_INJECTION_JS PASS ' + passed + '/' + total);
