<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Cloudinary\Cloudinary;
use Cloudinary\Configuration\Configuration;
use Illuminate\Support\Facades\Auth;

class MediaController extends Controller
{
    private $cloudinary;

    public function __construct()
    {
        Configuration::instance([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key' => env('CLOUDINARY_API_KEY'),
                'api_secret' => env('CLOUDINARY_API_SECRET'),
            ],
            'url' => [
                'secure' => true
            ]
        ]);

        $this->cloudinary = new Cloudinary();
    }

    // ========== UPLOAD IMAGE ==========
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:5120',
        ]);

        try {
            $uploadedFile = $request->file('image');
            $user = Auth::user();
            $userId = $user ? $user->id : uniqid();

            // Use a generic journal folder and random ID so we don't overwrite profile pictures
            $result = $this->cloudinary->uploadApi()->upload(
                $uploadedFile->getRealPath(),
                [
                    'folder' => 'journal_photos',
                    'public_id' => 'journal_user_' . $userId . '_' . time(),
                    'overwrite' => false,
                ]
            );

            $imageUrl = $result['secure_url'];

            // --- FIXED: REMOVED THE AUTO-SAVE TO USER PROFILE ---
            // Do NOT save this to the user's profile_picture column.
            // Let NewEntryScreen handle attaching this URL to the Entry.

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully!',
                'url' => $imageUrl,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ========== UPLOAD VOICE ==========
    public function uploadVoice(Request $request)
    {
        // Step 1: Validate it's a valid file and under 10MB.
        $request->validate([
            'voice' => 'required|file|max:10240',
        ]);

        try {
            $uploadedFile = $request->file('voice');

            // Step 2: Manually check the file extension
            $extension = strtolower($uploadedFile->getClientOriginalExtension());
            $allowedExtensions = ['mp3', 'wav', 'aac', 'm4a', 'ogg'];

            if (!in_array($extension, $allowedExtensions)) {
                return response()->json([
                    'success' => false,
                    'message' => 'The voice field must be a file of type: ' . implode(', ', $allowedExtensions) . '. Got: ' . $extension,
                ], 422);
            }

            $user = Auth::user();
            $userId = $user ? $user->id : uniqid();

            $result = $this->cloudinary->uploadApi()->upload(
                $uploadedFile->getRealPath(),
                [
                    'folder' => 'journal_voice',
                    'public_id' => 'journal_voice_user_' . $userId . '_' . time(),
                    'resource_type' => 'video',
                    'overwrite' => false,
                ]
            );

            $voiceUrl = $result['secure_url'];

            // --- FIXED: REMOVED THE AUTO-SAVE TO USER PROFILE ---
            // Do NOT save this to the user's voice_recording column.
            // Let NewEntryScreen handle attaching this URL to the Entry.

            return response()->json([
                'success' => true,
                'message' => 'Voice uploaded successfully!',
                'url' => $voiceUrl,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ========== DELETE IMAGE ==========
    public function deleteImage()
    {
        try {
            $user = Auth::user();
            // Note: Since we aren't storing it on user->profile_picture anymore,
            // we need to handle deletion differently.
            // It is safer to handle deletion via the specific Entry's `photo_path`.
            return response()->json([
                'success' => false,
                'message' => 'Please delete the entry to remove the photo.',
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Delete failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    // ========== DELETE VOICE ==========
    public function deleteVoice()
    {
        try {
            $user = Auth::user();
            // Note: Since we aren't storing it on user->voice_recording anymore,
            // we need to handle deletion differently.
            return response()->json([
                'success' => false,
                'message' => 'Please delete the entry to remove the voice.',
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Delete failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
