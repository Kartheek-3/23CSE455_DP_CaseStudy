#include <iostream>

class DiscountStrategy {
public:
    virtual ~DiscountStrategy() = default;
    virtual int apply(int amountCents) const = 0;
};

class StandardDiscount : public DiscountStrategy {
public:
    int apply(int amountCents) const override { return amountCents * 90 / 100; }
};

class PremiumDiscount : public DiscountStrategy {
public:
    int apply(int amountCents) const override { return amountCents * 80 / 100; }
};

class PriceCalculator {
    const DiscountStrategy& strategy;
public:
    explicit PriceCalculator(const DiscountStrategy& value) : strategy(value) {}
    int total(int amountCents) const { return strategy.apply(amountCents); }
};

int standardResult() { StandardDiscount strategy; return PriceCalculator(strategy).total(10000); }
int premiumResult() { PremiumDiscount strategy; return PriceCalculator(strategy).total(10000); }

int main() {
    std::cout << "standard=" << standardResult() << ";premium=" << premiumResult() << '\n';
    return 0;
}
