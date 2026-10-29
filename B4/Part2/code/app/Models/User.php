<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // ── Role Helpers ─────────────────────────────
    // In Yii2 you'd check: Yii::$app->user->can('admin')
    // In Laravel, we add simple methods on the model

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    public function isTenant(): bool
    {
        return $this->role === 'tenant';
    }

    // ── Relationships ────────────────────────────
    // Yii2: public function getOwner() { return $this->hasOne(Owner::class, ['user_id' => 'id']); }
    // Laravel: convention-based, no need to specify keys!

    public function owner()
    {
        return $this->hasOne(Owner::class);
    }

    public function tenant()
    {
        return $this->hasOne(Tenant::class);
    }
}
