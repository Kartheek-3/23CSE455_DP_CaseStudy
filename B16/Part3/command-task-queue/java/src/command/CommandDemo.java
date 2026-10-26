package command;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/** Parses the input file, runs the pattern and returns the exact text the program prints. */
public final class CommandDemo {

    /** A bad input line; the message is "line N: ...". */
    public static final class InputFormatException extends RuntimeException {
        private static final long serialVersionUID = 1L;

        InputFormatException(String message) {
            super(message);
        }
    }

    private CommandDemo() {
    }

    /** Splits a line into fields; returns null for blank lines and comments. */
    static String[] fields(String line) {
        String trimmed = line.strip();
        return trimmed.isEmpty() || trimmed.startsWith("#") ? null : trimmed.split("\\s+");
    }

    static List<Command> parse(List<String> lines) {
        List<Command> commands = new ArrayList<>();
        for (int i = 0; i < lines.size(); i++) {
            String[] f = fields(lines.get(i));
            if (f == null) {
                continue;
            }
            if (f[0].equals("test") && f.length == 3 && (f[2].equals("PASS") || f[2].equals("FAIL"))) {
                commands.add(new RunTestCommand(f[1], f[2]));
            }
            else if (f[0].equals("note") && f.length > 1) {
                commands.add(new NoteCommand(String.join(" ", List.of(f).subList(1, f.length))));
            }
            else if (f[0].equals("test") || f[0].equals("note")) {
                throw new InputFormatException("line " + (i + 1) + ": expected 'test <name> PASS|FAIL' or 'note <text>'");
            }
            else {
                throw new InputFormatException("line " + (i + 1) + ": unknown command '" + f[0] + "'");
            }
        }
        return commands;
    }

    public static String report(Path file) throws IOException {
        List<Command> commands = parse(Files.readAllLines(file));
        TaskExecutor executor = new TaskExecutor();
        commands.forEach(executor::submit);
        StringBuilder out = new StringBuilder("queued " + commands.size() + " commands\n");
        executor.runAll().forEach(line -> out.append(line).append('\n'));
        long passed = executor.results.stream().filter("PASS"::equals).count();
        out.append("executed ").append(commands.size()).append(" commands: ").append(executor.results.size())
                .append(" tests, ").append(passed).append(" passed, ").append(executor.results.size() - passed).append(" failed\n");
        return out.toString();
    }

    public static void main(String[] args) {
        if (args.length != 1) {
            System.err.println("usage: java -cp out command.CommandDemo <tasks-file>");
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
