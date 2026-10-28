package observer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/** Wires the listeners to the runner and prints the summary, the log and any listener failures. */
public final class ObserverDemo {

    private ObserverDemo() {
    }

    public static String report(Path eventsFile) throws IOException {
        SummaryListener summary = new SummaryListener();
        LoggingListener log = new LoggingListener();

        CompositeTestExecutionListener listeners = new CompositeTestExecutionListener();
        listeners.register(summary);
        listeners.register(new BrokenListener());
        listeners.register(log);

        new EventRunner(listeners).run(Files.readAllLines(eventsFile));

        StringBuilder out = new StringBuilder();
        out.append("== Summary ==\n").append(summary.render());
        out.append("== Log ==\n").append(log.render());
        out.append("== Listener failures (").append(listeners.failures().size()).append(") ==\n");
        listeners.failures().forEach(failure -> out.append(failure).append('\n'));
        return out.toString();
    }

    public static void main(String[] args) {
        if (args.length != 1) {
            System.err.println("usage: java -cp out observer.ObserverDemo <events-file>");
            System.exit(2);
        }
        try {
            System.out.print(report(Path.of(args[0])));
        }
        catch (IOException | EventFormatException e) {
            System.err.println("error: " + e.getMessage());
            System.exit(1);
        }
    }
}
