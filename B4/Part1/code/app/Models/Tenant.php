<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'phone',
        'cnic',
        'address',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function property()
    {
        return $this->hasOne(Property::class);
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
