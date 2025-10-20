<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TinyMCEUploadController extends Controller
{
    /**
     * Handle TinyMCE image uploads and return a public URL.
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:jpeg,png,gif,webp', 'max:5120'],
        ]);

        $file = $request->file('file');

        // Organize uploads by year/month
        $dir = 'editor/'.date('Y').'/'.date('m');
        $filename = Str::uuid()->toString().'.'.$file->getClientOriginalExtension();

        $path = $file->storeAs($dir, $filename, ['disk' => 'public']);

        if (!$path) {
            return response()->json(['error' => 'Failed to store uploaded file.'], 422);
        }

        // Return a relative URL (incl. base path for subfolder installs)
        $basePath = rtrim($request->getBaseUrl(), '/');
        $url = $basePath.'/storage/'.ltrim($path, '/');

        return response()->json(['location' => $url]);
    }
}