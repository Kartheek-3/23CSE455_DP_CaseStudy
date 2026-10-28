<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOwnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Get the owner being updated from route model binding
        $owner = $this->route('owner');

        return [
            'name' => 'required|string|max:255',
            // unique:users,email,{id_to_ignore} — ignores the current user's email
            'email' => 'required|email|unique:users,email,' . $owner->user_id,
            'phone' => 'required|string|max:20',
            'cnic' => 'nullable|string|max:15',
            'address' => 'nullable|string|max:500',
        ];
    }
}
