import java.util.HashMap;
import java.util.Map;

record Instance(String host, int id) {}

class InMemoryInstanceRepository {
    private final Map<String, Instance> rows = new HashMap<>();
    int finds = 0;    // counters let the tests see whether the database was used
    int inserts = 0;

    Instance findOneByHost(String host) {
        finds++;
        return rows.get(host);
    }

    Instance insertOne(String host) {
        inserts++;
        Instance row = new Instance(host, rows.size() + 1);
        rows.put(host, row);
        return row;
    }
}

class KeyValueCache {
    private final Map<String, Instance> items = new HashMap<>();

    boolean has(String key) { return items.containsKey(key); }

    Instance get(String key) { return items.get(key); }

    void set(String key, Instance value) { items.put(key, value); }

    void dispose() { items.clear(); }
}

public class FederatedInstanceService {
    private final InMemoryInstanceRepository repository;
    private final KeyValueCache cache;

    public FederatedInstanceService(InMemoryInstanceRepository repository, KeyValueCache cache) {
        this.repository = repository;
        this.cache = cache;
    }

    public Instance fetchOrRegister(String host) {
        host = host.toLowerCase();
        Instance cached = cache.get(host);
        if (cached != null) return cached;
        Instance found = repository.findOneByHost(host);
        if (found == null) found = repository.insertOne(host);
        cache.set(host, found);
        return found;
    }

    public Instance lookup(String host) {
        host = host.toLowerCase();
        if (cache.has(host)) return cache.get(host);
        Instance found = repository.findOneByHost(host);
        cache.set(host, found);
        return found;
    }
}
