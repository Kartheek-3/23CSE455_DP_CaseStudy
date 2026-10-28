import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.ResolverStyle;
import java.util.List;

/**
 * Template Method: date/daily setpoint interpolation.
 * Derived from mycodo/utils/method.py (DateMethod.calculate_setpoint with the ignore_date hook,
 * DailyMethod overriding the hook). Method rows are plain objects instead of database rows.
 */
public class DateMethod {
    static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("uuuu-MM-dd HH:mm:ss").withResolverStyle(ResolverStyle.STRICT);
    static final DateTimeFormatter TIME_FORMAT =
            DateTimeFormatter.ofPattern("HH:mm:ss").withResolverStyle(ResolverStyle.STRICT);
    static final LocalDate BASE_DAY = LocalDate.of(1900, 1, 1);

    private final List<MethodRow> methodDataAll;

    public DateMethod(List<MethodRow> rows) {
        this.methodDataAll = rows;
    }

    /** Hook: false means the date part of the date-time is considered. */
    protected boolean ignoreDate() {
        return false;
    }

    /** Template method: returns (setpoint or null, ended). */
    public final Setpoint calculateSetpoint(String nowText) {
        LocalDateTime now = LocalDateTime.parse(nowText, DATE_FORMAT);
        if (ignoreDate()) {
            now = now.toLocalTime().atDate(BASE_DAY);
        }
        for (MethodRow row : methodDataAll) {
            LocalDateTime startTime = parse(row.timeStart);
            LocalDateTime endTime = parse(row.timeEnd);
            if (startTime.isBefore(now) && now.isBefore(endTime)) {
                double setpointStart = row.setpointStart;
                double setpointEnd = row.setpointEnd != null ? row.setpointEnd : setpointStart;
                double setpointDiff = Math.abs(setpointEnd - setpointStart);
                double totalSeconds = Duration.between(startTime, endTime).getSeconds();
                double partSeconds = Duration.between(startTime, now).getSeconds();
                double percentTotal = partSeconds / totalSeconds;
                double value = setpointStart < setpointEnd
                        ? setpointStart + setpointDiff * percentTotal
                        : setpointStart - setpointDiff * percentTotal;
                return new Setpoint(value, false);
            }
        }
        return new Setpoint(null, false);
    }

    private LocalDateTime parse(String text) {
        return ignoreDate() ? LocalTime.parse(text, TIME_FORMAT).atDate(BASE_DAY)
                            : LocalDateTime.parse(text, DATE_FORMAT);
    }
}

/** Repeats every day: only the time of day is compared. */
class DailyMethod extends DateMethod {
    DailyMethod(List<MethodRow> rows) {
        super(rows);
    }

    @Override
    protected boolean ignoreDate() {
        return true;
    }
}

/** One row of method data: a time span and the setpoints at its start and end. */
final class MethodRow {
    final String timeStart;
    final String timeEnd;
    final double setpointStart;
    final Double setpointEnd;

    MethodRow(String timeStart, String timeEnd, double setpointStart, Double setpointEnd) {
        this.timeStart = timeStart;
        this.timeEnd = timeEnd;
        this.setpointStart = setpointStart;
        this.setpointEnd = setpointEnd;
    }
}

/** Result pair (setpoint, ended); value is null when no row matches. */
final class Setpoint {
    final Double value;
    final boolean ended;

    Setpoint(Double value, boolean ended) {
        this.value = value;
        this.ended = ended;
    }
}
