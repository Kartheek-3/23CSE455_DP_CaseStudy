<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRentReceiptRequest extends FormRequest
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
            'amount_in_words' => 'required|string|max:255',
            'payment_method' => 'required|in:cash,bank_transfer,cheque,online',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
        ];
    }
}
