<?php

namespace App\Domain\Search;

final readonly class StatusSpecification implements PropertySpecification
{
    public function __construct(private string $status)
    {
    }

    public function isSatisfiedBy(array $property): bool
    {
        return ($property['status'] ?? null) === $this->status;
    }
}
