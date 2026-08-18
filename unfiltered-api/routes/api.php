<?php
// routes/api.php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EntryController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\MediaController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// PUBLIC ROUTES - No authentication required
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);

// Media routes (public for testing)
Route::post('/media/upload-image', [MediaController::class, 'uploadImage']);
Route::post('/media/upload-voice', [MediaController::class, 'uploadVoice']);
Route::delete('/media/delete-image', [MediaController::class, 'deleteImage']);
Route::delete('/media/delete-voice', [MediaController::class, 'deleteVoice']);

// PROTECTED ROUTES - Require authentication
Route::middleware('auth:sanctum')->group(function () {
    // User
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/user/profile', [AuthController::class, 'updateProfile']);
    Route::patch('/user/password', [AuthController::class, 'changePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Stats
    Route::get('/entries/stats', [EntryController::class, 'stats']);

    // Journal Entries
    Route::apiResource('entries', EntryController::class);

    // Uploads - This route is used by the mobile app
    Route::post('/uploads', [UploadController::class, 'store']);
});

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'message' => 'API is running']);
});
