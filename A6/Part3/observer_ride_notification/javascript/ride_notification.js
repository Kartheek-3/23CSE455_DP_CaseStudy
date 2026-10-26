// Observer pattern: ride event notification (mirrors SocketNotificationService + Redis socket registry).

// Stands in for a connected rider/driver socket. Any object with update(event) is an observer.
export class RecordingObserver {
  received = [];
  update(event) {
    this.received.push(event);
  }
}

// Subject: one observer per subscriber id; a reconnect replaces the old one.
export class NotificationHub {
  #subscribers = new Map();

  subscribe(id, observer) {
    this.#subscribers.set(id, observer);
  }

  unsubscribe(id) {
    this.#subscribers.delete(id);
  }

  notify(id, event) {
    const observer = this.#subscribers.get(id);
    if (!observer) return false;
    observer.update(event);
    return true;
  }

  broadcast(ids, event) {
    return ids.filter((id) => this.notify(id, event)).length;
  }
}
