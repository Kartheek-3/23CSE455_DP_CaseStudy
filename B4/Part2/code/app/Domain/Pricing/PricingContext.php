<?php

namespace App\Domain\Pricing;

use InvalidArgumentException;

final readonly class PricingContext
{
    public function __construct(
        public int $month,
        public float $occupancyRate,
        public int $leaseMonths,
    ) {
        if ($month < 1 || $month > 12) {
            throw new InvalidArgumentException('Month must be between 1 and 12.');
        }

        if ($occupancyRate < 0 || $occupancyRate > 1) {
            throw new InvalidArgumentException('Occupancy rate must be between 0 and 1.');
        }

        if ($leaseMonths < 1) {
            throw new InvalidArgumentException('Lease months must be positive.');
        }
    }
}
