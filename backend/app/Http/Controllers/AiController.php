<?php

namespace App\Http\Controllers;

use App\Models\Entry;
use App\Services\EntryService;
use App\Services\GeminiService;
use App\Services\GroqService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiController extends Controller
{
    public function __construct(
        private GroqService $groq,
        private GeminiService $gemini,
        private EntryService $entries
    ) {}

    public function affirmation(): JsonResponse
    {
        $text = $this->groq->generateAffirmation();

        return response()->json([
            'text' => $text,
            'source' => $text ? 'groq' : null,
        ]);
    }

    public function journalPrompt(): JsonResponse
    {
        $text = $this->groq->generateJournalPrompt();

        return response()->json([
            'text' => $text,
            'source' => $text ? 'groq' : null,
        ]);
    }

    public function entrySummary(Request $request, Entry $entry): JsonResponse
    {
        $this->entries->assertOwnership($entry, $request->user());

        // Entry content is stored as HTML; strip tags so Gemini sees the
        // same plain text the app already shows on the journal card.
        $plainText = trim(preg_replace('/\s+/', ' ', strip_tags((string) $entry->content)));

        $text = $this->gemini->generateSummary($plainText);

        return response()->json([
            'text' => $text,
            'source' => $text ? 'gemini' : null,
        ]);
    }
}
