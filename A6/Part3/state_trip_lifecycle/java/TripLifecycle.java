/** State pattern: trip lifecycle (mirrors Part2 src/domain/booking/TripState.ts). */
public final class TripLifecycle {
    private TripLifecycle() {}

    public static final class InvalidTransition extends RuntimeException {
        public InvalidTransition(String event, String state) {
            super("INVALID_TRANSITION: cannot " + event + " when " + state);
        }
    }

    public interface TripState {
        String name();
        TripState accept();
        TripState complete();
        TripState cancel();
        TripState reject();
        TripState expire();
    }

    /** Every event is refused unless a concrete state overrides it. */
    abstract static class BaseState implements TripState {
        private TripState refuse(String event) {
            throw new InvalidTransition(event, name());
        }
        public TripState accept() { return refuse("accept"); }
        public TripState complete() { return refuse("complete"); }
        public TripState cancel() { return refuse("cancel"); }
        public TripState reject() { return refuse("reject"); }
        public TripState expire() { return refuse("expire"); }
    }

    static final class Pending extends BaseState {
        public String name() { return "PENDING"; }
        public TripState accept() { return new Confirmed(); }
        public TripState cancel() { return new Finished("CANCELLED"); }
        public TripState reject() { return new Finished("REJECTED"); }
        public TripState expire() { return new Finished("EXPIRED"); }
    }

    static final class Confirmed extends BaseState {
        public String name() { return "CONFIRMED"; }
        public TripState complete() { return new Finished("COMPLETED"); }
        public TripState cancel() { return new Finished("CANCELLED"); }
        public TripState reject() { return new Finished("REJECTED"); }
    }

    /** COMPLETED, CANCELLED, REJECTED and EXPIRED accept no events. */
    static final class Finished extends BaseState {
        private final String name;
        Finished(String name) { this.name = name; }
        public String name() { return name; }
    }

    /** Context. */
    public static final class Trip {
        private TripState state = new Pending();

        public String status() { return state.name(); }

        public void apply(String event) {
            state = switch (event) {
                case "accept" -> state.accept();
                case "complete" -> state.complete();
                case "cancel" -> state.cancel();
                case "reject" -> state.reject();
                case "expire" -> state.expire();
                default -> throw new IllegalArgumentException("unknown event " + event);
            };
        }
    }
}
