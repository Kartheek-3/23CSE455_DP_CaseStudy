<?php

namespace App\Http\Controllers;

use App\Models\Owner;
use App\Models\Tenant;
use App\Models\Property;
use App\Models\RentReceipt;
use App\Models\MaintenanceReceipt;
use App\Models\ElectricityReceipt;
use App\Models\SecurityDeposit;

class HomeController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        // Redirect tenants to their own portal
        if (auth()->user()->isTenant()) {
            return redirect()->route('tenant.dashboard');
        }

        $stats = [
            'total_properties' => Property::count(),
            'occupied_properties' => Property::where('status', 'occupied')->count(),
            'vacant_properties' => Property::where('status', 'vacant')->count(),
            'total_owners' => Owner::count(),
            'total_tenants' => Tenant::count(),
            'active_tenants' => Property::where('status', 'occupied')->count(),

            // Financial
            'total_rent_collected' => RentReceipt::sum('amount'),
            'rent_this_month' => RentReceipt::where('month', now()->format('F Y'))->sum('amount'),
            'total_maintenance' => MaintenanceReceipt::sum('tenant_share'),
            'total_electricity' => ElectricityReceipt::sum('tenant_bill'),
            'security_held' => SecurityDeposit::where('status', 'held')->sum('balance'),

            // Counts
            'rent_receipts' => RentReceipt::count(),
            'maintenance_receipts' => MaintenanceReceipt::count(),
            'electricity_receipts' => ElectricityReceipt::count(),
        ];

        // Recent receipts (combined from all 3 types, last 10)
        $recentRent = RentReceipt::with(['tenant', 'property'])
            ->latest()->take(5)->get()
            ->map(function ($r) {
                return [
                    'type' => 'Rent',
                    'icon' => 'bi-receipt',
                    'color' => '#4f46e5',
                    'month' => $r->month,
                    'tenant' => $r->tenant->name,
                    'amount' => $r->amount,
                    'date' => $r->payment_date,
                    'url' => route('rent-receipts.show', $r),
                ];
            });

        $recentMaintenance = MaintenanceReceipt::with(['tenant', 'property'])
            ->latest()->take(5)->get()
            ->map(function ($r) {
                return [
                    'type' => 'Maintenance',
                    'icon' => 'bi-tools',
                    'color' => '#eab308',
                    'month' => $r->month,
                    'tenant' => $r->tenant->name,
                    'amount' => $r->tenant_share,
                    'date' => $r->payment_date,
                    'url' => route('maintenance-receipts.show', $r),
                ];
            });

        $recentElectricity = ElectricityReceipt::with(['tenant', 'property'])
            ->latest()->take(5)->get()
            ->map(function ($r) {
                return [
                    'type' => 'Electricity',
                    'icon' => 'bi-lightning-charge',
                    'color' => '#ef4444',
                    'month' => $r->month,
                    'tenant' => $r->tenant->name,
                    'amount' => $r->tenant_bill,
                    'date' => $r->payment_date,
                    'url' => route('electricity-receipts.show', $r),
                ];
            });

        $recentReceipts = collect()
            ->merge($recentRent)
            ->merge($recentMaintenance)
            ->merge($recentElectricity)
            ->sortByDesc('date')
            ->take(10)
            ->values();

        // Featured property for the overview panel (prefer an occupied one)
        $featuredProperty = Property::with(['owner', 'tenant'])
            ->orderByRaw("status = 'occupied' DESC")
            ->first();

        return view('home', compact('stats', 'recentReceipts', 'featuredProperty'));
    }
}
