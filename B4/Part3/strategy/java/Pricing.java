import java.util.Set;

record Property(double baseRent) {}
record PricingContext(int month, double occupancyRate, int leaseMonths) {
    PricingContext {
        if (month < 1 || month > 12 || occupancyRate < 0 || occupancyRate > 1 || leaseMonths < 1) {
            throw new IllegalArgumentException("Invalid pricing context");
        }
    }
}

interface PricingStrategy {
    double price(Property property, PricingContext context);
}

final class BasePricing implements PricingStrategy {
    public double price(Property property, PricingContext context) {
        return property.baseRent();
    }
}

final class DynamicPricing implements PricingStrategy {
    public double price(Property property, PricingContext context) {
        double multiplier = 1.0;
        if (Set.of(4, 5, 12).contains(context.month())) multiplier += 0.20;
        if (context.occupancyRate() >= 0.80) multiplier += 0.10;
        if (context.leaseMonths() >= 12) multiplier -= 0.05;
        return Math.round(property.baseRent() * multiplier * 100.0) / 100.0;
    }
}

final class PricingService {
    private PricingStrategy strategy;

    PricingService(PricingStrategy strategy) {
        this.strategy = strategy;
    }

    void use(PricingStrategy strategy) {
        this.strategy = strategy;
    }

    double quote(Property property, PricingContext context) {
        return strategy.price(property, context);
    }
}

