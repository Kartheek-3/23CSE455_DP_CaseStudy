import java.util.HashMap;
import java.util.Map;

/** Strategy pattern: ride fare per ride type (mirrors Part2 src/domain/pricing/FareStrategy.ts). */
public final class RideFare {
    private RideFare() {}

    public record Trip(String rideType, double km, int days, double hours) {}

    public static final class FareException extends RuntimeException {
        public final String code;
        public FareException(String code) {
            super(code);
            this.code = code;
        }
    }

    public interface FareStrategy {
        long calculate(Trip trip);
    }

    public static final class OneWayFare implements FareStrategy {
        public long calculate(Trip t) {
            if (t.km() <= 0) throw new FareException("INVALID_INPUT");
            return Math.round(Math.max(450, t.km() * 10));
        }
    }

    public static final class RoundTripFare implements FareStrategy {
        public long calculate(Trip t) {
            if (t.days() < 1) throw new FareException("INVALID_INPUT");
            return t.days() * 1000L;
        }
    }

    public static final class HourlyFare implements FareStrategy {
        public long calculate(Trip t) {
            if (t.hours() <= 0) throw new FareException("INVALID_INPUT");
            return Math.max(4, (long) Math.ceil(t.hours())) * 200L;
        }
    }

    public static final class OutstationFare implements FareStrategy {
        public long calculate(Trip t) {
            if (t.km() <= 0 || t.days() < 1) throw new FareException("INVALID_INPUT");
            return Math.round(t.km() * 12 + t.days() * 300);
        }
    }

    /** Context: registry of strategies keyed by ride type. */
    public static final class FareCalculator {
        private final Map<String, FareStrategy> strategies = new HashMap<>();

        public FareCalculator() {
            register("ONE_WAY", new OneWayFare());
            register("ROUND_TRIP", new RoundTripFare());
            register("HOURLY", new HourlyFare());
            register("OUTSTATION", new OutstationFare());
        }

        public void register(String rideType, FareStrategy strategy) {
            strategies.put(rideType, strategy);
        }

        public long calculate(Trip trip) {
            FareStrategy strategy = strategies.get(trip.rideType());
            if (strategy == null) throw new FareException("UNKNOWN_RIDE_TYPE");
            return strategy.calculate(trip);
        }
    }
}
