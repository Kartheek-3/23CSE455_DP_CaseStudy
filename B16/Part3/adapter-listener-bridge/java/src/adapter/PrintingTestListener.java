package adapter;

import java.util.ArrayList;
import java.util.List;

final class PrintingTestListener implements TestListener {

    final List<String> lines = new ArrayList<>();

    @Override
    public void testStarted(TestIdentifier identifier) {
        lines.add("started  " + identifier.describe());
    }

    @Override
    public void testFinished(TestIdentifier identifier, String status) {
        lines.add("finished " + identifier.describe() + ": " + status);
    }
}
