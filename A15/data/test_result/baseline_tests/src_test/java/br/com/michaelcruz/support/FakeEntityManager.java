package br.com.michaelcruz.support;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Proxy;
import java.util.*;

/**
 * In-memory stand-in for the JPA EntityManager used by the unit tests (no database needed).
 * Supports exactly the calls the application makes: find, persist, merge, createQuery("SELECT x FROM X x").
 * persist() assigns sequential ids per entity class starting at 1, like an IDENTITY column.
 */
public final class FakeEntityManager {

    private final Map<Class<?>, Map<Object, Object>> tables = new HashMap<>();
    private final Map<Class<?>, Long> sequences = new HashMap<>();
    private final EntityManager proxy;

    public FakeEntityManager() {
        InvocationHandler h = (p, m, a) -> switch (m.getName()) {
            case "find" -> table((Class<?>) a[0]).get(a[1]);
            case "persist" -> { persist(a[0]); yield null; }
            case "merge" -> { table(a[0].getClass()).put(idOf(a[0]), a[0]); yield a[0]; }
            case "createQuery" -> query((Class<?>) a[1]);
            default -> throw new UnsupportedOperationException(m.getName());
        };
        this.proxy = (EntityManager) Proxy.newProxyInstance(
                EntityManager.class.getClassLoader(), new Class<?>[]{EntityManager.class}, h);
    }

    public EntityManager em() { return proxy; }

    public int count(Class<?> type) { return table(type).size(); }

    private Map<Object, Object> table(Class<?> c) { return tables.computeIfAbsent(c, k -> new LinkedHashMap<>()); }

    private void persist(Object entity) {
        long next = sequences.merge(entity.getClass(), 1L, Long::sum);
        setId(entity, next);
        table(entity.getClass()).put(next, entity);
    }

    private Object query(Class<?> type) {
        return Proxy.newProxyInstance(TypedQuery.class.getClassLoader(), new Class<?>[]{TypedQuery.class},
                (p, m, a) -> new ArrayList<>(table(type).values()));
    }

    private static Field idField(Object e) throws NoSuchFieldException {
        Field f = e.getClass().getDeclaredField("id");
        f.setAccessible(true);
        return f;
    }

    private static Object idOf(Object e) {
        try { return idField(e).get(e); } catch (ReflectiveOperationException ex) { throw new IllegalStateException(ex); }
    }

    private static void setId(Object e, Object id) {
        try { idField(e).set(e, id); } catch (ReflectiveOperationException ex) { throw new IllegalStateException(ex); }
    }
}
