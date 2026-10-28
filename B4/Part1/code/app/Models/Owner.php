<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Owner extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'phone',
        'cnic',
        'address',
    ];

    // ── Relationships ────────────────────────────
    // Yii2: $this->hasOne(User::class, ['id' => 'user_id'])
    // Laravel: belongsTo auto-looks for 'user_id' column

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function properties()
    {
        return $this->hasMany(Property::class);
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
}
