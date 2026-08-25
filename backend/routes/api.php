<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EntryController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\UploadController;

// ── PUBLIC ROUTES ─────────────────────────────────────────────────────────
Route::post('/register',    [AuthController::class, 'register']);
Route::post('/login',       [AuthController::class, 'login']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);
Route::post('/media/upload-image',    [MediaController::class, 'uploadImage']);
Route::post('/media/upload-voice',    [MediaController::class, 'uploadVoice']);
Route::delete('/media/delete-image',  [MediaController::class, 'deleteImage']);
Route::delete('/media/delete-voice',  [MediaController::class, 'deleteVoice']);
Route::get('/health', fn() => response()->json(['status' => 'ok', 'message' => 'API is running']));

// ── PROTECTED ROUTES ──────────────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user',            [AuthController::class, 'user']);
    Route::get('/me',              [AuthController::class, 'me']);
    Route::patch('/user/profile',  [AuthController::class, 'updateProfile']);
    Route::patch('/user/password', [AuthController::class, 'changePassword']);
    Route::post('/logout',         [AuthController::class, 'logout']);
    Route::get('/entries/stats', [EntryController::class, 'stats']);
    Route::apiResource('entries', EntryController::class);
    Route::post('/uploads', [UploadController::class, 'store']);
});
