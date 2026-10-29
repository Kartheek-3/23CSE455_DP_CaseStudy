'use strict';

// Strategy pattern (GoF, behavioural) — pluggable parking-slot allocation.
// Production snippet. Tests live in test_strategy.js.

class Slot {
  constructor(id, slotNumber, floor, type, distanceToEntrance) {
    this.id = id;
    this.slotNumber = slotNumber;
    this.floor = floor;
    this.type = type; // 'standard' | 'ev'
    this.distanceToEntrance = distanceToEntrance;
  }
}

class SlotAllocationStrategy {
  name() {
    throw new Error('name() not implemented');
  }
  choose(slots) {
    throw new Error('choose() not implemented');
  }
}

class FirstAvailableStrategy extends SlotAllocationStrategy {
  name() {
    return 'first-available';
  }
  choose(slots) {
    return slots.length > 0 ? slots[0] : null;
  }
}

class NearestToEntranceStrategy extends SlotAllocationStrategy {
  name() {
    return 'nearest-to-entrance';
  }
  choose(slots) {
    let best = null;
    for (const slot of slots) {
      if (best === null || slot.distanceToEntrance < best.distanceToEntrance) {
        best = slot;
      }
    }
    return best;
  }
}

class EvPreferredStrategy extends SlotAllocationStrategy {
  name() {
    return 'ev-preferred';
  }
  choose(slots) {
    const evSlots = slots.filter((s) => s.type === 'ev');
    const pool = evSlots.length > 0 ? evSlots : slots;
    let best = null;
    for (const slot of pool) {
      if (best === null || slot.distanceToEntrance < best.distanceToEntrance) {
        best = slot;
      }
    }
    return best;
  }
}

class SlotAllocator {
  constructor(strategy) {
    this.strategy = strategy;
  }
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  allocate(slots) {
    return this.strategy.choose(slots);
  }
}

module.exports = {
  Slot,
  SlotAllocationStrategy,
  FirstAvailableStrategy,
  NearestToEntranceStrategy,
  EvPreferredStrategy,
  SlotAllocator,
};
