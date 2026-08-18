<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        \Log::info('Upload request received', [
            'type' => $request->input('type'),
            'has_file' => $request->hasFile('file'),
            'user_id' => Auth::id()
        ]);

        $request->validate([
            'type' => 'required|in:photo,voice',
            'file' => 'required|file|max:10240',
        ]);

        $user = Auth::user();
        $type = $request->input('type');
        $file = $request->file('file');

        $extension = $file->getClientOriginalExtension();
        $filename = time() . '_' . Str::random(10) . '.' . $extension;

        $path = $file->storeAs(
            "uploads/{$type}/{$user->id}",
            $filename,
            'public'
        );

        $url = Storage::url($path);

        \Log::info('Upload successful', [
            'path' => $path,
            'url' => $url
        ]);

        return response()->json([
            'url' => $url,
            'path' => $path,
            'filename' => $filename,
            'type' => $type,
            'user_id' => $user->id,
        ], 200);
    }
}
