<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMaintenanceReceiptRequest extends FormRequest
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
            'total_maintenance' => 'required|numeric|min:1',
            'owner_percent' => 'required|integer|min:0|max:100',
            'tenant_percent' => 'required|integer|min:0|max:100',
            'tenant_amount_in_words' => 'required|string|max:255',
            'payment_method' => 'required|in:cash,bank_transfer,cheque,online',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:500',
            'bill_reference' => 'nullable|string|max:100',
            'bill_attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:25600',
        ];
    }
}
