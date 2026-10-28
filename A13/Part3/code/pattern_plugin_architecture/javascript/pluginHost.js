class PluginHost {
  constructor() {
    this.contexts = new Set();
    this.handlers = []; // { pluginId, type, fn }
  }

  install(pluginId, setup) {
    this.contexts.add(pluginId);
    const addHandler = (type, fn) => this.handlers.push({ pluginId, type, fn });
    setup(addHandler); // an error here propagates; handlers added so far stay registered
  }

  abort(pluginId) {
    if (!this.contexts.delete(pluginId)) return;
    this.handlers = this.handlers.filter(h => h.pluginId !== pluginId);
  }

  getHandlers(type) {
    return this.handlers.filter(h => h.type === type).map(h => h.fn);
  }
}

module.exports = { PluginHost };
