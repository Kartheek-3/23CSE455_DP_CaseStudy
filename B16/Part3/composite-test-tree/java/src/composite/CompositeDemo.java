package composite;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/** Reads the tree, removes the tests with one tag, prunes empty containers and prints the result. */
public final class CompositeDemo {

    private CompositeDemo() {
    }

    public static String report(Path treeFile, String tag) throws IOException {
        TestNode root = TreeParser.parse(Files.readAllLines(treeFile));
        StringBuilder out = new StringBuilder("== Tree as read ==\n");
        root.print(out, 0);

        int before = root.countTests();
        List<String> removed = new ArrayList<>();
        root.removeTestsTagged(tag, removed);
        List<String> pruned = new ArrayList<>();
        root.pruneEmpty(pruned);

        out.append("== Remove tests tagged @").append(tag).append(" ==\n");
        out.append("tests before: ").append(before).append('\n');
        out.append("removed ").append(listed(removed)).append('\n');
        out.append("pruned ").append(listed(pruned)).append('\n');
        out.append("tests after: ").append(root.countTests()).append('\n');
        out.append("== Tree after ==\n");
        root.print(out, 0);
        return out.toString();
    }

    private static String listed(List<String> names) {
        return "(" + names.size() + "): " + (names.isEmpty() ? "none" : String.join(", ", names));
    }

    public static void main(String[] args) {
        if (args.length != 2) {
            System.err.println("usage: java -cp out composite.CompositeDemo <tree-file> <tag>");
            System.exit(2);
        }
        try {
            System.out.print(report(Path.of(args[0]), args[1]));
        }
        catch (IOException | TreeFormatException e) {
            System.err.println("error: " + e.getMessage());
            System.exit(1);
        }
    }
}
