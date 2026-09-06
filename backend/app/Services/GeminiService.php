<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected ?string $apiKey;
    protected string $model;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');
        $this->model = config('services.gemini.model', 'gemini-2.0-flash');
    }

    public function isConfigured(): bool
    {
        return filled($this->apiKey);
    }

    /**
     * Generates a short, warm daily affirmation. Returns null on any
     * failure so the caller can fall back to a local preset instead of
     * breaking the request.
     */
    public function generateAffirmation(): ?string
    {
        $prompt = "Write ONE short, warm daily affirmation for a personal journaling app, in lowercase, "
            . "second person ('i am...' / 'my...'), 1 sentence, max 16 words, gentle and encouraging tone, "
            . "end with a single fitting emoji. Reply with ONLY the affirmation text, nothing else, no quotes.";

        return $this->generate($prompt, temperature: 1.0, maxOutputTokens: 40);
    }

    /**
     * Generates a short journal writing prompt to help someone start
     * today's entry.
     */
    public function generateJournalPrompt(): ?string
    {
        $prompt = "Write ONE short, thoughtful journal writing prompt to help someone start today's journal entry. "
            . "One sentence, max 14 words, warm and reflective tone, phrased as an instruction or gentle question "
            . "(e.g. 'Write about a small moment that made you smile today.'). "
            . "Reply with ONLY the prompt text, nothing else, no quotes.";

        return $this->generate($prompt, temperature: 1.0, maxOutputTokens: 40);
    }

    protected function generate(string $prompt, float $temperature = 0.9, int $maxOutputTokens = 80): ?string
    {
        if (! $this->isConfigured()) {
            return null;
        }

        try {
            $response = Http::timeout(12)->retry(1, 200)->post(
                // API key travels as a query param per Google's API. This call is
                // made server-to-server — the key never reaches the mobile app or
                // appears in the client's network traffic.
                "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}",
                [
                    'contents' => [
                        ['role' => 'user', 'parts' => [['text' => $prompt]]],
                    ],
                    'generationConfig' => [
                        'temperature' => $temperature,
                        'maxOutputTokens' => $maxOutputTokens,
                    ],
                ]
            );

            if ($response->failed()) {
                Log::warning('Gemini API error', ['status' => $response->status(), 'body' => $response->body()]);
                return null;
            }

            $text = data_get($response->json(), 'candidates.0.content.parts.0.text');
            if (! $text) {
                return null;
            }

            return trim(preg_replace('/^["\'“]|["\'”]$/u', '', trim($text)));
        } catch (\Throwable $e) {
            Log::warning('Gemini request failed: ' . $e->getMessage());
            return null;
        }
    }
}
