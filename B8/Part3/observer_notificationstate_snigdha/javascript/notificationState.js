class NotificationsSubject {
  constructor() {
    this.observers = new Set();
    this.state = { unreadCount: 0, latestNotification: null };
  }

  subscribe(observer) {
    this.observers.add(observer);
    observer({ ...this.state }); // BehaviorSubject-like immediate state
    return () => this.unsubscribe(observer);
  }

  unsubscribe(observer) {
    this.observers.delete(observer);
  }

  notifyObservers() {
    for (const observer of this.observers) observer({ ...this.state });
  }

  publishNewNotification(message) {
    this.state = {
      unreadCount: this.state.unreadCount + 1,
      latestNotification: message
    };
    this.notifyObservers();
  }

  markOneAsRead() {
    this.state = {
      ...this.state,
      unreadCount: Math.max(0, this.state.unreadCount - 1)
    };
    this.notifyObservers();
  }

  markAllAsRead() {
    this.state = { ...this.state, unreadCount: 0 };
    this.notifyObservers();
  }
}

class NotificationPanel {
  constructor() { this.state = null; }
  update(state) { this.state = state; }
}

module.exports = { NotificationsSubject, NotificationPanel };
