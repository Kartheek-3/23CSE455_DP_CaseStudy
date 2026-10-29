<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceReceipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'tenant_id',
        'owner_id',
        'month',
        'total_maintenance',
        'owner_percent',
        'tenant_percent',
        'owner_share',
        'tenant_share',
        'tenant_amount_in_words',
        'payment_method',
        'payment_date',
        'notes',
        'bill_reference',
        'bill_attachment',
    ];

    protected $casts = [
        'total_maintenance' => 'decimal:2',
        'owner_share' => 'decimal:2',
        'tenant_share' => 'decimal:2',
        'payment_date' => 'date',
    ];

    // ── Auto-Calculate on Save ───────────────────
    // Yii2 equivalent:
    //   public function beforeSave($insert) {
    //       $this->owner_share = $this->total_maintenance * ($this->owner_percent / 100);
    //       $this->tenant_share = $this->total_maintenance * ($this->tenant_percent / 100);
    //       return parent::beforeSave($insert);
    //   }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($receipt) {
            $receipt->owner_share = $receipt->total_maintenance
                * ($receipt->owner_percent / 100);
            $receipt->tenant_share = $receipt->total_maintenance
                * ($receipt->tenant_percent / 100);
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
