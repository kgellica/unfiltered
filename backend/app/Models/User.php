<?php

namespace App\Models;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar_url',
        'profile_picture',
        'voice_recording',
    ];


    protected $hidden = [
        'password',
        'remember_token',
        'pin_hash',
        'otp_hash',
        'otp_attempts',
        'otp_expires_at',
        'pin_attempts',
        'pin_locked_until',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'otp_expires_at' => 'datetime',
            'pin_locked_until' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function entries(): HasMany
    {
        return $this->hasMany(Entry::class);
    }

    public function tags(): HasMany
    {
        return $this->hasMany(Tag::class);
    }
}
