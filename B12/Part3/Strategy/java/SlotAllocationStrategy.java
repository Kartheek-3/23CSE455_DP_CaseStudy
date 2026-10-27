import java.util.ArrayList;
import java.util.List;

// Strategy pattern (GoF, behavioural) -- pluggable parking-slot allocation.
// Production snippet. Tests live in StrategyTest.java.

public interface SlotAllocationStrategy {
    String name();
    Slot choose(List<Slot> slots);
}

class Slot {
    final int id;
    final String slotNumber;
    final int floor;
    final String type; // "standard" | "ev"
    final int distanceToEntrance;

    Slot(int id, String slotNumber, int floor, String type, int distanceToEntrance) {
        this.id = id;
        this.slotNumber = slotNumber;
        this.floor = floor;
        this.type = type;
        this.distanceToEntrance = distanceToEntrance;
    }
}

class FirstAvailableStrategy implements SlotAllocationStrategy {
    public String name() {
        return "first-available";
    }

    public Slot choose(List<Slot> slots) {
        return slots.isEmpty() ? null : slots.get(0);
    }
}

class NearestToEntranceStrategy implements SlotAllocationStrategy {
    public String name() {
        return "nearest-to-entrance";
    }

    public Slot choose(List<Slot> slots) {
        Slot best = null;
        for (Slot s : slots) {
            if (best == null || s.distanceToEntrance < best.distanceToEntrance) {
                best = s;
            }
        }
        return best;
    }
}

class EvPreferredStrategy implements SlotAllocationStrategy {
    public String name() {
        return "ev-preferred";
    }

    public Slot choose(List<Slot> slots) {
        List<Slot> pool = new ArrayList<>();
        for (Slot s : slots) {
            if ("ev".equals(s.type)) {
                pool.add(s);
            }
        }
        if (pool.isEmpty()) {
            pool = slots;
        }
        Slot best = null;
        for (Slot s : pool) {
            if (best == null || s.distanceToEntrance < best.distanceToEntrance) {
                best = s;
            }
        }
        return best;
    }
}

class SlotAllocator {
    private SlotAllocationStrategy strategy;

    SlotAllocator(SlotAllocationStrategy strategy) {
        this.strategy = strategy;
    }

    void setStrategy(SlotAllocationStrategy strategy) {
        this.strategy = strategy;
    }

    Slot allocate(List<Slot> slots) {
        return strategy.choose(slots);
    }
}
