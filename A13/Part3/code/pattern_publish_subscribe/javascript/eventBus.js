// Stands in for Redis plus the per-connection channel emitters.
class Broker {
  constructor() { this.subscribers = new Map(); }

  subscribe(channel, handler) {
    if (!this.subscribers.has(channel)) this.subscribers.set(channel, []);
    this.subscribers.get(channel).push(handler);
  }

  unsubscribe(channel, handler) {
    const handlers = this.subscribers.get(channel) ?? [];
    const index = handlers.indexOf(handler);
    if (index >= 0) handlers.splice(index, 1);
  }

  publish(channel, message) {
    const handlers = [...(this.subscribers.get(channel) ?? [])];
    for (const handler of handlers) handler(channel, message);
    return handlers.length;
  }
}

class GlobalEventService {
  constructor(broker) { this.broker = broker; }

  publishMainStream(userId, type, body) { return this.publish('mainStream:' + userId, type, body); }

  publishBroadcastStream(type, body) { return this.publish('broadcast', type, body); }

  publish(channel, type, body) {
    return this.broker.publish(channel, JSON.stringify({ type, body }));
  }
}

module.exports = { Broker, GlobalEventService };
