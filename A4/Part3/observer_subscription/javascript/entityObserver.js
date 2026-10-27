export class EntitySubscriptionObserver {
  onEntityUpdate(entityId, state, attributes) {
    throw new Error('onEntityUpdate() must be implemented');
  }
}

export class EntityRecord {
  constructor(entityId, state, attributes = {}) {
    this.entityId = entityId;
    this.state = state;
    this.attributes = { ...attributes };
  }
}

export class EntityHub {
  constructor() {
    this.entityStates = new Map();
    this.observers = [];
  }

  subscribe(observer) {
    if (observer && !this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  unsubscribe(observer) {
    const idx = this.observers.indexOf(observer);
    if (idx !== -1) {
      this.observers.splice(idx, 1);
    }
  }

  updateEntity(entityId, state, attributes = {}) {
    const record = new EntityRecord(entityId, state, attributes);
    this.entityStates.set(entityId, record);
    this.notifyObservers(entityId, state, record.attributes);
  }

  notifyObservers(entityId, state, attributes) {
    for (const observer of [...this.observers]) {
      observer.onEntityUpdate(entityId, state, attributes);
    }
  }

  getEntity(entityId) {
    return this.entityStates.get(entityId) || null;
  }

  get observerCount() {
    return this.observers.length;
  }
}
