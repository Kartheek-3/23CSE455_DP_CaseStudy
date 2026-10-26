<?php

namespace App\Domain\Search;

final readonly class AndSpecification implements PropertySpecification
{
    /** @param list<PropertySpecification> $specifications */
    public function __construct(private array $specifications)
    {
    }

    public function isSatisfiedBy(array $property): bool
    {
        foreach ($this->specifications as $specification) {
            if (! $specification->isSatisfiedBy($property)) {
                return false;
            }
        }

        return true;
    }
}
