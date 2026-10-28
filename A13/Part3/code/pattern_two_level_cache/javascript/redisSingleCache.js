class MemorySingleCache {
  constructor(lifetime, clock) {
    this.lifetime = lifetime;
    this.clock = clock;
    this.value = undefined;
    this.cachedAt = null;
  }

  set(value) {
    this.value = value;
    this.cachedAt = this.clock();
  }

  get() {
    if (this.cachedAt == null) return undefined;
    if (this.clock() - this.cachedAt > this.lifetime) {
      this.delete();
      return undefined;
    }
    return this.value;
  }

  delete() {
    this.value = undefined;
    this.cachedAt = null;
  }
}

class RedisSingleCache {
  constructor(redis, name, memoryLifetime, fetcher, clock) {
    this.redis = redis;
    this.key = 'singlecache:' + name;
    this.memory = new MemorySingleCache(memoryLifetime, clock);
    this.fetcher = fetcher;
  }

  set(value) {
    this.memory.set(value);
    this.redis.set(this.key, value);
  }

  get() {
    const cached = this.memory.get();
    if (cached !== undefined) return cached;
    const remote = this.redis.get(this.key);
    if (remote === undefined) return undefined;
    this.memory.set(remote);
    return remote;
  }

  delete() {
    this.memory.delete();
    this.redis.delete(this.key);
  }

  fetch() {
    const cached = this.get();
    if (cached !== undefined) return cached;
    const value = this.fetcher();
    this.set(value);
    return value;
  }
}

module.exports = { RedisSingleCache };
