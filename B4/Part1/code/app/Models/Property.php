<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'tenant_id',
        'address',
        'monthly_rent',
        'maintenance_total',
        'owner_maintenance_percent',
        'tenant_maintenance_percent',
        'electricity_rate_per_unit',
        'status',
    ];

    // ── Casts ────────────────────────────────────
    // In Yii2, types come from DB schema. In Laravel,
    // $casts tells Eloquent how to convert attributes.
    // When you do $property->monthly_rent, it returns a float, not string.

    protected $casts = [
        'monthly_rent' => 'decimal:2',
        'maintenance_total' => 'decimal:2',
        'electricity_rate_per_unit' => 'decimal:2',
    ];

    public function owner()
    {
        return $this->belongsTo(Owner::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function rentReceipts()
    {
        return $this->hasMany(RentReceipt::class);
    }

    public function maintenanceReceipts()
    {
        return $this->hasMany(MaintenanceReceipt::class);
    }

    public function electricityReceipts()
    {
        return $this->hasMany(ElectricityReceipt::class);
    }

    public function rateHistories()
    {
        return $this->hasMany(RateHistory::class);
    }
}
