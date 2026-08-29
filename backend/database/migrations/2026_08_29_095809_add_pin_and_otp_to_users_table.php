<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // PIN login (hashed, never store plain).
            $table->string('pin_hash')->nullable()->after('password');
            $table->unsignedTinyInteger('pin_attempts')->default(0)->after('pin_hash');
            $table->timestamp('pin_locked_until')->nullable()->after('pin_attempts');

            // Email OTP verification (hashed, short-lived).
            $table->string('otp_hash')->nullable()->after('pin_locked_until');
            $table->timestamp('otp_expires_at')->nullable()->after('otp_hash');
            $table->unsignedTinyInteger('otp_attempts')->default(0)->after('otp_expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'pin_hash',
                'pin_attempts',
                'pin_locked_until',
                'otp_hash',
                'otp_expires_at',
                'otp_attempts',
            ]);
        });
    }
};
