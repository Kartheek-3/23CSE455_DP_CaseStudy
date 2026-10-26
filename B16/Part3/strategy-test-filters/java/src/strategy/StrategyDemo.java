package strategy;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/** Parses the input file, runs the pattern and returns the exact text the program prints. */
public final class StrategyDemo {

    /** A bad input line; the message is "line N: ...". */
    public static final class InputFormatException extends RuntimeException {
        private static final long serialVersionUID = 1L;

        InputFormatException(String message) {
            super(message);
        }
    }

    private StrategyDemo() {
    }

    /** Splits a line into fields; returns null for blank lines and comments. */
    static String[] fields(String line) {
        String trimmed = line.strip();
        return trimmed.isEmpty() || trimmed.startsWith("#") ? null : trimmed.split("\\s+");
    }

    static List<TestCase> parse(List<String> lines) {
        List<TestCase> tests = new ArrayList<>();
        for (int i = 0; i < lines.size(); i++) {
            String[] f = fields(lines.get(i));
            if (f == null) {
                continue;
            }
            String[] parts = f[0].split("#", -1);
            if (parts.length != 2 || parts[0].isEmpty() || parts[1].isEmpty()) {
                throw new InputFormatException("line " + (i + 1) + ": test name must look like Class#method, got '" + f[0] + "'");
            }
            tests.add(new TestCase(f[0], List.of(f).subList(1, f.length)));
        }
        return tests;
    }

    public static String report(Path file) throws IOException {
        List<TestCase> tests = parse(Files.readAllLines(file));
        StringBuilder out = new StringBuilder();
        for (TestFilter strategy : List.of(new IncludeTag("fast"), new ExcludeTag("flaky"), new NameContains("String"))) {
            List<TestCase> selected = new TestSelector(strategy).select(tests);
            out.append("== ").append(strategy.describe()).append(" ==\n");
            selected.forEach(test -> out.append(test.name()).append('\n'));
            out.append("selected ").append(selected.size()).append(" of ").append(tests.size()).append('\n');
        }
        return out.toString();
    }

    public static void main(String[] args) {
        if (args.length != 1) {
            System.err.println("usage: java -cp out strategy.StrategyDemo <tests-file>");
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
