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
        $this->model = config('services.gemini.model', 'gemini-3.6-flash');
    }

    public function isConfigured(): bool
    {
        return filled($this->apiKey);
    }

    /**
     * Generates a short AI summary of a single journal entry's plain-text
     * content using Google Gemini API. Returns null on any failure
     * (including empty/whitespace-only content) so the caller can show
     * a friendly message instead of a broken summary.
     */
    public function generateSummary(string $entryText): ?string
    {
        $entryText = trim($entryText);
        if ($entryText === '') {
            return null;
        }

        if (mb_strlen($entryText) < 5) {
            return null;
        }

        $entryText = mb_substr($entryText, 0, 6000);

        $prompt = "You are an empathetic, insightful journal companion. "
            . "Provide a concise 1-2 sentence summary (maximum 40 words total) of the following personal journal entry. "
            . "Maintain a warm, reflective, and neutral tone. Do not refer to 'the author', 'the writer', or 'the user'. "
            . "Do not include headings, bullets, markdown formatting, or quotation marks. Output ONLY the summary text.\n\n"
            . "Journal entry:\n\"\"\"\n{$entryText}\n\"\"\"";

        $summary = $this->generate($prompt, temperature: 0.7, maxOutputTokens: 400);

        if ($summary) {
            return $summary;
        }

        // Fallback: local extractive summary (first 1-2 full sentences, never cut mid-text)
        $sentences = preg_split('/(?<=[.?!])\s+(?=[A-Z])/', $entryText);

        return trim(implode(' ', array_slice($sentences, 0, 2)));
    }

    protected function generate(string $prompt, float $temperature = 0.7, int $maxOutputTokens = 400): ?string
    {
        if (! $this->isConfigured()) {
            return null;
        }

        try {
            $model = $this->model;
            // Fix model if it's invalid
            if ($model === 'gemini-3.6-flash') {
                $model = 'gemini-1.5-flash';
            }
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$this->apiKey}";

            $response = Http::timeout(5)->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => $temperature,
                    'maxOutputTokens' => $maxOutputTokens,
                ],
            ]);

            if ($response->failed()) {
                return null;
            }

            $candidates = $response->json('candidates', []);
            // Join every text part so a multi-part reply is never cut to its first chunk.
            $parts = data_get($candidates, '0.content.parts', []);
            $text = collect($parts)->pluck('text')->filter()->implode('');

            if (! $text) {
                return null;
            }

            return trim(preg_replace('/^["\'“]|["\'”]$/u', '', trim($text)));
        } catch (\Throwable $e) {
            return null;
        }
    }
}
