<?php

namespace App\Http\Controllers;

use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;

class AiController extends Controller
{
    public function __construct(private GeminiService $gemini) {}

    public function affirmation(): JsonResponse
    {
        $text = $this->gemini->generateAffirmation();

        return response()->json([
            'text' => $text,
            'source' => $text ? 'gemini' : null,
        ]);
    }

    public function journalPrompt(): JsonResponse
    {
        $text = $this->gemini->generateJournalPrompt();

        return response()->json([
            'text' => $text,
            'source' => $text ? 'gemini' : null,
        ]);
    }
}
