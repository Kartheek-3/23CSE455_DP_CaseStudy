package org.junit.jupiter.api;
public final class Assertions {
    public static class AssertionFailedError extends AssertionError { public AssertionFailedError(String m) { super(m); } }
    private Assertions() {}
    public static void assertTrue(boolean c) { if (!c) throw new AssertionFailedError("expected true"); }
    public static void assertTrue(boolean c, String m) { if (!c) throw new AssertionFailedError(m); }
    public static void assertFalse(boolean c) { if (c) throw new AssertionFailedError("expected false"); }
    public static void assertNull(Object o) { if (o != null) throw new AssertionFailedError("expected null but was " + o); }
    public static void assertNotNull(Object o) { if (o == null) throw new AssertionFailedError("expected non-null"); }
    public static void assertEquals(Object e, Object a) { if (!java.util.Objects.equals(e, a)) throw new AssertionFailedError("expected <" + e + "> but was <" + a + ">"); }
    public static void assertEquals(double e, double a, double d) { if (Math.abs(e - a) > d) throw new AssertionFailedError("expected <" + e + "> but was <" + a + ">"); }
    public static void assertEquals(long e, long a) { if (e != a) throw new AssertionFailedError("expected <" + e + "> but was <" + a + ">"); }
    public static <T extends Throwable> T assertThrows(Class<T> type, Runnable r) {
        try { r.run(); } catch (Throwable t) {
            if (type.isInstance(t)) return type.cast(t);
            throw new AssertionFailedError("expected " + type.getSimpleName() + " but got " + t);
        }
        throw new AssertionFailedError("expected " + type.getSimpleName() + " but nothing was thrown");
    }
}
