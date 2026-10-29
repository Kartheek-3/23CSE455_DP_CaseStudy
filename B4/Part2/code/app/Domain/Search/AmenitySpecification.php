<?php

namespace App\Domain\Search;

final readonly class AmenitySpecification implements PropertySpecification
{
    public function __construct(private string $amenity)
    {
    }

    public function isSatisfiedBy(array $property): bool
    {
        return in_array(strtolower($this->amenity), array_map('strtolower', $property['amenities'] ?? []), true);
    }
}
