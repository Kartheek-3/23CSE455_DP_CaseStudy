import java.util.List;
public class ObserverTest {
    private static int passed = 0;
    private static void check(boolean condition, String name) {
        if (!condition) throw new AssertionError("FAIL " + name);
        passed++;
        System.out.println("PASS " + name);
    }
    public static void main(String[] args) {
        AuthEventSource source = new AuthEventSource();
        RecordingAuthListener a = new RecordingAuthListener("observer-A");
        source.subscribe(a);
        source.publish("signed_in", "session-1");
        check(a.received().equals(List.of("observer-A receives signed_in:session-1")), "O01 sign-in delivered");
        source.publish("signed_out", "none");
        check(a.received().get(1).equals("observer-A receives signed_out:none"), "O02 sign-out delivered");
        source.unsubscribe(a);
        int before = a.received().size();
        source.publish("signed_in", "session-2");
        check(a.received().size() == before, "O03 unsubscribe stops notifications");
        RecordingAuthListener b = new RecordingAuthListener("observer-B");
        source.subscribe(a); source.subscribe(b);
        source.publish("signed_in", "session-3");
        check(a.received().get(a.received().size()-1).equals("observer-A receives signed_in:session-3")
            && b.received().equals(List.of("observer-B receives signed_in:session-3")), "O04 multiple observers notified");
        System.out.println("RESULT " + passed + "/4");
    }
}
