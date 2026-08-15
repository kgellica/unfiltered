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
    Schema::create('entries', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('title')->nullable();
        $table->text('content');
        $table->enum('mood', ['great', 'good', 'okay', 'low', 'sad'])->default('okay');
        $table->string('bg_color', 7)->default('#FFFFFF'); // Hex color code
        $table->date('entry_date');
        $table->timestamps();

        // Index for faster queries on date ranges per user
        $table->index(['user_id', 'entry_date']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entries');
    }
};
