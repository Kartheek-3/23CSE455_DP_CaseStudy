<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SecurityDeposit extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'tenant_id',
        'owner_id',
        'total_amount',
        'months_count',
        'monthly_rent_at_time',
        'amount_in_words',
        'deposit_date',
        'payment_method',
        'status',
        'total_deductions',
        'refunded_amount',
        'balance',
        'refund_date',
        'notes',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'monthly_rent_at_time' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'refunded_amount' => 'decimal:2',
        'balance' => 'decimal:2',
        'deposit_date' => 'date',
        'refund_date' => 'date',
    ];

    // Auto-calculate balance on save
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($deposit) {
            $deposit->balance = $deposit->total_amount
                - $deposit->total_deductions
                - $deposit->refunded_amount;
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

    public function deductions()
    {
        return $this->hasMany(SecurityDepositDeduction::class);
    }

    // Helper: recalculate totals from deductions
    public function recalculateDeductions()
    {
        $this->total_deductions = $this->deductions()->sum('amount');
        $this->save();
    }
}
