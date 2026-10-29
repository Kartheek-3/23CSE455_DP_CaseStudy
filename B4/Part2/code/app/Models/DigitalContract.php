<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DigitalContract extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id',
        'tenant_id',
        'document_hash',
        'signature_hash',
        'status',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
