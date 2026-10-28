import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class EntityNotFound extends RuntimeException {
    EntityNotFound() {
        super("EntityNotFound");
    }
}

/** Misskey's extension: insert, then read the stored row back (miRepository.insertOne). */
interface MiRepository {
    Map<String, String> insert(Map<String, String> entity);

    Map<String, String> findOneOrFail(Map<String, String> criteria);

    default Map<String, String> insertOne(Map<String, String> entity) {
        Map<String, String> identifiers = insert(entity);
        return findOneOrFail(identifiers);
    }
}

/** Stands in for TypeORM's Repository<T>: the persistence side. */
public class InMemoryRepository {
    private final List<Map<String, String>> rows = new ArrayList<>();
    private int lastId = 0;

    public Map<String, String> insert(Map<String, String> entity) {
        Map<String, String> row = new HashMap<>(entity);
        row.put("id", String.valueOf(++lastId));
        rows.add(row);
        return Map.of("id", row.get("id"));
    }

    public Map<String, String> findOneBy(Map<String, String> criteria) {
        for (Map<String, String> row : rows) {
            if (criteria.entrySet().stream().allMatch(e -> e.getValue().equals(row.get(e.getKey())))) return row;
        }
        return null;
    }

    public Map<String, String> findOneOrFail(Map<String, String> criteria) {
        Map<String, String> row = findOneBy(criteria);
        if (row == null) throw new EntityNotFound();
        return row;
    }

    public int count() {
        return rows.size();
    }
}

class UsersRepository extends InMemoryRepository implements MiRepository {}

class UserService {
    private final UsersRepository users;

    UserService(UsersRepository users) {
        this.users = users;
    }

    Map<String, String> register(String name) { return users.insertOne(Map.of("name", name)); }

    Map<String, String> findByName(String name) { return users.findOneBy(Map.of("name", name)); }

    Map<String, String> getByName(String name) { return users.findOneOrFail(Map.of("name", name)); }

    int count() { return users.count(); }
}
