<?php

namespace App\Domain\Search;

final readonly class FurnishedSpecification implements PropertySpecification
{
    public function __construct(private bool $required)
    {
    }

    public function isSatisfiedBy(array $property): bool
    {
        return (bool) ($property['furnished'] ?? false) === $this->required;
    }
}
