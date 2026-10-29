#include <algorithm>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

struct RentalProperty {
    int id;
    std::string city;
    double rent;
    bool available;
    std::vector<std::string> amenities;
    bool furnished;
};

class PropertySpecification {
public:
    virtual ~PropertySpecification() = default;
    virtual bool isSatisfiedBy(const RentalProperty& property) const = 0;
};

class CitySpecification final : public PropertySpecification {
    std::string city;
public:
    explicit CitySpecification(std::string value) : city(std::move(value)) {}
    bool isSatisfiedBy(const RentalProperty& property) const override { return property.city == city; }
};

class RentRangeSpecification final : public PropertySpecification {
    double minimum, maximum;
public:
    RentRangeSpecification(double min, double max) : minimum(min), maximum(max) {
        if (minimum < 0 || minimum > maximum) throw std::invalid_argument("Invalid range");
    }
    bool isSatisfiedBy(const RentalProperty& property) const override {
        return property.rent >= minimum && property.rent <= maximum;
    }
};

class AmenitySpecification final : public PropertySpecification {
    std::string amenity;
public:
    explicit AmenitySpecification(std::string value) : amenity(std::move(value)) {}
    bool isSatisfiedBy(const RentalProperty& property) const override {
        return std::find(property.amenities.begin(), property.amenities.end(), amenity) != property.amenities.end();
    }
};

class AvailableSpecification final : public PropertySpecification {
public:
    bool isSatisfiedBy(const RentalProperty& property) const override { return property.available; }
};

class FurnishedSpecification final : public PropertySpecification {
public:
    bool isSatisfiedBy(const RentalProperty& property) const override { return property.furnished; }
};

class AndSpecification final : public PropertySpecification {
    std::vector<std::shared_ptr<PropertySpecification>> specifications;
public:
    explicit AndSpecification(std::vector<std::shared_ptr<PropertySpecification>> specs) : specifications(std::move(specs)) {}
    bool isSatisfiedBy(const RentalProperty& property) const override {
        return std::all_of(specifications.begin(), specifications.end(), [&](const auto& spec) {
            return spec->isSatisfiedBy(property);
        });
    }
};

std::vector<RentalProperty> matching(const std::vector<RentalProperty>& properties, const PropertySpecification& spec) {
    std::vector<RentalProperty> result;
    std::copy_if(properties.begin(), properties.end(), std::back_inserter(result), [&](const auto& property) {
        return spec.isSatisfiedBy(property);
    });
    return result;
}

