<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RateHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'type',
        'old_value',
        'new_value',
        'effective_date',
        'notes',
    ];

    protected $casts = [
        'old_value' => 'decimal:2',
        'new_value' => 'decimal:2',
        'effective_date' => 'date',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }
}
