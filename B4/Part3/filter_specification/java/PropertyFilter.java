import java.util.List;

record RentalProperty(int id, String city, double rent, boolean available, List<String> amenities, boolean furnished) {}

interface PropertySpecification {
    boolean isSatisfiedBy(RentalProperty property);
}

record CitySpecification(String city) implements PropertySpecification {
    public boolean isSatisfiedBy(RentalProperty property) { return city.equalsIgnoreCase(property.city()); }
}

record RentRangeSpecification(double minimum, double maximum) implements PropertySpecification {
    RentRangeSpecification {
        if (minimum < 0 || minimum > maximum) throw new IllegalArgumentException("Invalid range");
    }
    public boolean isSatisfiedBy(RentalProperty property) { return property.rent() >= minimum && property.rent() <= maximum; }
}

record AmenitySpecification(String amenity) implements PropertySpecification {
    public boolean isSatisfiedBy(RentalProperty property) { return property.amenities().contains(amenity); }
}

final class AvailableSpecification implements PropertySpecification {
    public boolean isSatisfiedBy(RentalProperty property) { return property.available(); }
}

final class FurnishedSpecification implements PropertySpecification {
    public boolean isSatisfiedBy(RentalProperty property) { return property.furnished(); }
}

record AndSpecification(List<PropertySpecification> specifications) implements PropertySpecification {
    public boolean isSatisfiedBy(RentalProperty property) {
        return specifications.stream().allMatch(spec -> spec.isSatisfiedBy(property));
    }
}

final class PropertyFilter {
    static List<RentalProperty> matching(List<RentalProperty> properties, PropertySpecification specification) {
        return properties.stream().filter(specification::isSatisfiedBy).toList();
    }
}

