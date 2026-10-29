<?php

namespace App\Domain\Search;

interface PropertySpecification
{
    /** @param array<string, mixed> $property */
    public function isSatisfiedBy(array $property): bool;
}
