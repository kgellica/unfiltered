<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'max:20480'], // 20MB
            'type' => ['required', 'in:photo,voice'],
        ]);

        $file = $request->file('file');
        $type = $request->input('type');
        $folder = $type === 'photo' ? 'journal-photos' : 'journal-voice';
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();

        $path = $file->storeAs($folder, $filename, 'public');

        return response()->json([
            'path' => $path,
            'url' => asset('storage/'.$path),
        ], 201);
    }
}
