package chain;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/** Parses the input file, runs the pattern and returns the exact text the program prints. */
public final class ChainDemo {

    /** A bad input line; the message is "line N: ...". */
    public static final class InputFormatException extends RuntimeException {
        private static final long serialVersionUID = 1L;

        InputFormatException(String message) {
            super(message);
        }
    }

    private ChainDemo() {
    }

    /** Splits a line into fields; returns null for blank lines and comments. */
    static String[] fields(String line) {
        String trimmed = line.strip();
        return trimmed.isEmpty() || trimmed.startsWith("#") ? null : trimmed.split("\\s+");
    }

    static List<Invocation> parse(List<String> lines) {
        List<Invocation> invocations = new ArrayList<>();
        for (int i = 0; i < lines.size(); i++) {
            String[] f = fields(lines.get(i));
            if (f == null) {
                continue;
            }
            String where = "line " + (i + 1) + ": ";
            if (f.length != 3 && f.length != 4) {
                throw new InputFormatException(where + "expected '<test> <duration-ms> PASS|FAIL [disabled]'");
            }
            if (!f[1].matches("[0-9]+")) {
                throw new InputFormatException(where + "duration must be a whole number of milliseconds, got '" + f[1] + "'");
            }
            if (!f[2].equals("PASS") && !f[2].equals("FAIL")) {
                throw new InputFormatException(where + "outcome must be PASS or FAIL, got '" + f[2] + "'");
            }
            if (f.length == 4 && !f[3].equals("disabled")) {
                throw new InputFormatException(where + "unknown flag '" + f[3] + "'");
            }
            invocations.add(new Invocation(f[0], Integer.parseInt(f[1]), f[2], f.length == 4));
        }
        return invocations;
    }

    public static String report(Path file) throws IOException {
        InterceptorChain chain = new InterceptorChain(
                List.of(new LoggingInterceptor(), new DisabledInterceptor(), new TimeoutInterceptor()));
        StringBuilder out = new StringBuilder();
        for (Invocation invocation : parse(Files.readAllLines(file))) {
            String result = chain.run(invocation);
            out.append(invocation.name).append(" -> ").append(result)
                    .append("  [").append(String.join(" > ", invocation.trace)).append("]\n");
        }
        return out.toString();
    }

    public static void main(String[] args) {
        if (args.length != 1) {
            System.err.println("usage: java -cp out chain.ChainDemo <invocations-file>");
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
