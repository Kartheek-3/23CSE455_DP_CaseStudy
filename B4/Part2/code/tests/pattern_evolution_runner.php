<?php

use App\Domain\Contracts\DigitalContract;
use App\Domain\Pricing\BasePricing;
use App\Domain\Pricing\DynamicPricing;
use App\Domain\Pricing\PricingContext;
use App\Domain\Pricing\PricingService;
use App\Domain\Search\AddressContainsSpecification;
use App\Domain\Search\AndSpecification;
use App\Domain\Search\AmenitySpecification;
use App\Domain\Search\AvailableSpecification;
use App\Domain\Search\CitySpecification;
use App\Domain\Search\FurnishedSpecification;
use App\Domain\Search\MaxMonthlyRentSpecification;
use App\Domain\Search\PropertyFilterService;
use App\Domain\Search\RentRangeSpecification;
use App\Domain\Search\StatusSpecification;

$root = dirname(__DIR__);
$files = [
    'app/Domain/Pricing/PricingContext.php',
    'app/Domain/Pricing/PricingStrategy.php',
    'app/Domain/Pricing/BasePricing.php',
    'app/Domain/Pricing/DynamicPricing.php',
    'app/Domain/Pricing/PricingService.php',
    'app/Domain/Search/PropertySpecification.php',
    'app/Domain/Search/AddressContainsSpecification.php',
    'app/Domain/Search/MaxMonthlyRentSpecification.php',
    'app/Domain/Search/StatusSpecification.php',
    'app/Domain/Search/AvailableSpecification.php',
    'app/Domain/Search/CitySpecification.php',
    'app/Domain/Search/RentRangeSpecification.php',
    'app/Domain/Search/AmenitySpecification.php',
    'app/Domain/Search/FurnishedSpecification.php',
    'app/Domain/Search/AndSpecification.php',
    'app/Domain/Search/PropertyFilterService.php',
    'app/Domain/Contracts/ContractState.php',
    'app/Domain/Contracts/AbstractContractState.php',
    'app/Domain/Contracts/DraftState.php',
    'app/Domain/Contracts/SentState.php',
    'app/Domain/Contracts/SignedState.php',
    'app/Domain/Contracts/ExpiredState.php',
    'app/Domain/Contracts/DigitalContract.php',
];
foreach ($files as $file) {
    require_once "{$root}/{$file}";
}

$passed = 0;
$assert = static function (bool $condition, string $message) use (&$passed): void {
    if (! $condition) {
        throw new RuntimeException("FAIL: {$message}");
    }
    $passed++;
    echo "PASS: {$message}\n";
};

$context = new PricingContext(4, 0.90, 12);
$assert((new PricingService(new BasePricing()))->quote(10000, $context) === 10000.0, 'base pricing preserves rent');
$assert((new PricingService(new DynamicPricing()))->quote(10000, $context) === 12500.0, 'dynamic pricing combines demand, season and lease term');

$properties = [
    ['id' => 1, 'city' => 'Kochi', 'monthly_rent' => 20000, 'available' => true, 'amenities' => ['parking'], 'furnished' => true],
    ['id' => 2, 'city' => 'Kochi', 'monthly_rent' => 26000, 'available' => true, 'amenities' => ['parking'], 'furnished' => true],
    ['id' => 3, 'city' => 'Kochi', 'monthly_rent' => 19000, 'available' => false, 'amenities' => ['parking'], 'furnished' => true],
    ['id' => 4, 'city' => 'Chennai', 'monthly_rent' => 18000, 'available' => true, 'amenities' => ['gym'], 'furnished' => false],
];
$criteria = new AndSpecification([
    new AvailableSpecification(),
    new CitySpecification('kochi'),
    new RentRangeSpecification(18000, 25000),
    new AmenitySpecification('parking'),
    new FurnishedSpecification(true),
]);
$matches = (new PropertyFilterService())->matching($properties, $criteria);
$assert(count($matches) === 1, 'composed specifications return one property');
$assert($matches[0]['id'] === 1, 'composed specifications select the expected property');

$contract = new DigitalContract(hash('sha256', 'lease-42'));
$assert($contract->state() === 'draft', 'contract begins in draft');
$contract->send();
$assert($contract->state() === 'sent', 'draft contract can be sent');
$signature = hash('sha256', 'tenant-signature');
$contract->sign($signature);
$assert($contract->state() === 'signed', 'sent contract can be signed');
$assert($contract->signatureHash() === $signature, 'signature hash is retained');

try {
    $contract->expire();
    $assert(false, 'signed contract rejects expiry');
} catch (DomainException) {
    $assert(true, 'signed contract rejects expiry');
}

try {
    new DigitalContract('invalid');
    $assert(false, 'invalid document hash is rejected');
} catch (InvalidArgumentException) {
    $assert(true, 'invalid document hash is rejected');
}

echo "RESULT: {$passed}/{$passed} passed\n";
