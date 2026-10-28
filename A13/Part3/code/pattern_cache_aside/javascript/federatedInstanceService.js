class InMemoryInstanceRepository {
  constructor() {
    this.rows = new Map();
    this.finds = 0; // counters let the tests see whether the database was used
    this.inserts = 0;
  }

  findOneByHost(host) {
    this.finds++;
    return this.rows.get(host) ?? null;
  }

  insertOne(host) {
    this.inserts++;
    const row = { host, id: this.rows.size + 1 };
    this.rows.set(host, row);
    return row;
  }
}

class KeyValueCache {
  constructor() { this.items = new Map(); }
  has(key) { return this.items.has(key); }
  get(key) { return this.items.get(key); }
  set(key, value) { this.items.set(key, value); }
  dispose() { this.items.clear(); }
}

class FederatedInstanceService {
  constructor(repository, cache) {
    this.repository = repository;
    this.cache = cache;
  }

  fetchOrRegister(host) {
    host = host.toLowerCase();
    const cached = this.cache.get(host);
    if (cached) return cached;
    let found = this.repository.findOneByHost(host);
    if (found == null) found = this.repository.insertOne(host);
    this.cache.set(host, found);
    return found;
  }

  lookup(host) {
    host = host.toLowerCase();
    if (this.cache.has(host)) return this.cache.get(host);
    const found = this.repository.findOneByHost(host);
    this.cache.set(host, found);
    return found;
  }
}

module.exports = { FederatedInstanceService, InMemoryInstanceRepository, KeyValueCache };
