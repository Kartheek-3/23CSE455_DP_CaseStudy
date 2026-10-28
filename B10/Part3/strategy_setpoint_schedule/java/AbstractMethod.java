import java.util.ArrayList;
import java.util.List;

/**
 * Strategy: setpoint schedule calculation.
 * Derived from mycodo/utils/method.py (AbstractMethod, DailySineMethod, DurationMethod, CascadeMethod,
 * create_method_handler, sine_wave_y_out). Times are plain seconds; method data rows are number arrays
 * instead of database rows; CascadeMethod receives its linked strategies directly.
 * AbstractMethod is the strategy interface and the neutral fallback strategy.
 */
public class AbstractMethod {
    public Setpoint calculateSetpoint(double now, double methodStartTime) {
        return new Setpoint(null, false);
    }

    /** Selects the strategy for a method type; unknown types fall back to AbstractMethod. */
    public static AbstractMethod createMethodHandler(String methodType, List<double[]> rows,
                                                     List<AbstractMethod> linkedMethods) {
        switch (methodType) {
            case "DailySine":
                if (rows.size() != 1 || rows.get(0).length != 4)
                    throw new IllegalArgumentException("DailySine needs exactly one row of 4 numbers");
                double[] p = rows.get(0);
                return new DailySineMethod(p[0], p[1], p[2], p[3]);
            case "Duration":
                for (double[] row : rows)
                    if (row.length != 3) throw new IllegalArgumentException("Duration rows need exactly 3 numbers");
                return new DurationMethod(rows);
            case "Cascade":
                return new CascadeMethod(linkedMethods == null ? new ArrayList<>() : linkedMethods);
            default:
                return new AbstractMethod();
        }
    }
}

class DailySineMethod extends AbstractMethod {
    private final double amplitude, frequency, shiftAngle, shiftY;

    DailySineMethod(double amplitude, double frequency, double shiftAngle, double shiftY) {
        this.amplitude = amplitude;
        this.frequency = frequency;
        this.shiftAngle = shiftAngle;
        this.shiftY = shiftY;
    }

    static double sineWaveYOut(double amplitude, double frequency, double shiftAngle, double shiftY, double angleIn) {
        return amplitude * Math.sin(Math.toRadians(frequency * (angleIn - shiftAngle))) + shiftY;
    }

    @Override
    public Setpoint calculateSetpoint(double now, double methodStartTime) {
        double secondsOfDay = Math.floorMod((long) Math.floor(now), 86400L);
        double angle = secondsOfDay / 86400 * 360;
        return new Setpoint(sineWaveYOut(amplitude, frequency, shiftAngle, shiftY, angle), false);
    }
}

/** Rows (duration_sec, setpoint_start, setpoint_end); a row with duration 0 is the repeat row. */
class DurationMethod extends AbstractMethod {
    private final List<double[]> methodDataAll;

    DurationMethod(List<double[]> rows) {
        this.methodDataAll = rows;
    }

    double cycleDuration() {
        double total = 0;
        for (double[] row : methodDataAll) total += row[0];
        return total;
    }

    Double repeatDuration() {
        for (double[] row : methodDataAll)
            if (row[0] == 0) return row[2];
        return null;
    }

    @Override
    public Setpoint calculateSetpoint(double now, double methodStartTime) {
        double durationInSeconds = cycleDuration();
        double secondsFromStart = now - methodStartTime;
        if (secondsFromStart >= durationInSeconds) {
            Double repeatDuration = repeatDuration();
            if (repeatDuration == null || (0 < repeatDuration && repeatDuration <= secondsFromStart))
                return new Setpoint(null, true);
            secondsFromStart = secondsFromStart % durationInSeconds;
        }
        double totalSec = 0, previousTotalSec = 0;
        for (double[] row : methodDataAll) {
            totalSec += row[0];
            if (previousTotalSec <= secondsFromStart && secondsFromStart < totalSec) {
                double percentRow = (secondsFromStart - previousTotalSec) / row[0];
                double setpointDiff = Math.abs(row[2] - row[1]);
                return new Setpoint(row[1] < row[2] ? row[1] + setpointDiff * percentRow
                                                    : row[1] - setpointDiff * percentRow, false);
            }
            previousTotalSec = totalSec;
        }
        return new Setpoint(previousTotalSec, false);
    }
}

/** Context: multiplies the setpoints of its linked strategies (each taken as a percentage). */
class CascadeMethod extends AbstractMethod {
    private final List<AbstractMethod> linkedMethods;

    CascadeMethod(List<AbstractMethod> linkedMethods) {
        this.linkedMethods = linkedMethods;
    }

    @Override
    public Setpoint calculateSetpoint(double now, double methodStartTime) {
        double setpoint = 1.0;
        for (AbstractMethod linkedMethod : linkedMethods) {
            Setpoint linked = linkedMethod.calculateSetpoint(now, methodStartTime);
            if (linked.value != null) setpoint *= linked.value / 100.0;
            if (linked.ended) return new Setpoint(null, true);
        }
        return new Setpoint(setpoint * 100.0, false);
    }
}

/** Result pair (setpoint, ended); value is null for None. */
final class Setpoint {
    final Double value;
    final boolean ended;

    Setpoint(Double value, boolean ended) {
        this.value = value;
        this.ended = ended;
    }
}
