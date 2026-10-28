public class StateTest {
    static int passed = 0;
    static int total = 0;

    static void check(String label, String actual, String expected) {
        total++;
        if (!actual.equals(expected)) {
            throw new AssertionError(label + ": expected " + expected + " got " + actual);
        }
        passed++;
    }

    public static void main(String[] args) {
        ChargingSession session = new ChargingSession();
        check("initial", session.state(), "idle");
        check("startCharge-invalid", session.startCharge(), "error");
        check("state-unchanged", session.state(), "idle");
        check("errors", String.join(",", session.errors), "startCharge@idle");
        check("plugIn", session.plugIn(), "plugged_in");
        check("state-plugged", session.state(), "plugged_in");
        check("removeCable-back", session.removeCable(), "idle");

        session.plugIn();
        check("startCharge", session.startCharge(), "charging");
        check("state-charging", session.state(), "charging");
        check("removeCable-invalid", session.removeCable(), "error");
        check("finishCharge", session.finishCharge(), "completed");
        check("state-completed", session.state(), "completed");
        check("removeCable-done", session.removeCable(), "idle");

        System.out.println("STATE_JAVA PASS " + passed + "/" + total);
    }
}
