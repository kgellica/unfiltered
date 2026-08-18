<?php
/**
 * One-off fix for avatar/photo/voice URLs saved with the wrong host
 * (http://localhost:8000) before APP_URL was corrected to the LAN IP.
 *
 * Usage:
 *   1. Copy this file into unfiltered-api/ (project root, next to artisan)
 *   2. Run:  php artisan tinker --execute="require 'fix_localhost_urls.php';"
 *      OR just paste the body below directly into `php artisan tinker`
 *
 * Safe to run more than once — rows that don't contain the old host are
 * left untouched.
 */

use App\Models\User;
use Illuminate\Support\Facades\DB;

$oldHost = 'http://localhost:8000';
$newHost = rtrim(config('app.url'), '/'); // reads the current APP_URL

if ($oldHost === $newHost) {
    echo "APP_URL is still set to {$oldHost} — update your .env first, then run php artisan config:clear.\n";
    exit(1);
}

echo "Replacing '{$oldHost}' with '{$newHost}'...\n";

// 1. Users' avatar_url
$usersFixed = DB::table('users')
    ->where('avatar_url', 'like', $oldHost.'%')
    ->update(['avatar_url' => DB::raw("REPLACE(avatar_url, '{$oldHost}', '{$newHost}')")]);
echo "Fixed {$usersFixed} user avatar_url row(s).\n";

// 2. journal_entries photo_path / voice_path (if that table exists)
if (\Illuminate\Support\Facades\Schema::hasTable('journal_entries')) {
    $photosFixed = DB::table('journal_entries')
        ->where('photo_path', 'like', $oldHost.'%')
        ->update(['photo_path' => DB::raw("REPLACE(photo_path, '{$oldHost}', '{$newHost}')")]);
    $voiceFixed = DB::table('journal_entries')
        ->where('voice_path', 'like', $oldHost.'%')
        ->update(['voice_path' => DB::raw("REPLACE(voice_path, '{$oldHost}', '{$newHost}')")]);
    echo "Fixed {$photosFixed} journal_entries.photo_path row(s).\n";
    echo "Fixed {$voiceFixed} journal_entries.voice_path row(s).\n";
}

echo "Done.\n";
