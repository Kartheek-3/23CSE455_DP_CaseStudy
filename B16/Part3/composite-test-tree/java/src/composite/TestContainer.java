package composite;

import java.util.ArrayList;
import java.util.List;

/** Composite: an engine or a test class, holding child nodes of either kind. */
public final class TestContainer implements TestNode {

    private final String kind;
    private final String name;
    private final List<TestNode> children = new ArrayList<>();

    public TestContainer(String kind, String name) {
        this.kind = kind;
        this.name = name;
    }

    public void addChild(TestNode child) {
        children.add(child);
    }

    @Override
    public String name() {
        return name;
    }

    @Override
    public int countTests() {
        return children.stream().mapToInt(TestNode::countTests).sum();
    }

    @Override
    public boolean hasTag(String tag) {
        return false;
    }

    @Override
    public void removeTestsTagged(String tag, List<String> removed) {
        List<TestNode> kept = new ArrayList<>();
        for (TestNode child : children) {
            if (child.hasTag(tag)) {
                removed.add(child.name());
            }
            else {
                child.removeTestsTagged(tag, removed);
                kept.add(child);
            }
        }
        children.clear();
        children.addAll(kept);
    }

    @Override
    public void pruneEmpty(List<String> pruned) {
        List<TestNode> kept = new ArrayList<>();
        for (TestNode child : children) {
            child.pruneEmpty(pruned);
            if (child.countTests() == 0) {
                pruned.add(child.name());
            }
            else {
                kept.add(child);
            }
        }
        children.clear();
        children.addAll(kept);
    }

    @Override
    public void print(StringBuilder out, int depth) {
        int tests = countTests();
        out.append("  ".repeat(depth)).append(kind).append(' ').append(name)
                .append(" (").append(tests).append(tests == 1 ? " test)" : " tests)").append('\n');
        children.forEach(child -> child.print(out, depth + 1));
    }
}
