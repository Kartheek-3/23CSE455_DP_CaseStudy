<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Owner;
use App\Models\Tenant;
use App\Models\Property;
use App\Models\RentReceipt;
use App\Models\MaintenanceReceipt;
use App\Models\ElectricityReceipt;
use App\Models\SecurityDeposit;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // ── ADMIN ────────────────────────────────
        User::create([
            'name' => 'Admin',
            'email' => 'admin@admin.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // ── OWNER 1 ─────────────────────────────
        $owner1User = User::create([
            'name' => 'Owner 1',
            'email' => 'owner1@example.com',
            'password' => Hash::make('password'),
            'role' => 'owner',
        ]);

        $owner1 = Owner::create([
            'user_id' => $owner1User->id,
            'name' => 'Owner 1',
            'phone' => '0300-1111111',
            'cnic' => '00000-0000000-0',
            'address' => 'Address of Owner 1',
        ]);

        // ── OWNER 2 ─────────────────────────────
        $owner2User = User::create([
            'name' => 'Owner 2',
            'email' => 'owner2@example.com',
            'password' => Hash::make('password'),
            'role' => 'owner',
        ]);

        $owner2 = Owner::create([
            'user_id' => $owner2User->id,
            'name' => 'Owner 2',
            'phone' => '0300-2222222',
            'cnic' => '00000-0000000-1',
            'address' => 'Address of Owner 2',
        ]);

        // ── TENANT 1 ────────────────────────────
        $tenant1User = User::create([
            'name' => 'Tenant 1',
            'email' => 'tenant1@example.com',
            'password' => Hash::make('password'),
            'role' => 'tenant',
        ]);

        $tenant1 = Tenant::create([
            'user_id' => $tenant1User->id,
            'name' => 'Tenant 1',
            'phone' => '0311-1111111',
            'cnic' => '00000-0000000-2',
            'address' => 'Address of Tenant 1',
        ]);

        // ── TENANT 2 ────────────────────────────
        $tenant2User = User::create([
            'name' => 'Tenant 2',
            'email' => 'tenant2@example.com',
            'password' => Hash::make('password'),
            'role' => 'tenant',
        ]);

        $tenant2 = Tenant::create([
            'user_id' => $tenant2User->id,
            'name' => 'Tenant 2',
            'phone' => '0311-2222222',
            'cnic' => '00000-0000000-3',
            'address' => 'Address of Tenant 2',
        ]);

        // ── PROPERTIES ──────────────────────────
        $property1 = Property::create([
            'owner_id' => $owner1->id,
            'tenant_id' => $tenant1->id,
            'address' => 'House # 1, Block A, Demo Town',
            'monthly_rent' => 40000,
            'maintenance_total' => 3950,
            'owner_maintenance_percent' => 50,
            'tenant_maintenance_percent' => 50,
            'electricity_rate_per_unit' => 0,
            'status' => 'occupied',
        ]);

        $property2 = Property::create([
            'owner_id' => $owner2->id,
            'tenant_id' => $tenant2->id,
            'address' => 'House # 2, Block B, Demo Town',
            'monthly_rent' => 35000,
            'maintenance_total' => 3000,
            'owner_maintenance_percent' => 50,
            'tenant_maintenance_percent' => 50,
            'electricity_rate_per_unit' => 0,
            'status' => 'occupied',
        ]);

        Property::create([
            'owner_id' => $owner1->id,
            'tenant_id' => null,
            'address' => 'House # 3, Block A, Demo Town',
            'monthly_rent' => 45000,
            'maintenance_total' => 0,
            'owner_maintenance_percent' => 50,
            'tenant_maintenance_percent' => 50,
            'electricity_rate_per_unit' => 0,
            'status' => 'vacant',
        ]);

        // ── SECURITY DEPOSITS ───────────────────
        SecurityDeposit::create([
            'property_id' => $property1->id,
            'tenant_id' => $tenant1->id,
            'owner_id' => $owner1->id,
            'total_amount' => 80000,
            'months_count' => 2,
            'monthly_rent_at_time' => 40000,
            'amount_in_words' => 'Eighty Thousand Rupees Only',
            'deposit_date' => '2025-01-01',
            'payment_method' => 'cash',
            'status' => 'held',
            'total_deductions' => 0,
            'refunded_amount' => 0,
            'balance' => 80000,
            'notes' => 'Security deposit at time of move-in',
        ]);

        SecurityDeposit::create([
            'property_id' => $property2->id,
            'tenant_id' => $tenant2->id,
            'owner_id' => $owner2->id,
            'total_amount' => 70000,
            'months_count' => 2,
            'monthly_rent_at_time' => 35000,
            'amount_in_words' => 'Seventy Thousand Rupees Only',
            'deposit_date' => '2025-03-01',
            'payment_method' => 'bank_transfer',
            'status' => 'held',
            'total_deductions' => 0,
            'refunded_amount' => 0,
            'balance' => 70000,
            'notes' => 'Security deposit at time of move-in',
        ]);

        // ── RENT RECEIPTS (6 months for each property) ──
        $rentMonths = [
            ['month' => 'January 2025', 'date' => '2025-01-10'],
            ['month' => 'February 2025', 'date' => '2025-02-10'],
            ['month' => 'March 2025', 'date' => '2025-03-10'],
            ['month' => 'April 2025', 'date' => '2025-04-10'],
            ['month' => 'May 2025', 'date' => '2025-05-10'],
            ['month' => 'June 2025', 'date' => '2025-06-10'],
        ];

        foreach ($rentMonths as $rm) {
            RentReceipt::create([
                'property_id' => $property1->id,
                'tenant_id' => $tenant1->id,
                'owner_id' => $owner1->id,
                'month' => $rm['month'],
                'amount' => 40000,
                'amount_in_words' => 'Forty Thousand Rupees Only',
                'payment_method' => 'cash',
                'payment_date' => $rm['date'],
            ]);

            RentReceipt::create([
                'property_id' => $property2->id,
                'tenant_id' => $tenant2->id,
                'owner_id' => $owner2->id,
                'month' => $rm['month'],
                'amount' => 35000,
                'amount_in_words' => 'Thirty Five Thousand Rupees Only',
                'payment_method' => 'bank_transfer',
                'payment_date' => $rm['date'],
            ]);
        }

        // ── MAINTENANCE RECEIPTS (6 months for each property) ──
        foreach ($rentMonths as $rm) {
            MaintenanceReceipt::create([
                'property_id' => $property1->id,
                'tenant_id' => $tenant1->id,
                'owner_id' => $owner1->id,
                'month' => $rm['month'],
                'total_maintenance' => 3950,
                'owner_percent' => 50,
                'tenant_percent' => 50,
                'owner_share' => 1975,
                'tenant_share' => 1975,
                'tenant_amount_in_words' => 'One Thousand Nine Hundred and Seventy Five Rupees Only',
                'payment_method' => 'cash',
                'payment_date' => $rm['date'],
            ]);

            MaintenanceReceipt::create([
                'property_id' => $property2->id,
                'tenant_id' => $tenant2->id,
                'owner_id' => $owner2->id,
                'month' => $rm['month'],
                'total_maintenance' => 3000,
                'owner_percent' => 50,
                'tenant_percent' => 50,
                'owner_share' => 1500,
                'tenant_share' => 1500,
                'tenant_amount_in_words' => 'One Thousand Five Hundred Rupees Only',
                'payment_method' => 'bank_transfer',
                'payment_date' => $rm['date'],
            ]);
        }

        // ── ELECTRICITY RECEIPTS (6 months for each property) ──
        // Property 1: Main meter starts at 1700, sub meter starts at 50
        $mainPrev1 = 1700;
        $subPrev1 = 50;
        // Property 2: Main meter starts at 2200, sub meter starts at 100
        $mainPrev2 = 2200;
        $subPrev2 = 100;

        $elecData = [
            ['month' => 'January 2025', 'date' => '2025-02-10', 'prev_date' => '2024-12-28', 'curr_date' => '2025-01-28', 'bill1' => 640, 'main_units1' => 9, 'sub_units1' => 7, 'bill2' => 920, 'main_units2' => 15, 'sub_units2' => 12],
            ['month' => 'February 2025', 'date' => '2025-03-10', 'prev_date' => '2025-01-28', 'curr_date' => '2025-02-27', 'bill1' => 300, 'main_units1' => 1, 'sub_units1' => 1, 'bill2' => 580, 'main_units2' => 8, 'sub_units2' => 6],
            ['month' => 'March 2025', 'date' => '2025-04-10', 'prev_date' => '2025-02-27', 'curr_date' => '2025-03-29', 'bill1' => 780, 'main_units1' => 11, 'sub_units1' => 9, 'bill2' => 1100, 'main_units2' => 18, 'sub_units2' => 14],
            ['month' => 'April 2025', 'date' => '2025-05-10', 'prev_date' => '2025-03-29', 'curr_date' => '2025-04-28', 'bill1' => 340, 'main_units1' => 6, 'sub_units1' => 5, 'bill2' => 750, 'main_units2' => 12, 'sub_units2' => 9],
            ['month' => 'May 2025', 'date' => '2025-06-10', 'prev_date' => '2025-04-28', 'curr_date' => '2025-05-29', 'bill1' => 1170, 'main_units1' => 18, 'sub_units1' => 15, 'bill2' => 1400, 'main_units2' => 22, 'sub_units2' => 18],
            ['month' => 'June 2025', 'date' => '2025-07-10', 'prev_date' => '2025-05-29', 'curr_date' => '2025-06-28', 'bill1' => 350, 'main_units1' => 7, 'sub_units1' => 5, 'bill2' => 680, 'main_units2' => 10, 'sub_units2' => 8],
        ];

        foreach ($elecData as $ed) {
            $mainCurr1 = $mainPrev1 + $ed['main_units1'];
            $subCurr1 = $subPrev1 + $ed['sub_units1'];
            $rate1 = $ed['main_units1'] > 0 ? round($ed['bill1'] / $ed['main_units1'], 2) : 0;
            $tenantBill1 = round($ed['sub_units1'] * $rate1);
            $ownerUnits1 = $ed['main_units1'] - $ed['sub_units1'];
            $ownerBill1 = round($ownerUnits1 * $rate1);

            ElectricityReceipt::create([
                'property_id' => $property1->id,
                'tenant_id' => $tenant1->id,
                'owner_id' => $owner1->id,
                'month' => $ed['month'],
                'main_previous_reading' => $mainPrev1,
                'main_current_reading' => $mainCurr1,
                'main_previous_date' => $ed['prev_date'],
                'main_current_date' => $ed['curr_date'],
                'main_total_units' => $ed['main_units1'],
                'sub_previous_reading' => $subPrev1,
                'sub_current_reading' => $subCurr1,
                'tenant_units_consumed' => $ed['sub_units1'],
                'rate_per_unit' => $rate1,
                'tenant_bill' => $tenantBill1,
                'main_bill_amount' => $ed['bill1'],
                'owner_units_consumed' => $ownerUnits1,
                'owner_bill' => $ownerBill1,
                'tenant_amount_in_words' => 'Rs. ' . number_format($tenantBill1) . ' (auto-generated)',
                'payment_method' => 'cash',
                'payment_date' => $ed['date'],
            ]);

            $mainPrev1 = $mainCurr1;
            $subPrev1 = $subCurr1;

            // Property 2
            $mainCurr2 = $mainPrev2 + $ed['main_units2'];
            $subCurr2 = $subPrev2 + $ed['sub_units2'];
            $rate2 = $ed['main_units2'] > 0 ? round($ed['bill2'] / $ed['main_units2'], 2) : 0;
            $tenantBill2 = round($ed['sub_units2'] * $rate2);
            $ownerUnits2 = $ed['main_units2'] - $ed['sub_units2'];
            $ownerBill2 = round($ownerUnits2 * $rate2);

            ElectricityReceipt::create([
                'property_id' => $property2->id,
                'tenant_id' => $tenant2->id,
                'owner_id' => $owner2->id,
                'month' => $ed['month'],
                'main_previous_reading' => $mainPrev2,
                'main_current_reading' => $mainCurr2,
                'main_previous_date' => $ed['prev_date'],
                'main_current_date' => $ed['curr_date'],
                'main_total_units' => $ed['main_units2'],
                'sub_previous_reading' => $subPrev2,
                'sub_current_reading' => $subCurr2,
                'tenant_units_consumed' => $ed['sub_units2'],
                'rate_per_unit' => $rate2,
                'tenant_bill' => $tenantBill2,
                'main_bill_amount' => $ed['bill2'],
                'owner_units_consumed' => $ownerUnits2,
                'owner_bill' => $ownerBill2,
                'tenant_amount_in_words' => 'Rs. ' . number_format($tenantBill2) . ' (auto-generated)',
                'payment_method' => 'bank_transfer',
                'payment_date' => $ed['date'],
            ]);

            $mainPrev2 = $mainCurr2;
            $subPrev2 = $subCurr2;
        }
    }
}
