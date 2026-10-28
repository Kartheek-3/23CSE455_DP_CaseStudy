#include <iostream>
#include <stdexcept>
#include "pricing.cpp"

int main() {
    int passed = 0;
    auto check = [&](bool condition, const char* name) {
        if (!condition) throw std::runtime_error(name);
        ++passed;
    };
    Property property{1000.0};
    PricingService service(std::make_unique<BasePricing>());
    check(service.quote(property, PricingContext(12, 0.85, 12)) == 1000.0, "base");
    service.use(std::make_unique<DynamicPricing>());
    check(service.quote(property, PricingContext(4, 0.50, 6)) == 1200.0, "peak");
    check(service.quote(property, PricingContext(1, 0.80, 6)) == 1100.0, "occupancy");
    check(service.quote(property, PricingContext(12, 0.85, 12)) == 1250.0, "combined");
    check(service.quote(property, PricingContext(1, 0.50, 12)) == 950.0, "long-stay");
    bool invalid = false;
    try { PricingContext(13, 0.5, 6); } catch (const std::invalid_argument&) { invalid = true; }
    check(invalid, "invalid context");
    std::cout << "Strategy C++: " << passed << "/" << passed << " passed\n";
}

