import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// Repository pattern (architectural, data-access) -- in-memory User repository.
// Production snippet. Tests live in RepositoryTest.java.

public interface UserRepository {
    User save(User user);

    User findById(int id);

    List<User> findAll();

    boolean deleteById(int id);
}

class User {
    final int id;
    final String name;

    User(int id, String name) {
        this.id = id;
        this.name = name;
    }
}

class InMemoryUserRepository implements UserRepository {
    private final Map<Integer, User> store = new LinkedHashMap<>();

    @Override
    public User save(User user) {
        store.put(user.id, user);
        return user;
    }

    @Override
    public User findById(int id) {
        return store.get(id);
    }

    @Override
    public List<User> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public boolean deleteById(int id) {
        return store.remove(id) != null;
    }
}

class UserService {
    private final UserRepository repository;

    UserService(UserRepository repository) {
        this.repository = repository;
    }

    User register(User user) {
        return repository.save(user);
    }

    User get(int id) {
        return repository.findById(id);
    }

    List<User> all() {
        return repository.findAll();
    }

    boolean remove(int id) {
        return repository.deleteById(id);
    }
}
