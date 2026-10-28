<?php

namespace App\Domain\Search;

final readonly class AddressContainsSpecification implements PropertySpecification
{
    public function __construct(private string $fragment)
    {
    }

    public function isSatisfiedBy(array $property): bool
    {
        return str_contains(
            strtolower((string) ($property['address'] ?? '')),
            strtolower($this->fragment),
        );
    }
}
