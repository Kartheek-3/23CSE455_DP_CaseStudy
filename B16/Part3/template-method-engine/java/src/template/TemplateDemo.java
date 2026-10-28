package template;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/** Parses the input file, runs the pattern and returns the exact text the program prints. */
public final class TemplateDemo {

    /** A bad input line; the message is "line N: ...". */
    public static final class InputFormatException extends RuntimeException {
        private static final long serialVersionUID = 1L;

        InputFormatException(String message) {
            super(message);
        }
    }

    private TemplateDemo() {
    }

    /** Splits a line into fields; returns null for blank lines and comments. */
    static String[] fields(String line) {
        String trimmed = line.strip();
        return trimmed.isEmpty() || trimmed.startsWith("#") ? null : trimmed.split("\\s+");
    }

    /** Lines of the form "<test> PASS|FAIL". */
    static List<String[]> parseTests(List<String> lines) {
        List<String[]> tests = new ArrayList<>();
        for (int i = 0; i < lines.size(); i++) {
            String[] f = fields(lines.get(i));
            if (f == null) {
                continue;
            }
            if (f.length != 2) {
                throw new InputFormatException("line " + (i + 1) + ": expected '<test> PASS|FAIL'");
            }
            if (!f[1].equals("PASS") && !f[1].equals("FAIL")) {
                throw new InputFormatException("line " + (i + 1) + ": outcome must be PASS or FAIL, got '" + f[1] + "'");
            }
            tests.add(f);
        }
        return tests;
    }

    public static String report(Path file) throws IOException {
        List<String[]> tests = parseTests(Files.readAllLines(file));
        StringBuilder out = new StringBuilder();
        for (TestEngine engine : List.of(new SimpleEngine(), new LifecycleEngine())) {
            out.append("== ").append(engine.name()).append(" ==\n");
            engine.execute(tests).forEach(line -> out.append(line).append('\n'));
        }
        return out.toString();
    }

    public static void main(String[] args) {
        if (args.length != 1) {
            System.err.println("usage: java -cp out template.TemplateDemo <tests-file>");
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
