from pricing import BasePricing, DynamicPricing, PricingContext, PricingService, Property


def main() -> None:
    passed = 0

    def check(condition: bool, name: str) -> None:
        nonlocal passed
        if not condition:
            raise AssertionError(name)
        passed += 1

    property_ = Property(1000.0)
    service = PricingService(BasePricing())
    check(service.quote(property_, PricingContext(12, 0.85, 12)) == 1000.0, "base")
    service.use(DynamicPricing())
    check(service.quote(property_, PricingContext(4, 0.50, 6)) == 1200.0, "peak")
    check(service.quote(property_, PricingContext(1, 0.80, 6)) == 1100.0, "occupancy")
    check(service.quote(property_, PricingContext(12, 0.85, 12)) == 1250.0, "combined")
    check(service.quote(property_, PricingContext(1, 0.50, 12)) == 950.0, "long-stay")
    try:
        PricingContext(13, 0.5, 6)
    except ValueError:
        check(True, "invalid context")
    print(f"Strategy Python: {passed}/{passed} passed")


if __name__ == "__main__":
    main()

