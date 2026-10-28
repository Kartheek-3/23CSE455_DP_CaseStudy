import java.lang.reflect.*;
import java.util.*;
/** Sandbox-only JUnit-5-subset runner: runs @Test methods (after @BeforeEach) of the named classes. */
public class MiniRunner {
    public static void main(String[] args) throws Exception {
        int pass = 0, fail = 0;
        for (String cn : args) {
            Class<?> c = Class.forName(cn);
            List<Method> tests = new ArrayList<>();
            Method before = null;
            for (Method m : c.getDeclaredMethods()) {
                if (m.isAnnotationPresent(org.junit.jupiter.api.Test.class)) tests.add(m);
                if (m.isAnnotationPresent(org.junit.jupiter.api.BeforeEach.class)) before = m;
            }
            tests.sort(Comparator.comparing(Method::getName));
            for (Method t : tests) {
                Constructor<?> k = c.getDeclaredConstructor(); k.setAccessible(true);
                Object o = k.newInstance();
                try {
                    if (before != null) { before.setAccessible(true); before.invoke(o); }
                    t.setAccessible(true); t.invoke(o);
                    pass++; System.out.println("PASS " + c.getSimpleName() + "." + t.getName());
                } catch (InvocationTargetException e) {
                    fail++; System.out.println("FAIL " + c.getSimpleName() + "." + t.getName() + " -> " + e.getCause());
                }
            }
        }
        System.out.println("RESULT passed=" + pass + " failed=" + fail + " total=" + (pass + fail));
        System.exit(fail == 0 ? 0 : 1);
    }
}
