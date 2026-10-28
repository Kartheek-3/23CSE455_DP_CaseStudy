<?php

namespace App\Domain\Search;

final class PropertyFilterService
{
    /**
     * @param list<array<string, mixed>> $properties
     * @return list<array<string, mixed>>
     */
    public function matching(array $properties, PropertySpecification $specification): array
    {
        return array_values(array_filter(
            $properties,
            fn (array $property): bool => $specification->isSatisfiedBy($property),
        ));
    }
}
