<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EntryController;
use App\Http\Controllers\UploadController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ============================================
// PUBLIC ROUTES
// ============================================

// Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);

// ============================================
// PROTECTED ROUTES (Requires Authentication)
// ============================================

Route::middleware('auth:sanctum')->group(function () {

    // ============================================
    // USER AUTHENTICATION
    // ============================================
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/me', [AuthController::class, 'me']);  // Alias for /user
    Route::post('/logout', [AuthController::class, 'logout']);

    // ============================================
    // DASHBOARD & STATS
    // ============================================
    Route::get('/entries/stats', [EntryController::class, 'stats']);

    // ============================================
    // JOURNAL ENTRIES
    // ============================================
    Route::apiResource('entries', EntryController::class);

    // ============================================
    // FILE UPLOADS
    // ============================================
    Route::post('/uploads', [UploadController::class, 'store']);

});

// ============================================
// ADDITIONAL PUBLIC ROUTES (if any)
// ============================================

Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'message' => 'API is running']);
});