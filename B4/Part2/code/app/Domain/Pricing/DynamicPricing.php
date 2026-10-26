<?php

namespace App\Domain\Pricing;

use InvalidArgumentException;

final class DynamicPricing implements PricingStrategy
{
    public function quote(float $baseMonthlyRent, PricingContext $context): float
    {
        if ($baseMonthlyRent <= 0) {
            throw new InvalidArgumentException('Base monthly rent must be positive.');
        }

        $multiplier = 1.0;
        $multiplier += in_array($context->month, [4, 5, 12], true) ? 0.20 : 0.0;
        $multiplier += $context->occupancyRate >= 0.80 ? 0.10 : 0.0;
        $multiplier -= $context->leaseMonths >= 12 ? 0.05 : 0.0;

        return round($baseMonthlyRent * $multiplier, 2);
    }
}
