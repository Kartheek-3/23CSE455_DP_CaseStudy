class BadRequest extends Error {}

class Event {                                    // Event (what is published)
  constructor(kind, accountId, amount) { this.kind = kind; this.accountId = accountId; this.amount = amount; }
}

class EventPublisher {                           // SubjectChannel: keeps the observers, knows none by type
  constructor() { this.observers = []; }
  subscribe(observer) { this.observers.push(observer); }
  publish(event) { for (const o of this.observers) o.onEvent(event); }
}

class AccountService {                           // Subject: publishes after a valid operation
  constructor(publisher) { this.publisher = publisher; }
  deposit(accountId, amount) { this.apply('DEPOSIT', accountId, amount); }
  withdraw(accountId, amount) { this.apply('WITHDRAWAL', accountId, amount); }
  apply(kind, accountId, amount) {
    if (amount <= 0) throw new BadRequest();     // failed operations publish nothing
    this.publisher.publish(new Event(kind, accountId, amount));
  }
}

class AuditLog {                                 // ConcreteObserver
  constructor() { this.entries = new Map(); }
  onEvent(e) {
    if (!this.entries.has(e.accountId)) this.entries.set(e.accountId, []);
    this.entries.get(e.accountId).push(e);
  }
  text(accountId) { return (this.entries.get(accountId) || []).map((e) => `${e.kind}:${e.amount.toFixed(2)}`).join(',') || '-'; }
}

class HighValueAlert {                           // ConcreteObserver
  constructor() { this.alerts = []; }
  onEvent(e) { if (e.amount >= 10000.0) this.alerts.push(e); }
  text() { return this.alerts.map((e) => `${e.kind}:${e.amount.toFixed(2)}@${e.accountId}`).join(',') || '-'; }
}

module.exports = { AccountService, AuditLog, EventPublisher, HighValueAlert, BadRequest };
