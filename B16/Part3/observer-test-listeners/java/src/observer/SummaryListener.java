package observer;

import java.util.EnumMap;
import java.util.Map;

/** Counts results per status, like JUnit's SummaryGeneratingListener. */
public final class SummaryListener implements TestExecutionListener {

    private final Map<Status, Integer> counts = new EnumMap<>(Status.class);
    private int skipped;

    @Override
    public void executionSkipped(String testId, String reason) {
        skipped++;
    }

    @Override
    public void executionFinished(String testId, Status status) {
        counts.merge(status, 1, Integer::sum);
    }

    public String render() {
        int total = skipped;
        StringBuilder lines = new StringBuilder();
        for (Status status : Status.values()) {
            int count = counts.getOrDefault(status, 0);
            total += count;
            lines.append(status).append(": ").append(count).append('\n');
        }
        lines.append("SKIPPED: ").append(skipped).append('\n');
        return "total: " + total + "\n" + lines;
    }
}
