<?php

namespace App\Domain\Search;

final class AvailableSpecification implements PropertySpecification
{
    public function isSatisfiedBy(array $property): bool
    {
        return ($property['available'] ?? false) === true;
    }
}
