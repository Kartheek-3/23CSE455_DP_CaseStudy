import java.util.List;

public final class PropertyFilterTest {
    private static int passed = 0;
    private static void check(boolean condition, String name) {
        if (!condition) throw new AssertionError(name);
        passed++;
    }
    public static void main(String[] args) {
        var items = List.of(
            new RentalProperty(1, "Kochi", 22000, true, List.of("parking", "gym"), true),
            new RentalProperty(2, "Kochi", 15000, true, List.of("wifi"), false),
            new RentalProperty(3, "Bengaluru", 32000, true, List.of("parking"), true),
            new RentalProperty(4, "Kochi", 24000, false, List.of("parking"), true)
        );
        var composite = new AndSpecification(List.of(new AvailableSpecification(), new CitySpecification("Kochi"),
            new RentRangeSpecification(18000, 25000), new AmenitySpecification("parking"), new FurnishedSpecification()));
        var result = PropertyFilter.matching(items, composite);
        check(result.size() == 1, "one match");
        check(result.get(0).id() == 1, "correct match");
        check(PropertyFilter.matching(items, new CitySpecification("Kochi")).size() == 3, "reusable city spec");
        check(PropertyFilter.matching(items, new AvailableSpecification()).size() == 3, "availability spec");
        boolean invalid = false;
        try { new RentRangeSpecification(10, 5); } catch (IllegalArgumentException ex) { invalid = true; }
        check(invalid, "invalid range");
        System.out.printf("Specification Java: %d/%d passed%n", passed, passed);
    }
}

