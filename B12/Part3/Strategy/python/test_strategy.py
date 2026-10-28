"""Tests for the Strategy cross-language snippet (Python)."""

from slot_allocation_strategy import (
    Slot,
    FirstAvailableStrategy,
    NearestToEntranceStrategy,
    EvPreferredStrategy,
    SlotAllocator,
)

SLOTS = [
    Slot(1, "A1", 2, "standard", 50),
    Slot(2, "A2", 1, "standard", 30),
    Slot(3, "E1", 1, "ev", 40),
]
NO_EV = [SLOTS[0], SLOTS[1]]

_passed = 0
_total = 0


def check(label, actual, expected):
    global _passed, _total
    _total += 1
    assert actual == expected, f"{label}: expected {expected} got {actual}"
    _passed += 1


def main():
    allocator = SlotAllocator(FirstAvailableStrategy())
    check("first-available", allocator.allocate(SLOTS).id, 1)

    allocator.set_strategy(NearestToEntranceStrategy())
    check("nearest-to-entrance", allocator.allocate(SLOTS).id, 2)

    allocator.set_strategy(EvPreferredStrategy())
    check("ev-preferred", allocator.allocate(SLOTS).id, 3)
    check("ev-preferred-no-ev", allocator.allocate(NO_EV).id, 2)
    check("empty", allocator.allocate([]), None)

    print(f"STRATEGY_PY PASS {_passed}/{_total}")


if __name__ == "__main__":
    main()
