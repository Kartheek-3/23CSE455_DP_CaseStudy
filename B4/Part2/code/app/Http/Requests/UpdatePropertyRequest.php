<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'owner_id' => 'required|exists:owners,id',
            'tenant_id' => 'nullable|exists:tenants,id',
            'address' => 'required|string|max:500',
            'monthly_rent' => 'required|numeric|min:0',
            'maintenance_total' => 'nullable|numeric|min:0',
            'owner_maintenance_percent' => 'nullable|integer|min:0|max:100',
            'tenant_maintenance_percent' => 'nullable|integer|min:0|max:100',
            'electricity_rate_per_unit' => 'nullable|numeric|min:0',
        ];
    }
}
