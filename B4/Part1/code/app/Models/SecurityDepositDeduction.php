<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SecurityDepositDeduction extends Model
{
    use HasFactory;

    protected $fillable = [
        'security_deposit_id',
        'amount',
        'reason',
        'deduction_date',
        'notes',
        'attachment',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'deduction_date' => 'date',
    ];

    public function securityDeposit()
    {
        return $this->belongsTo(SecurityDeposit::class);
    }
}
