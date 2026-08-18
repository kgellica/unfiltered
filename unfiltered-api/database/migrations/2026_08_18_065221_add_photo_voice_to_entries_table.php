<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('entries', function (Blueprint $table) {
            // Add these two columns to the entries table
            $table->string('photo_path')->nullable()->after('bg_color');
            $table->string('voice_path')->nullable()->after('photo_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entries', function (Blueprint $table) {
            // Drop the columns if we rollback the migration
            $table->dropColumn(['photo_path', 'voice_path']);
        });
    }
};
