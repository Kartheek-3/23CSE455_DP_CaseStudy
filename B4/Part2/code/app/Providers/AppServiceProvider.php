<?php

namespace App\Providers;

use App\Domain\Pricing\DynamicPricing;
use App\Domain\Pricing\PricingStrategy;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(PricingStrategy::class, DynamicPricing::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Paginator::useBootstrapFive();
    }
}
