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

        // If the entry is too short to summarize reasonably (e.g. just random gibberish or a couple letters)
        if (mb_strlen($entryText) < 5) {
            return null;
        }

        // Keep the entry text bounded so we do not send unbounded payload.
        $entryText = mb_substr($entryText, 0, 6000);

        $prompt = "You are an empathetic, insightful journal companion. "
            . "Provide a concise 1-2 sentence summary (maximum 40 words total) of the following personal journal entry. "
            . "Maintain a warm, reflective, and neutral tone. Do not refer to 'the author', 'the writer', or 'the user'. "
            . "Do not include headings, bullets, markdown formatting, or quotation marks. Output ONLY the summary text.\n\n"
            . "Journal entry:\n\"\"\"\n{$entryText}\n\"\"\"";

        return $this->generate($prompt, temperature: 0.7, maxOutputTokens: 150);
    }

    protected function generate(string $prompt, float $temperature = 0.7, int $maxOutputTokens = 150): ?string
    {
        if (! $this->isConfigured()) {
            Log::warning('Gemini API key is not configured');
            return null;
        }

        try {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

            $response = Http::timeout(10)->post($url, [
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
                Log::warning('Gemini API error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return null;
            }

            $candidates = $response->json('candidates', []);
            $text = data_get($candidates, '0.content.parts.0.text');

            if (! $text) {
                return null;
            }

            // Remove any stray quotes around the output
            return trim(preg_replace('/^["\'“]|["\'”]$/u', '', trim($text)));
        } catch (\Throwable $e) {
            Log::warning('Gemini request failed: ' . $e->getMessage());
            return null;
        }
    }
}
