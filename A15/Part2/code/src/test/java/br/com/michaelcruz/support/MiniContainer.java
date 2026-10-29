package br.com.michaelcruz.support;

import jakarta.enterprise.event.Event;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;

import java.lang.reflect.*;
import java.util.*;

/**
 * Minimal CDI-like container for unit tests: instantiates beans, injects every @Inject field by type
 * and gives Event&lt;T&gt; fields a synchronous dispatcher to every bean method with an @Observes parameter.
 */
public final class MiniContainer {

    private final List<Object> beans = new ArrayList<>();
    private final FakeEntityManager db = new FakeEntityManager();

    public MiniContainer() { beans.add(db.em()); }

    public FakeEntityManager db() { return db; }

    public <T> T add(Class<T> type) {
        try {
            Constructor<T> k = type.getDeclaredConstructor();
            k.setAccessible(true);
            T bean = k.newInstance();
            beans.add(bean);
            return bean;
        } catch (ReflectiveOperationException e) { throw new IllegalStateException(e); }
    }

    public <T> T get(Class<T> type) {
        for (Object b : beans) if (type.isInstance(b)) return type.cast(b);
        throw new IllegalStateException("no bean of type " + type.getName());
    }

    /** Performs field injection on all registered beans (what CDI does at startup). */
    public MiniContainer wire() {
        for (Object bean : List.copyOf(beans)) {
            for (Field f : allFields(bean.getClass())) {
                if (!f.isAnnotationPresent(Inject.class)) continue;
                f.setAccessible(true);
                try { f.set(bean, resolve(f)); } catch (IllegalAccessException e) { throw new IllegalStateException(e); }
            }
        }
        return this;
    }

    private Object resolve(Field f) {
        if (f.getType() == Event.class) {
            Type arg = ((ParameterizedType) f.getGenericType()).getActualTypeArguments()[0];
            return Proxy.newProxyInstance(Event.class.getClassLoader(), new Class<?>[]{Event.class}, (proxy, m, a) -> {
                if (m.getName().equals("fire")) { dispatch((Class<?>) arg, a[0]); return null; }
                throw new UnsupportedOperationException(m.getName());
            });
        }
        return get(f.getType());
    }

    private void dispatch(Class<?> eventType, Object event) {
        for (Object bean : beans) {
            for (Method m : bean.getClass().getDeclaredMethods()) {
                if (m.getParameterCount() != 1) continue;
                if (!m.getParameters()[0].isAnnotationPresent(Observes.class)) continue;
                if (!m.getParameterTypes()[0].isAssignableFrom(eventType)) continue;
                try { m.setAccessible(true); m.invoke(bean, event); }
                catch (InvocationTargetException e) { throw (RuntimeException) e.getCause(); }
                catch (IllegalAccessException e) { throw new IllegalStateException(e); }
            }
        }
    }

    private static List<Field> allFields(Class<?> c) {
        List<Field> r = new ArrayList<>();
        for (Class<?> k = c; k != null && k != Object.class; k = k.getSuperclass()) r.addAll(Arrays.asList(k.getDeclaredFields()));
        return r;
    }
}
