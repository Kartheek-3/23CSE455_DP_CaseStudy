<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateElectricityReceiptRequest extends FormRequest
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
            'main_previous_reading' => 'required|integer|min:0',
            'main_current_reading' => 'required|integer|gt:main_previous_reading',
            'main_previous_date' => 'required|date',
            'main_current_date' => 'required|date|after_or_equal:main_previous_date',
            'sub_previous_reading' => 'required|integer|min:0',
            'sub_current_reading' => 'required|integer|gt:sub_previous_reading',
            'rate_per_unit' => 'required|numeric|min:0',
            'main_bill_amount' => 'required|numeric|min:0',
            'tenant_amount_in_words' => 'required|string|max:255',
            'payment_method' => 'required|in:cash,bank_transfer,cheque,online',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:5000',
            'bill_reference' => 'nullable|string|max:100',
            'bill_attachment' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:25600',
            'submeter_previous_photo' => 'nullable|file|mimes:jpg,jpeg,png|max:25600',
            'submeter_current_photo' => 'nullable|file|mimes:jpg,jpeg,png|max:25600',
        ];
    }

    public function messages(): array
    {
        return [
            'main_current_reading.gt' => 'Current main meter reading must be greater than previous reading.',
            'sub_current_reading.gt' => 'Current sub-meter reading must be greater than previous reading.',
        ];
    }
}
