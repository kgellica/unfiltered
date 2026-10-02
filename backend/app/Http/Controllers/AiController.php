<?php

namespace App\Http\Controllers;

use App\Models\Entry;
use App\Services\EntryService;
use App\Services\GroqService;
use App\Services\TextRankService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiController extends Controller
{
    public function __construct(
        private GroqService $groq,
        private TextRankService $textRank,
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

        $plainText = trim(
            preg_replace(
                '/\s+/',
                ' ',
                strip_tags((string) $entry->content)
            )
        );

        $text = $this->textRank->summarize($plainText);

        return response()->json([
            'text' => $text,
            'source' => $text ? 'textrank' : null,
        ]);
    }
}
