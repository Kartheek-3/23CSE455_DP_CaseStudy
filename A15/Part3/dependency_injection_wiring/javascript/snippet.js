class MissingDependency extends Error {}

class Bean {                                     // anything the container manages
  needs() { return []; }
  inject(name, dep) {}
}
class RealDao extends Bean { kind() { return 'real'; } }
class FakeDao extends Bean { kind() { return 'fake'; } }

class Service extends Bean {                     // ManagedBean with one injection point (Dao); never creates it itself
  constructor() { super(); this.dao = null; }
  needs() { return ['Dao']; }
  inject(name, dep) { this.dao = dep; }
  describe() { return 'Service->Dao:' + (this.dao ? this.dao.kind() : 'unwired'); }
}

class Container {                                // Container: creates nothing, but wires every declared need
  constructor() { this.beans = new Map(); }
  register(name, bean) { this.beans.set(name, bean); }
  get(name) { return this.beans.get(name); }
  wire() {
    for (const bean of this.beans.values()) {
      for (const need of bean.needs()) {
        if (!this.beans.has(need)) throw new MissingDependency(need);
        bean.inject(need, this.beans.get(need));
      }
    }
  }
}

module.exports = { Container, Service, RealDao, FakeDao, MissingDependency };
