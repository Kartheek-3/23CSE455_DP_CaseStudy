package composite;

import java.util.List;

/**
 * Component interface, modelled on JUnit's TestDescriptor: containers and tests
 * are both TestNodes, so clients run every operation on the root without checking
 * what kind of node they have.
 */
public interface TestNode {

    String name();

    /** Number of tests in this subtree (a test counts itself). */
    int countTests();

    /** True only for a test that carries the tag; containers have no tags. */
    boolean hasTag(String tag);

    /** Removes every test below this node that has the tag, adding the removed names to {@code removed}. */
    void removeTestsTagged(String tag, List<String> removed);

    /** Removes every container below this node that has no tests left, children first. */
    void pruneEmpty(List<String> pruned);

    void print(StringBuilder out, int depth);
}
