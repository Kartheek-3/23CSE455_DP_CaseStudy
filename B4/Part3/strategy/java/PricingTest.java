public final class PricingTest {
    private static int passed = 0;

    private static void check(boolean condition, String name) {
        if (!condition) throw new AssertionError(name);
        passed++;
    }

    public static void main(String[] args) {
        Property property = new Property(1000.0);
        PricingService service = new PricingService(new BasePricing());
        check(service.quote(property, new PricingContext(12, 0.85, 12)) == 1000.0, "base");
        service.use(new DynamicPricing());
        check(service.quote(property, new PricingContext(4, 0.50, 6)) == 1200.0, "peak");
        check(service.quote(property, new PricingContext(1, 0.80, 6)) == 1100.0, "occupancy");
        check(service.quote(property, new PricingContext(12, 0.85, 12)) == 1250.0, "combined");
        check(service.quote(property, new PricingContext(1, 0.50, 12)) == 950.0, "long-stay");
        boolean invalid = false;
        try { new PricingContext(13, 0.5, 6); } catch (IllegalArgumentException ex) { invalid = true; }
        check(invalid, "invalid context");
        System.out.printf("Strategy Java: %d/%d passed%n", passed, passed);
    }
}

