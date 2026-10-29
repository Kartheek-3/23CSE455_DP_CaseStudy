<?php

namespace App\Domain\Search;

final readonly class CitySpecification implements PropertySpecification
{
    public function __construct(private string $city)
    {
    }

    public function isSatisfiedBy(array $property): bool
    {
        return strtolower((string) ($property['city'] ?? '')) === strtolower($this->city);
    }
}
