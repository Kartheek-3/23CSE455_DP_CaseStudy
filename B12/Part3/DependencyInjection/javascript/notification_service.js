'use strict';

// Dependency Injection pattern -- constructor injection + composition root.
// Production snippet. Tests live in test_dependency_injection.js.

class NotificationSender {
  channel() {
    throw new Error('channel() not implemented');
  }
  send(message) {
    throw new Error('send() not implemented');
  }
}

class EmailSender extends NotificationSender {
  channel() {
    return 'email';
  }
  send(message) {
    return 'email:' + message;
  }
}

class SmsSender extends NotificationSender {
  channel() {
    return 'sms';
  }
  send(message) {
    return 'sms:' + message;
  }
}

class NotificationService {
  constructor(sender) {
    this.sender = sender;
  }
  notify(message) {
    return this.sender.send(message);
  }
}

function buildNotificationService() {
  return new NotificationService(new EmailSender());
}

module.exports = {
  NotificationSender,
  EmailSender,
  SmsSender,
  NotificationService,
  buildNotificationService,
};
