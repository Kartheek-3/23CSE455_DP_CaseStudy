package observer;

import java.util.Arrays;
import java.util.List;

/**
 * The subject: reads events line by line and pushes each one to its listener
 * (in this program, the composite that fans out to every registered observer).
 */
public final class EventRunner {

    private static final String REASON_PREFIX = "reason=";

    private final TestExecutionListener listener;

    public EventRunner(TestExecutionListener listener) {
        this.listener = listener;
    }

    public void run(List<String> lines) {
        for (int i = 0; i < lines.size(); i++) {
            dispatch(i + 1, lines.get(i).trim());
        }
    }

    private void dispatch(int lineNumber, String text) {
        if (text.isEmpty() || text.startsWith("#")) {
            return;
        }
        String[] fields = text.split("\\s+");
        String event = fields[0];
        switch (event) {
            case "started" -> {
                require(fields.length == 2, lineNumber, event);
                listener.executionStarted(fields[1]);
            }
            case "finished" -> {
                require(fields.length == 3, lineNumber, event);
                listener.executionFinished(fields[1], parseStatus(lineNumber, fields[2]));
            }
            case "skipped" -> {
                require(fields.length >= 3 && fields[2].startsWith(REASON_PREFIX), lineNumber, event);
                String reason = String.join(" ", Arrays.copyOfRange(fields, 2, fields.length))
                        .substring(REASON_PREFIX.length());
                require(!reason.isEmpty(), lineNumber, event);
                listener.executionSkipped(fields[1], reason);
            }
            default -> throw new EventFormatException(lineNumber, "unknown event '" + event + "'");
        }
    }

    private static Status parseStatus(int lineNumber, String text) {
        for (Status status : Status.values()) {
            if (status.name().equals(text)) {
                return status;
            }
        }
        throw new EventFormatException(lineNumber, "unknown status '" + text + "'");
    }

    private static void require(boolean condition, int lineNumber, String event) {
        if (!condition) {
            throw new EventFormatException(lineNumber, "malformed " + event + " event");
        }
    }
}
