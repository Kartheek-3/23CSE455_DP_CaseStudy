class MemorySingleCache:
    def __init__(self, lifetime, clock):
        self._lifetime = lifetime
        self._clock = clock
        self._value = None
        self._cached_at = None

    def set(self, value):
        self._value = value
        self._cached_at = self._clock()

    def get(self):
        if self._cached_at is None:
            return None
        if self._clock() - self._cached_at > self._lifetime:
            self.delete()
            return None
        return self._value

    def delete(self):
        self._value = None
        self._cached_at = None


class RedisSingleCache:
    def __init__(self, redis, name, memory_lifetime, fetcher, clock):
        self._redis = redis
        self._key = "singlecache:" + name
        self._memory = MemorySingleCache(memory_lifetime, clock)
        self._fetcher = fetcher

    def set(self, value):
        self._memory.set(value)
        self._redis.set(self._key, value)

    def get(self):
        cached = self._memory.get()
        if cached is not None:
            return cached
        remote = self._redis.get(self._key)
        if remote is None:
            return None
        self._memory.set(remote)
        return remote

    def delete(self):
        self._memory.delete()
        self._redis.delete(self._key)

    def fetch(self):
        cached = self.get()
        if cached is not None:
            return cached
        value = self._fetcher()
        self.set(value)
        return value
