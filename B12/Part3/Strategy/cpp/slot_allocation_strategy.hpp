#pragma once

#include <string>
#include <vector>

// Strategy pattern (GoF, behavioural) -- pluggable parking-slot allocation.
// Production snippet (header). Tests live in strategy_test.cpp.

struct Slot {
    int id;
    std::string slotNumber;
    int floor;
    std::string type; // "standard" | "ev"
    int distanceToEntrance;

    Slot(int id_, std::string number, int floor_, std::string type_, int distance)
        : id(id_),
          slotNumber(std::move(number)),
          floor(floor_),
          type(std::move(type_)),
          distanceToEntrance(distance) {}
};

class SlotAllocationStrategy {
public:
    virtual ~SlotAllocationStrategy() = default;
    virtual std::string name() const = 0;
    virtual const Slot* choose(const std::vector<Slot>& slots) const = 0;
};

class FirstAvailableStrategy : public SlotAllocationStrategy {
public:
    std::string name() const override { return "first-available"; }
    const Slot* choose(const std::vector<Slot>& slots) const override {
        return slots.empty() ? nullptr : &slots.front();
    }
};

class NearestToEntranceStrategy : public SlotAllocationStrategy {
public:
    std::string name() const override { return "nearest-to-entrance"; }
    const Slot* choose(const std::vector<Slot>& slots) const override {
        const Slot* best = nullptr;
        for (const auto& slot : slots) {
            if (best == nullptr || slot.distanceToEntrance < best->distanceToEntrance) {
                best = &slot;
            }
        }
        return best;
    }
};

class EvPreferredStrategy : public SlotAllocationStrategy {
public:
    std::string name() const override { return "ev-preferred"; }
    const Slot* choose(const std::vector<Slot>& slots) const override {
        bool haveEv = false;
        for (const auto& slot : slots) {
            if (slot.type == "ev") {
                haveEv = true;
                break;
            }
        }
        const Slot* best = nullptr;
        for (const auto& slot : slots) {
            if (haveEv && slot.type != "ev") {
                continue;
            }
            if (best == nullptr || slot.distanceToEntrance < best->distanceToEntrance) {
                best = &slot;
            }
        }
        return best;
    }
};

class SlotAllocator {
public:
    explicit SlotAllocator(const SlotAllocationStrategy* strategy) : strategy_(strategy) {}
    void setStrategy(const SlotAllocationStrategy* strategy) { strategy_ = strategy; }
    const Slot* allocate(const std::vector<Slot>& slots) const { return strategy_->choose(slots); }

private:
    const SlotAllocationStrategy* strategy_;
};
