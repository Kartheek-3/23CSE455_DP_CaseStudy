from property_filter import *


def main() -> None:
    passed = 0
    def check(condition: bool, name: str) -> None:
        nonlocal passed
        if not condition:
            raise AssertionError(name)
        passed += 1
    items = [
        RentalProperty(1, "Kochi", 22000, True, ("parking", "gym"), True),
        RentalProperty(2, "Kochi", 15000, True, ("wifi",), False),
        RentalProperty(3, "Bengaluru", 32000, True, ("parking",), True),
        RentalProperty(4, "Kochi", 24000, False, ("parking",), True),
    ]
    composite = AndSpecification((AvailableSpecification(), CitySpecification("Kochi"),
        RentRangeSpecification(18000, 25000), AmenitySpecification("parking"), FurnishedSpecification()))
    result = matching(items, composite)
    check(len(result) == 1, "one match")
    check(result[0].id == 1, "correct match")
    check(len(matching(items, CitySpecification("Kochi"))) == 3, "reusable city spec")
    check(len(matching(items, AvailableSpecification())) == 3, "availability spec")
    try:
        RentRangeSpecification(10, 5)
    except ValueError:
        check(True, "invalid range")
    print(f"Specification Python: {passed}/{passed} passed")


if __name__ == "__main__":
    main()

