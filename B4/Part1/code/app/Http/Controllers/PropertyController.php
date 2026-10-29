<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Models\Owner;
use App\Models\Tenant;
use App\Http\Requests\StorePropertyRequest;
use App\Http\Requests\UpdatePropertyRequest;

class PropertyController extends Controller
{
    public function index()
    {
        $properties = Property::with(['owner', 'tenant'])
            ->latest()
            ->paginate(10);

        return view('properties.index', compact('properties'));
    }

    public function create()
    {
        $owners = Owner::all();
        // Only show tenants not already assigned to a property
        $tenants = Tenant::whereDoesntHave('property')->get();

        return view('properties.create', compact('owners', 'tenants'));
    }

    public function store(StorePropertyRequest $request)
    {
        Property::create([
            'owner_id' => $request->owner_id,
            'tenant_id' => $request->tenant_id ?: null,
            'address' => $request->address,
            'monthly_rent' => $request->monthly_rent,
            'maintenance_total' => $request->maintenance_total ?? 0,
            'owner_maintenance_percent' => $request->owner_maintenance_percent ?? 50,
            'tenant_maintenance_percent' => $request->tenant_maintenance_percent ?? 50,
            'electricity_rate_per_unit' => $request->electricity_rate_per_unit ?? 0,
            'status' => $request->tenant_id ? 'occupied' : 'vacant',
        ]);

        return redirect()->route('properties.index')
            ->with('success', 'Property created successfully.');
    }

    public function show(Property $property)
    {
        $property->load('owner', 'tenant', 'rentReceipts', 'maintenanceReceipts', 'electricityReceipts');
        return view('properties.show', compact('property'));
    }

    public function edit(Property $property)
    {
        $owners = Owner::all();
        // Show unassigned tenants + the currently assigned tenant
        $tenants = Tenant::where(function ($q) use ($property) {
            $q->whereDoesntHave('property')
                ->orWhere('id', $property->tenant_id);
        })->get();

        return view('properties.edit', compact('property', 'owners', 'tenants'));
    }

    public function update(UpdatePropertyRequest $request, Property $property)
    {
        // ── Log rate changes before updating ─────
        // In Yii2 you'd do this in beforeSave() comparing old vs new
        // In Laravel, we check before calling update()

        $rateFields = [
            'electricity_rate_per_unit' => 'electricity_rate',
            'maintenance_total' => 'maintenance',
            'monthly_rent' => 'rent',
        ];

        foreach ($rateFields as $field => $type) {
            $newValue = $request->$field ?? 0;
            $oldValue = $property->$field ?? 0;

            if ((float) $oldValue !== (float) $newValue && (float) $oldValue > 0) {
                \App\Models\RateHistory::create([
                    'property_id' => $property->id,
                    'type' => $type,
                    'old_value' => $oldValue,
                    'new_value' => $newValue,
                    'effective_date' => now()->toDateString(),
                    'notes' => ucfirst(str_replace('_', ' ', $type))
                        . " changed from Rs. {$oldValue} to Rs. {$newValue}",
                ]);
            }
        }

        $property->update([
            'owner_id' => $request->owner_id,
            'tenant_id' => $request->tenant_id ?: null,
            'address' => $request->address,
            'monthly_rent' => $request->monthly_rent,
            'maintenance_total' => $request->maintenance_total ?? 0,
            'owner_maintenance_percent' => $request->owner_maintenance_percent ?? 50,
            'tenant_maintenance_percent' => $request->tenant_maintenance_percent ?? 50,
            'electricity_rate_per_unit' => $request->electricity_rate_per_unit ?? 0,
            'status' => $request->tenant_id ? 'occupied' : 'vacant',
        ]);

        return redirect()->route('properties.index')
            ->with('success', 'Property updated successfully.');
    }

    public function destroy(Property $property)
    {
        $property->delete();

        return redirect()->route('properties.index')
            ->with('success', 'Property deleted successfully.');
    }
}
