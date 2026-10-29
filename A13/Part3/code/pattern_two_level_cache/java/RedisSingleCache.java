import java.util.function.LongSupplier;
import java.util.function.Supplier;

/** The second level (Redis in Misskey). */
interface RemoteStore {
    String get(String key);
    void set(String key, String value);
    void delete(String key);
}

class MemorySingleCache {
    private final long lifetime;
    private final LongSupplier clock;
    private String value;
    private Long cachedAt;

    MemorySingleCache(long lifetime, LongSupplier clock) {
        this.lifetime = lifetime;
        this.clock = clock;
    }

    void set(String value) {
        this.value = value;
        this.cachedAt = clock.getAsLong();
    }

    String get() {
        if (cachedAt == null) return null;
        if (clock.getAsLong() - cachedAt > lifetime) {
            delete();
            return null;
        }
        return value;
    }

    void delete() {
        value = null;
        cachedAt = null;
    }
}

public class RedisSingleCache {
    private final RemoteStore redis;
    private final String key;
    private final MemorySingleCache memory;
    private final Supplier<String> fetcher;

    public RedisSingleCache(RemoteStore redis, String name, long memoryLifetime, Supplier<String> fetcher, LongSupplier clock) {
        this.redis = redis;
        this.key = "singlecache:" + name;
        this.memory = new MemorySingleCache(memoryLifetime, clock);
        this.fetcher = fetcher;
    }

    public void set(String value) {
        memory.set(value);
        redis.set(key, value);
    }

    public String get() {
        String cached = memory.get();
        if (cached != null) return cached;
        String remote = redis.get(key);
        if (remote == null) return null;
        memory.set(remote);
        return remote;
    }

    public void delete() {
        memory.delete();
        redis.delete(key);
    }

    public String fetch() {
        String cached = get();
        if (cached != null) return cached;
        String value = fetcher.get();
        set(value);
        return value;
    }
}
