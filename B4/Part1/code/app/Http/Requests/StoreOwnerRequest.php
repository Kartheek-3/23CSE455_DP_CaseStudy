<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOwnerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Auth handled by middleware
    }

    // ── VALIDATION RULES ─────────────────────────
    // Yii2 equivalent:
    //   public function rules() {
    //       return [
    //           [['name', 'email', 'phone', 'password'], 'required'],
    //           ['email', 'email'],
    //           ['email', 'unique', 'targetClass' => User::class],
    //           ['password', 'string', 'min' => 8],
    //       ];
    //   }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'phone' => 'required|string|max:20',
            'cnic' => 'nullable|string|max:15',
            'address' => 'nullable|string|max:500',
        ];
    }
}
