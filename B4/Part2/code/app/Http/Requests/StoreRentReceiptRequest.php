<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRentReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property_id' => 'required|exists:properties,id',
            'month' => 'required|string|max:50',
            'amount' => 'required|numeric|min:1',
            'use_dynamic_pricing' => 'sometimes|boolean',
            'pricing_month' => 'nullable|integer|min:1|max:12',
            'occupancy_rate' => 'nullable|numeric|min:0|max:1',
            'lease_months' => 'nullable|integer|min:1|max:120',
            'amount_in_words' => 'required|string|max:255',
            'payment_method' => 'required|in:cash,bank_transfer,cheque,online',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ];
    }
}
