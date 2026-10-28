'use strict';

// Observer pattern (GoF, behavioural) -- real-time occupancy notifications.
// Production snippet. Tests live in test_observer.js.

class OccupancyObserver {
  update(event) {
    throw new Error('update() not implemented');
  }
}

class AvailabilityObserver extends OccupancyObserver {
  constructor() {
    super();
    this.occupied = new Set();
  }
  update(event) {
    const kind = event.slice(0, event.indexOf(':'));
    const id = Number(event.slice(event.indexOf(':') + 1));
    if (kind === 'occupy') {
      this.occupied.add(id);
    } else if (kind === 'free') {
      this.occupied.delete(id);
    }
  }
  count() {
    return this.occupied.size;
  }
}

class LoggingObserver extends OccupancyObserver {
  constructor() {
    super();
    this.events = [];
  }
  update(event) {
    this.events.push(event);
  }
}

class OccupancyMonitor {
  constructor() {
    this.observers = [];
  }
  attach(observer) {
    this.observers.push(observer);
  }
  detach(observer) {
    this.observers = this.observers.filter((o) => o !== observer);
  }
  notify(event) {
    for (const observer of this.observers) {
      observer.update(event);
    }
    return this.observers.length;
  }
}

module.exports = {
  OccupancyObserver,
  AvailabilityObserver,
  LoggingObserver,
  OccupancyMonitor,
};
