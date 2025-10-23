<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\JsonResponse;

class UploadController extends Controller
{
    /**
     * Handle a single file upload and return JSON metadata + public URL.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:jpeg,jpg,png,gif,webp,pdf', 'max:5120'], // 5MB
        ], [
            'file.mimes' => 'Only images (jpeg, jpg, png, gif, webp) or PDF are allowed.',
            'file.max' => 'File must be less than 5MB.',
        ]);

        $file = $request->file('file');

        // Organize uploads by year/month to avoid large flat directories
        $dir = 'uploads/' . date('Y') . '/' . date('m');
        $filename = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();

        $path = $file->storeAs($dir, $filename, ['disk' => 'public']);

        if (!$path) {
            return response()->json(['error' => 'Failed to store uploaded file.'], 422);
        }

        // Build a relative public URL that respects subfolder installs
        $basePath = rtrim($request->getBaseUrl(), '/');
        $url = $basePath . '/storage/' . ltrim($path, '/');

        return response()->json([
            'status' => 'ok',
            'url' => $url,
            'path' => $path,
            'name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime' => $file->getMimeType(),
        ]);
    }
}