package nullobject;

import java.util.List;

final class ConsoleListener implements TestListener {

    private final List<String> lines;

    ConsoleListener(List<String> lines) {
        this.lines = lines;
    }

    @Override
    public void testFinished(String name, String outcome) {
        lines.add("listener: " + name + " " + outcome);
    }
}
