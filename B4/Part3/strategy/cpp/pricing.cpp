#include <cmath>
#include <memory>
#include <stdexcept>

struct Property { double baseRent; };

struct PricingContext {
    int month;
    double occupancyRate;
    int leaseMonths;

    PricingContext(int m, double occupancy, int months)
        : month(m), occupancyRate(occupancy), leaseMonths(months) {
        if (month < 1 || month > 12 || occupancyRate < 0 || occupancyRate > 1 || leaseMonths < 1) {
            throw std::invalid_argument("Invalid pricing context");
        }
    }
};

class PricingStrategy {
public:
    virtual ~PricingStrategy() = default;
    virtual double price(const Property& property, const PricingContext& context) const = 0;
};

class BasePricing final : public PricingStrategy {
public:
    double price(const Property& property, const PricingContext&) const override {
        return std::round(property.baseRent * 100.0) / 100.0;
    }
};

class DynamicPricing final : public PricingStrategy {
public:
    double price(const Property& property, const PricingContext& context) const override {
        double multiplier = 1.0;
        if (context.month == 4 || context.month == 5 || context.month == 12) multiplier += 0.20;
        if (context.occupancyRate >= 0.80) multiplier += 0.10;
        if (context.leaseMonths >= 12) multiplier -= 0.05;
        return std::round(property.baseRent * multiplier * 100.0) / 100.0;
    }
};

class PricingService {
    std::unique_ptr<PricingStrategy> strategy;
public:
    explicit PricingService(std::unique_ptr<PricingStrategy> initial) : strategy(std::move(initial)) {}
    void use(std::unique_ptr<PricingStrategy> next) { strategy = std::move(next); }
    double quote(const Property& property, const PricingContext& context) const {
        return strategy->price(property, context);
    }
};

