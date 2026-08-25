<?php

namespace App\Http\Controllers;

use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MediaController extends Controller
{
    public function __construct(private MediaService $media) {}

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate(['image' => 'required|image|max:5120']);

        try {
            $userId   = Auth::id() ?? uniqid();
            $imageUrl = $this->media->uploadImage($request->file('image'), $userId);

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully!',
                'url'     => $imageUrl,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function uploadVoice(Request $request): JsonResponse
    {
        $request->validate(['voice' => 'required|file|max:10240']);

        try {
            $userId   = Auth::id() ?? uniqid();
            $voiceUrl = $this->media->uploadVoice($request->file('voice'), $userId);

            return response()->json([
                'success' => true,
                'message' => 'Voice uploaded successfully!',
                'url'     => $voiceUrl,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function deleteImage(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Please delete the entry to remove the photo.',
        ], 400);
    }

    public function deleteVoice(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Please delete the entry to remove the voice.',
        ], 400);
    }
}
