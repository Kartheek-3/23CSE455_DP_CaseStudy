package composite;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

/** Builds the tree from an indented text file (two spaces per level). */
public final class TreeParser {

    private static final Set<String> KINDS = Set.of("engine", "class", "test");

    private TreeParser() {
    }

    public static TestContainer parse(List<String> lines) {
        TestContainer root = null;
        List<TestNode> path = new ArrayList<>(); // path.get(d) = last node seen at depth d

        for (int i = 0; i < lines.size(); i++) {
            int lineNumber = i + 1;
            String line = lines.get(i);
            String text = line.trim();
            if (text.isEmpty() || text.startsWith("#")) {
                continue;
            }
            int indent = 0;
            while (line.charAt(indent) == ' ') {
                indent++;
            }
            if (indent % 2 != 0) {
                throw new TreeFormatException(lineNumber, "indentation must be a multiple of 2 spaces");
            }
            String[] fields = text.split("\\s+");
            String kind = fields[0];
            if (!KINDS.contains(kind)) {
                throw new TreeFormatException(lineNumber, "unknown kind '" + kind + "'");
            }
            if (fields.length < 2) {
                throw new TreeFormatException(lineNumber, "missing name");
            }
            String name = fields[1];
            List<String> tags = new ArrayList<>();
            for (String field : Arrays.copyOfRange(fields, 2, fields.length)) {
                if (!field.startsWith("@") || field.length() == 1) {
                    throw new TreeFormatException(lineNumber, "tags must look like @name");
                }
                tags.add(field.substring(1));
            }
            if (!tags.isEmpty() && !kind.equals("test")) {
                throw new TreeFormatException(lineNumber, "only tests can have tags");
            }

            int depth = indent / 2;
            if (root == null) {
                if (depth != 0 || !kind.equals("engine")) {
                    throw new TreeFormatException(lineNumber, "the first node must be an engine at the top level");
                }
                root = new TestContainer(kind, name);
                path.add(root);
                continue;
            }
            if (depth == 0 || kind.equals("engine")) {
                throw new TreeFormatException(lineNumber, "only one engine is allowed, at the top level");
            }
            if (depth > path.size()) {
                throw new TreeFormatException(lineNumber, "indented too far");
            }
            if (!(path.get(depth - 1) instanceof TestContainer parent)) {
                throw new TreeFormatException(lineNumber, "a test cannot have children");
            }
            TestNode node = kind.equals("test") ? new TestCase(name, tags) : new TestContainer(kind, name);
            parent.addChild(node);
            path.subList(depth, path.size()).clear();
            path.add(node);
        }
        if (root == null) {
            throw new TreeFormatException("no engine found");
        }
        return root;
    }
}
