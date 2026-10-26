<?php

namespace App\Domain\Search;

use InvalidArgumentException;

final readonly class RentRangeSpecification implements PropertySpecification
{
    public function __construct(private float $minimum, private float $maximum)
    {
        if ($minimum > $maximum) {
            throw new InvalidArgumentException('Minimum rent cannot exceed maximum rent.');
        }
    }

    public function isSatisfiedBy(array $property): bool
    {
        $rent = (float) ($property['monthly_rent'] ?? -1);
        return $rent >= $this->minimum && $rent <= $this->maximum;
    }
}
