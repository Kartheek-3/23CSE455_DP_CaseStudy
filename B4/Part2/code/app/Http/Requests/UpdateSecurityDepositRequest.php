<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSecurityDepositRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'total_amount' => 'required|numeric|min:1',
            'months_count' => 'required|integer|min:1|max:12',
            'monthly_rent_at_time' => 'required|numeric|min:1',
            'amount_in_words' => 'required|string|max:255',
            'deposit_date' => 'required|date',
            'payment_method' => 'required|in:cash,bank_transfer,cheque,online',
            'notes' => 'nullable|string|max:500',
        ];
    }
}
