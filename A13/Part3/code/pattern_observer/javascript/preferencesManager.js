const { EventEmitter } = require('events');

// The subject is a plain Node EventEmitter; observers subscribe with on('committed', fn).
class PreferencesManager extends EventEmitter {
  constructor() {
    super();
    this.state = new Map();
  }

  commit(key, value) {
    if (this.state.has(key) && this.state.get(key) === value) return; // unchanged: not announced
    this.state.set(key, value);
    // As in manager.ts:261-271, oldValue is read after the state was updated, so it equals value.
    this.emit('committed', { key, value, oldValue: this.state.get(key) });
  }
}

module.exports = { PreferencesManager };
