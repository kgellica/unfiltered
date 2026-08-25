<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Cloudinary\Configuration\Configuration;
use Illuminate\Http\UploadedFile;

class MediaService
{
    private Cloudinary $cloudinary;

    public function __construct()
    {
        Configuration::instance([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key'    => env('CLOUDINARY_API_KEY'),
                'api_secret' => env('CLOUDINARY_API_SECRET'),
            ],
            'url' => [
                'secure' => true,
            ],
        ]);

        $this->cloudinary = new Cloudinary();
    }

    public function uploadImage(UploadedFile $file, int|string $userId): string
    {
        $result = $this->cloudinary->uploadApi()->upload(
            $file->getRealPath(),
            [
                'folder'    => 'journal_photos',
                'public_id' => 'journal_user_' . $userId . '_' . time(),
                'overwrite' => false,
            ]
        );

        return $result['secure_url'];
    }

    public function uploadVoice(UploadedFile $file, int|string $userId): string
    {
        $extension        = strtolower($file->getClientOriginalExtension());
        $allowedExtensions = ['mp3', 'wav', 'aac', 'm4a', 'ogg'];

        if (!in_array($extension, $allowedExtensions)) {
            throw new \InvalidArgumentException(
                'The voice file must be one of: ' . implode(', ', $allowedExtensions) . '. Got: ' . $extension
            );
        }

        $result = $this->cloudinary->uploadApi()->upload(
            $file->getRealPath(),
            [
                'folder'        => 'journal_voice',
                'public_id'     => 'journal_voice_user_' . $userId . '_' . time(),
                'resource_type' => 'video',
                'overwrite'     => false,
            ]
        );

        return $result['secure_url'];
    }
}
