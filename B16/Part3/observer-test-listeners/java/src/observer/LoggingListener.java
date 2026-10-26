package observer;

import java.util.ArrayList;
import java.util.List;

/** Writes one log line per event. */
public final class LoggingListener implements TestExecutionListener {

    private final List<String> lines = new ArrayList<>();

    @Override
    public void executionStarted(String testId) {
        lines.add("started " + testId);
    }

    @Override
    public void executionSkipped(String testId, String reason) {
        lines.add("skipped " + testId + " (" + reason + ")");
    }

    @Override
    public void executionFinished(String testId, Status status) {
        lines.add("finished " + testId + " " + status);
    }

    public String render() {
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < lines.size(); i++) {
            out.append(i + 1).append(". ").append(lines.get(i)).append('\n');
        }
        return out.toString();
    }
}
