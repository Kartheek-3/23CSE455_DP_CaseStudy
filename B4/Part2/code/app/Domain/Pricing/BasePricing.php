<?php

namespace App\Domain\Pricing;

use InvalidArgumentException;

final class BasePricing implements PricingStrategy
{
    public function quote(float $baseMonthlyRent, PricingContext $context): float
    {
        if ($baseMonthlyRent <= 0) {
            throw new InvalidArgumentException('Base monthly rent must be positive.');
        }

        return round($baseMonthlyRent, 2);
    }
}
