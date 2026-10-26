package adapter;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Adapter, modelled on JUnit's ExecutionListenerAdapter: implements the Target, forwards to the Adaptee. */
final class ListenerAdapter implements EngineListener {

    private static final Pattern SEGMENT = Pattern.compile("\\[([a-z-]+):([^\\]]+)\\]");

    private final TestListener testListener;

    ListenerAdapter(TestListener testListener) {
        this.testListener = testListener;
    }

    static TestIdentifier toIdentifier(String uniqueId) {
        List<String[]> segments = new ArrayList<>();
        Matcher m = SEGMENT.matcher(uniqueId);
        while (m.find()) {
            segments.add(new String[] { m.group(1), m.group(2) });
        }
        String[] last = segments.get(segments.size() - 1);
        String parent = segments.size() > 1 ? segments.get(segments.size() - 2)[1] : null;
        return new TestIdentifier(last[1], last[0].equals("method"), parent);
    }

    @Override
    public void executionStarted(String uniqueId) {
        testListener.testStarted(toIdentifier(uniqueId));
    }

    @Override
    public void executionFinished(String uniqueId, String status) {
        testListener.testFinished(toIdentifier(uniqueId), status);
    }
}
