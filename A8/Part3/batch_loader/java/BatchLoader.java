import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

public class BatchLoader<K, V> {

    public static class Ticket<V> {
        private V value;

        public V get() {
            return value;
        }
    }

    private final Function<List<K>, List<V>> batchFn;
    private final Map<K, Ticket<V>> cache = new HashMap<>();
    private List<K> pending = new ArrayList<>();

    public BatchLoader(Function<List<K>, List<V>> batchFn) {
        this.batchFn = batchFn;
    }

    public Ticket<V> load(K key) {
        if (!cache.containsKey(key)) {
            cache.put(key, new Ticket<>());
            pending.add(key);
        }
        return cache.get(key);
    }

    public void dispatch() {
        if (pending.isEmpty()) {
            return;
        }
        List<K> keys = pending;
        pending = new ArrayList<>();
        List<V> values = batchFn.apply(keys);
        for (int i = 0; i < keys.size(); i++) {
            cache.get(keys.get(i)).value = values.get(i);
        }
    }
}

record User(String id, String name) {
}

class UserRepository {
    private final List<User> users;
    final List<String> queries = new ArrayList<>();

    UserRepository(List<User> users) {
        this.users = users;
    }

    List<User> findByIds(List<String> ids) {
        queries.add(String.join(",", ids));
        List<User> found = new ArrayList<>();
        for (User user : users) {
            if (ids.contains(user.id())) {
                found.add(user);
            }
        }
        return found;
    }
}

class UserBatch {
    static Function<List<String>, List<User>> create(UserRepository repo) {
        return ids -> {
            Map<String, User> byId = new HashMap<>();
            for (User user : repo.findByIds(ids)) {
                byId.put(user.id(), user);
            }
            List<User> ordered = new ArrayList<>();
            for (String id : ids) {
                ordered.add(byId.get(id));
            }
            return ordered;
        };
    }
}
