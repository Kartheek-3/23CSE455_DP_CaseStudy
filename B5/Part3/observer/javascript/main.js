'use strict';

class MailMessage {
  constructor(messageId, subject, recipient) {
    this.messageId = messageId;
    this.subject = subject;
    this.recipient = recipient;
  }
}

class MailObserver {
  onDelivered(message) {
    throw new Error('Observer must implement onDelivered');
  }
}

class MailLogger extends MailObserver {
  constructor() {
    super();
    this.received = [];
  }

  onDelivered(message) {
    this.received.push(message);
  }
}

class MailDeliveryPublisher {
  constructor() {
    this.observers = new Set();
  }

  register(observer) {
    this.observers.add(observer);
  }

  unregister(observer) {
    this.observers.delete(observer);
  }

  deliver(message, delivered) {
    if (!delivered) return;
    if (message.recipient === null || message.recipient.trim() === '') {
      throw new Error('INVALID_RECIPIENT');
    }
    for (const observer of [...this.observers]) {
      observer.onDelivered(message);
    }
  }
}

module.exports = { MailMessage, MailObserver, MailLogger, MailDeliveryPublisher };
