<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ElectricityReceipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'tenant_id',
        'owner_id',
        'month',
        'main_previous_reading',
        'main_current_reading',
        'main_previous_date',
        'main_current_date',
        'main_total_units',
        'sub_previous_reading',
        'sub_current_reading',
        'tenant_units_consumed',
        'rate_per_unit',
        'tenant_bill',
        'main_bill_amount',
        'owner_units_consumed',
        'owner_bill',
        'tenant_amount_in_words',
        'payment_method',
        'payment_date',
        'notes',
        'bill_reference',
        'bill_attachment',
        'submeter_previous_photo',
        'submeter_current_photo',
    ];

    protected $casts = [
        'rate_per_unit' => 'decimal:2',
        'tenant_bill' => 'decimal:2',
        'main_bill_amount' => 'decimal:2',
        'owner_bill' => 'decimal:2',
        'payment_date' => 'date',
        'main_previous_date' => 'date',
        'main_current_date' => 'date',
    ];

    // ── Auto-Calculate ───────────────────────────
    // Based on your electricity receipt:
    // Main meter: 1932 - 1874 = 58 total units
    // Sub meter: 173 - 117 = 56 tenant units
    // Owner units: 58 - 56 = 2
    // Tenant bill: 56 × 62.90 = Rs. 3,522
    // Owner bill: 2 × 62.90 = Rs. 126

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($r) {
            // Total units from main meter
            $r->main_total_units = $r->main_current_reading - $r->main_previous_reading;

            // Tenant units from sub-meter
            $r->tenant_units_consumed = $r->sub_current_reading - $r->sub_previous_reading;

            // Owner gets the difference
            $r->owner_units_consumed = $r->main_total_units - $r->tenant_units_consumed;

            // Calculate bills
            $r->tenant_bill = $r->tenant_units_consumed * $r->rate_per_unit;
            $r->owner_bill = $r->owner_units_consumed * $r->rate_per_unit;
        });
    }

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function owner()
    {
        return $this->belongsTo(Owner::class);
    }
}
