package adapter;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/** Parses the input file, runs the pattern and returns the exact text the program prints. */
public final class AdapterDemo {

    /** A bad input line; the message is "line N: ...". */
    public static final class InputFormatException extends RuntimeException {
        private static final long serialVersionUID = 1L;

        InputFormatException(String message) {
            super(message);
        }
    }

    private AdapterDemo() {
    }

    /** Splits a line into fields; returns null for blank lines and comments. */
    static String[] fields(String line) {
        String trimmed = line.strip();
        return trimmed.isEmpty() || trimmed.startsWith("#") ? null : trimmed.split("\\s+");
    }

    private static final java.util.regex.Pattern UNIQUE_ID =
            java.util.regex.Pattern.compile("(\\[[a-z-]+:[^\\]]+\\])(/\\[[a-z-]+:[^\\]]+\\])*");

    /** The engine side: knows only EngineListener and raw unique ids. */
    static void runEngine(List<String> lines, EngineListener listener) {
        for (int i = 0; i < lines.size(); i++) {
            String[] f = fields(lines.get(i));
            if (f == null) {
                continue;
            }
            String where = "line " + (i + 1) + ": ";
            if (!f[0].equals("started") && !f[0].equals("finished")) {
                throw new InputFormatException(where + "unknown event '" + f[0] + "'");
            }
            if (f.length != (f[0].equals("started") ? 2 : 3)) {
                throw new InputFormatException(where + "malformed " + f[0] + " event");
            }
            if (!UNIQUE_ID.matcher(f[1]).matches()) {
                throw new InputFormatException(where + "malformed unique id '" + f[1] + "'");
            }
            if (f[0].equals("started")) {
                listener.executionStarted(f[1]);
            }
            else if (List.of("SUCCESSFUL", "FAILED", "ABORTED").contains(f[2])) {
                listener.executionFinished(f[1], f[2]);
            }
            else {
                throw new InputFormatException(where + "unknown status '" + f[2] + "'");
            }
        }
    }

    public static String report(Path file) throws IOException {
        PrintingTestListener client = new PrintingTestListener();
        runEngine(Files.readAllLines(file), new ListenerAdapter(client));
        return String.join("\n", client.lines) + "\n";
    }

    public static void main(String[] args) {
        if (args.length != 1) {
            System.err.println("usage: java -cp out adapter.AdapterDemo <events-file>");
            System.exit(2);
        }
        try {
            System.out.print(report(Path.of(args[0])));
        }
        catch (IOException | InputFormatException e) {
            System.err.println("error: " + e.getMessage());
            System.exit(1);
        }
    }
}
