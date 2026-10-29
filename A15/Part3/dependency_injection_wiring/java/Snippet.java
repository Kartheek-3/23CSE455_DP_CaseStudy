import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

class MissingDependency extends RuntimeException {
    MissingDependency(String name) { super(name); }
}

interface Bean {                                 // anything the container manages
    default List<String> needs() { return List.of(); }
    default void inject(String name, Bean dep) { }
}

interface Dao extends Bean { String kind(); }
class RealDao implements Dao { public String kind() { return "real"; } }
class FakeDao implements Dao { public String kind() { return "fake"; } }

class Service implements Bean {                  // ManagedBean with one injection point (Dao); never creates it itself
    private Dao dao;
    public List<String> needs() { return List.of("Dao"); }
    public void inject(String name, Bean dep) { dao = (Dao) dep; }
    String describe() { return "Service->Dao:" + (dao == null ? "unwired" : dao.kind()); }
}

class Container {                                // Container: creates nothing, but wires every declared need
    private final Map<String, Bean> beans = new LinkedHashMap<>();
    void register(String name, Bean bean) { beans.put(name, bean); }
    Bean get(String name) { return beans.get(name); }
    void wire() {
        for (Bean bean : beans.values()) {
            for (String need : bean.needs()) {
                if (!beans.containsKey(need)) throw new MissingDependency(need);
                bean.inject(need, beans.get(need));
            }
        }
    }
}
