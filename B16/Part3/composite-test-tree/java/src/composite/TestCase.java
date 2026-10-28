package composite;

import java.util.List;

/** Leaf: a single test method with optional tags. */
public record TestCase(String name, List<String> tags) implements TestNode {

    public TestCase {
        tags = List.copyOf(tags);
    }

    @Override
    public int countTests() {
        return 1;
    }

    @Override
    public boolean hasTag(String tag) {
        return tags.contains(tag);
    }

    @Override
    public void removeTestsTagged(String tag, List<String> removed) {
        // A leaf has nothing below it; its parent decides whether to remove it.
    }

    @Override
    public void pruneEmpty(List<String> pruned) {
    }

    @Override
    public void print(StringBuilder out, int depth) {
        out.append("  ".repeat(depth)).append("test ").append(name);
        tags.forEach(tag -> out.append(" @").append(tag));
        out.append('\n');
    }
}
