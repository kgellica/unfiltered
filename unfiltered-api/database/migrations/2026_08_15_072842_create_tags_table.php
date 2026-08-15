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
    Schema::create('tags', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('name');
        $table->timestamps();

        // Ensure unique tag names per user
        $table->unique(['user_id', 'name']);
    });

    // Many-to-Many Pivot Table between Entries and Tags
    Schema::create('entry_tag', function (Blueprint $table) {
        $table->foreignId('entry_id')->constrained()->onDelete('cascade');
        $table->foreignId('tag_id')->constrained()->onDelete('cascade');
        $table->primary(['entry_id', 'tag_id']);
    });
}

public function down(): void
{
    Schema::dropIfExists('entry_tag');
    Schema::dropIfExists('tags');
}
};
