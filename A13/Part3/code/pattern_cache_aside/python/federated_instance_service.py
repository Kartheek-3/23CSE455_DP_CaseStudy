from collections import namedtuple

Instance = namedtuple("Instance", "host id")


class InMemoryInstanceRepository:
    def __init__(self):
        self._rows = {}
        self.finds = 0    # counters let the tests see whether the database was used
        self.inserts = 0

    def find_one_by_host(self, host):
        self.finds += 1
        return self._rows.get(host)

    def insert_one(self, host):
        self.inserts += 1
        row = Instance(host, len(self._rows) + 1)
        self._rows[host] = row
        return row


class KeyValueCache:
    def __init__(self):
        self._items = {}

    def has(self, key):
        return key in self._items

    def get(self, key):
        return self._items.get(key)

    def set(self, key, value):
        self._items[key] = value

    def dispose(self):
        self._items.clear()


class FederatedInstanceService:
    def __init__(self, repository, cache):
        self._repository = repository
        self._cache = cache

    def fetch_or_register(self, host):
        host = host.lower()
        cached = self._cache.get(host)
        if cached is not None:
            return cached
        found = self._repository.find_one_by_host(host)
        if found is None:
            found = self._repository.insert_one(host)
        self._cache.set(host, found)
        return found

    def lookup(self, host):
        host = host.lower()
        if self._cache.has(host):
            return self._cache.get(host)
        found = self._repository.find_one_by_host(host)
        self._cache.set(host, found)
        return found
