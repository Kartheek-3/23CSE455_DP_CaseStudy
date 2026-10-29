<?php

namespace App\Domain\Search;

final readonly class MaxMonthlyRentSpecification implements PropertySpecification
{
    public function __construct(private float $maximum)
    {
    }

    public function isSatisfiedBy(array $property): bool
    {
        return isset($property['monthly_rent'])
            && (float) $property['monthly_rent'] <= $this->maximum;
    }
}
