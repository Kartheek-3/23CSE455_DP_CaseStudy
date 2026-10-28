import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class StrategyTest {
    static int passed = 0;
    static int total = 0;

    static void check(String label, int actual, int expected) {
        total++;
        if (actual != expected) {
            throw new AssertionError(label + ": expected " + expected + " got " + actual);
        }
        passed++;
    }

    public static void main(String[] args) {
        List<Slot> slots = new ArrayList<>(Arrays.asList(
                new Slot(1, "A1", 2, "standard", 50),
                new Slot(2, "A2", 1, "standard", 30),
                new Slot(3, "E1", 1, "ev", 40)));
        List<Slot> noEv = new ArrayList<>(Arrays.asList(
                new Slot(1, "A1", 2, "standard", 50),
                new Slot(2, "A2", 1, "standard", 30)));

        SlotAllocator allocator = new SlotAllocator(new FirstAvailableStrategy());
        check("first-available", allocator.allocate(slots).id, 1);

        allocator.setStrategy(new NearestToEntranceStrategy());
        check("nearest-to-entrance", allocator.allocate(slots).id, 2);

        allocator.setStrategy(new EvPreferredStrategy());
        check("ev-preferred", allocator.allocate(slots).id, 3);
        check("ev-preferred-no-ev", allocator.allocate(noEv).id, 2);

        total++;
        if (allocator.allocate(new ArrayList<>()) == null) {
            passed++;
        } else {
            throw new AssertionError("empty: expected null");
        }

        System.out.println("STRATEGY_JAVA PASS " + passed + "/" + total);
    }
}
