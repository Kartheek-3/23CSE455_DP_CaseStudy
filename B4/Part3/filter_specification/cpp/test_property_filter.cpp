#include <iostream>
#include "property_filter.cpp"

int main() {
    int passed = 0;
    auto check = [&](bool condition, const char* name) { if (!condition) throw std::runtime_error(name); ++passed; };
    std::vector<RentalProperty> items{
        {1, "Kochi", 22000, true, {"parking", "gym"}, true},
        {2, "Kochi", 15000, true, {"wifi"}, false},
        {3, "Bengaluru", 32000, true, {"parking"}, true},
        {4, "Kochi", 24000, false, {"parking"}, true},
    };
    AndSpecification composite({std::make_shared<AvailableSpecification>(), std::make_shared<CitySpecification>("Kochi"),
        std::make_shared<RentRangeSpecification>(18000, 25000), std::make_shared<AmenitySpecification>("parking"),
        std::make_shared<FurnishedSpecification>()});
    auto result = matching(items, composite);
    check(result.size() == 1, "one match");
    check(result[0].id == 1, "correct match");
    check(matching(items, CitySpecification("Kochi")).size() == 3, "reusable city spec");
    check(matching(items, AvailableSpecification()).size() == 3, "availability spec");
    bool invalid = false;
    try { RentRangeSpecification bad(10, 5); } catch (const std::invalid_argument&) { invalid = true; }
    check(invalid, "invalid range");
    std::cout << "Specification C++: " << passed << "/" << passed << " passed\n";
}
