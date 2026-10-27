<?php

namespace App\Domain\Pricing;

final class PricingService
{
    public function __construct(private PricingStrategy $strategy)
    {
    }

    public function quote(float $baseMonthlyRent, PricingContext $context): float
    {
        return $this->strategy->quote($baseMonthlyRent, $context);
    }
}
