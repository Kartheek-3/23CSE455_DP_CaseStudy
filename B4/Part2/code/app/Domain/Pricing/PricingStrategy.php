<?php

namespace App\Domain\Pricing;

interface PricingStrategy
{
    public function quote(float $baseMonthlyRent, PricingContext $context): float;
}
