<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add a temporary json column
        Schema::table('entries', function (Blueprint $table) {
            $table->json('photo_paths')->nullable()->after('photo_path');
        });

        // 2. Backfill: wrap each existing single photo_path string into a
        //    one-item JSON array so no data is lost in the migration.
        DB::table('entries')->whereNotNull('photo_path')->orderBy('id')->chunk(200, function ($rows) {
            foreach ($rows as $row) {
                DB::table('entries')
                    ->where('id', $row->id)
                    ->update(['photo_paths' => json_encode([$row->photo_path])]);
            }
        });

        // 3. Drop the old single-string column and rename the new one in its place
        Schema::table('entries', function (Blueprint $table) {
            $table->dropColumn('photo_path');
        });
        Schema::table('entries', function (Blueprint $table) {
            $table->renameColumn('photo_paths', 'photo_path');
        });
    }

    public function down(): void
    {
        Schema::table('entries', function (Blueprint $table) {
            $table->string('photo_path_old')->nullable()->after('photo_path');
        });

        DB::table('entries')->whereNotNull('photo_path')->orderBy('id')->chunk(200, function ($rows) {
            foreach ($rows as $row) {
                $decoded = json_decode($row->photo_path, true);
                $first = is_array($decoded) && count($decoded) > 0 ? $decoded[0] : null;
                DB::table('entries')->where('id', $row->id)->update(['photo_path_old' => $first]);
            }
        });

        Schema::table('entries', function (Blueprint $table) {
            $table->dropColumn('photo_path');
        });
        Schema::table('entries', function (Blueprint $table) {
            $table->renameColumn('photo_path_old', 'photo_path');
        });
    }
};
