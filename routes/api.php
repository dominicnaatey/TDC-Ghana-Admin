<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PostController as PostApiController;

// Public read endpoints
Route::get('/posts', [PostApiController::class, 'index']);
Route::get('/posts/{post}', [PostApiController::class, 'show']);

// Protected write endpoints (session-auth via web guard)
Route::middleware('auth:web')->group(function () {
    Route::post('/posts', [PostApiController::class, 'store']);
    Route::put('/posts/{post}', [PostApiController::class, 'update']);
    Route::delete('/posts/{post}', [PostApiController::class, 'destroy']);
});

// Simple sample endpoint for testable JSON
Route::get('/sample', function () {
    return response()->json([
        'data' => [
            'id' => 1,
            'title' => 'Sample Item',
            'status' => 'ok',
            'tags' => ['demo', 'api', 'test'],
            'count' => 3,
        ],
        'meta' => [
            'request_id' => (string) \Illuminate\Support\Str::uuid(),
            'generated_at' => now()->toISOString(),
            'version' => '1.0',
        ],
    ]);
});