// Strategy pattern - late-fee policy. Mirrors FineStrategy.java behaviour.
// Representative of PasswordEncoder strategy in SecurityConfiguration.java:57.
#include <cstdio>
#include <memory>
#include <vector>

struct FinePolicy {                           // Strategy
    virtual double fine(int daysLate) const = 0;
    virtual ~FinePolicy() = default;
};

struct RegularFine : FinePolicy {             // ConcreteStrategy A
    double fine(int daysLate) const override {
        return daysLate <= 0 ? 0.0 : daysLate * 5.0;
    }
};

struct AdvocateFine : FinePolicy {            // ConcreteStrategy B
    double fine(int daysLate) const override {
        if (daysLate <= 0) return 0.0;
        if (daysLate <= 7) return daysLate * 2.0;
        return 14.0 + (daysLate - 7) * 3.0;
    }
};

class FineContext {                           // Context
    const FinePolicy* policy;
public:
    explicit FineContext(const FinePolicy* p) : policy(p) {}
    void setPolicy(const FinePolicy* p) { policy = p; }
    double compute(int daysLate) const { return policy->fine(daysLate); }
};

int main() {
    std::vector<int> cases = {0, 3, 7, 10};
    RegularFine regular;
    AdvocateFine advocate;
    FineContext ctx(&regular);
    for (int d : cases) std::printf("regular,%d,%.2f\n", d, ctx.compute(d));
    ctx.setPolicy(&advocate);
    for (int d : cases) std::printf("advocate,%d,%.2f\n", d, ctx.compute(d));
    return 0;
}
