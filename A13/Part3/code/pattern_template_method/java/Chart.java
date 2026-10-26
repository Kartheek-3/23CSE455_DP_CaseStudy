import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public abstract class Chart {
    private static final String COLUMN_PREFIX = "___";
    private static final int RANGE_MAX = 1000;
    final List<Map<String, Integer>> rows = new ArrayList<>();

    protected abstract Map<String, Integer> tickMajor(String group);

    protected abstract Map<String, Integer> tickMinor(String group);

    public final Map<String, Integer> tick(boolean major, String group) {
        Map<String, Integer> data = major ? tickMajor(group) : tickMinor(group);
        Map<String, Integer> columns = new TreeMap<>();
        for (Map.Entry<String, Integer> e : data.entrySet()) {
            int clamped = Math.max(0, Math.min(RANGE_MAX, e.getValue()));
            columns.put(COLUMN_PREFIX + e.getKey().replace('.', '_'), clamped);
        }
        if (!columns.isEmpty()) rows.add(columns);
        return columns;
    }
}

class UsersChart extends Chart {
    protected Map<String, Integer> tickMajor(String group) {
        return Map.of("total", 1500, "local.total", 40);
    }

    protected Map<String, Integer> tickMinor(String group) {
        return Map.of("local.total", 41);
    }
}

class NotesChart extends Chart {
    protected Map<String, Integer> tickMajor(String group) {
        return Map.of("total", -5);
    }

    protected Map<String, Integer> tickMinor(String group) {
        return Map.of();
    }
}
