<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GroqService
{
    protected ?string $apiKey;
    protected string $model;

    public function __construct()
    {
        $this->apiKey = config('services.groq.key');
        $this->model = config('services.groq.model', 'openai/gpt-oss-20b');
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

        return $this->generate($prompt, temperature: 1.0, maxOutputTokens: 100);
    }

    /**
     * Generates a short journal writing prompt to help someone start
     * today's entry.
     */
    public function generateJournalPrompt(): ?string
    {
        $styles = [
            "an imperative instruction starting with a verb (e.g. 'Reflect on a moment today that brought you peace.')",
            "a reflective invitation, NOT a question (e.g. 'Consider someone who positively influenced your day.')",
            "a descriptive instruction (e.g. 'Describe a sound, scent, or feeling you noticed today.')",
            "a 'Name/Identify' instruction (e.g. 'Identify one accomplishment from this week that you are proud of.')",
            "a 'Who' or 'How' question — do NOT use 'What' (e.g. 'How did today differ from what you expected?')",
        ];
        $style = $styles[array_rand($styles)];

        $prompt = "Write ONE short, thoughtful journal writing prompt to help someone start today's journal entry. "
            . "One sentence, max 14 words, formal and reflective tone — proper grammar, no slang or contractions. "
            . "The prompt MUST be phrased as {$style}. Do not begin the sentence with the word 'What' unless the "
            . "style above explicitly is a 'What' question. Plain text only — no markdown, no asterisks, no lists, "
            . "no labels or headings. "
            . "Reply with ONLY the prompt text, nothing else, no quotes.";

        return $this->generate($prompt, temperature: 1.0, maxOutputTokens: 120);
    }

    /**
     * Generates a short AI summary of a single journal entry's plain-text
     * content. Returns null on any failure (including empty/whitespace-only
     * content) so the caller can show a friendly error instead of a summary.
     */
    public function generateSummary(string $entryText): ?string
    {
        $entryText = trim($entryText);
        if ($entryText === '') {
            return null;
        }

        // Keep the entry text itself bounded so we don't send unbounded
        // input to Groq; entries are personal journaling, not documents.
        $entryText = mb_substr($entryText, 0, 6000);

        $prompt = "Summarize the following personal journal entry in 1-2 short sentences, max 40 words total, "
            . "warm and neutral tone, third-person-free (do not say 'the user' or 'they'), plain text only, "
            . "no markdown, no quotes, no headings. Reply with ONLY the summary text, nothing else.\n\n"
            . "Journal entry:\n\"\"\"\n{$entryText}\n\"\"\"";

        return $this->generate($prompt, temperature: 0.7, maxOutputTokens: 120);
    }

    protected function generate(string $prompt, float $temperature = 0.9, int $maxOutputTokens = 80): ?string
    {
        if (! $this->isConfigured()) {
            return null;
        }

        try {
            // Groq's OpenAI-compatible chat completions endpoint. This call is
            // made server-to-server — the key never reaches the mobile app or
            // appears in the client's network traffic.
            // Timeout is kept under the mobile app's 10s axios timeout (see
            // mobile/src/api/client.js) so a slow/unreachable Groq call fails
            // fast on the backend instead of the phone giving up first while
            // Laravel is still waiting — that mismatch is what made requests
            // look "stuck loading" even though they'd eventually fail soft.
            $response = Http::withToken($this->apiKey)
                ->timeout(8)
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => $this->model,
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => $temperature,
                    'max_tokens' => $maxOutputTokens,
                ]);

            if ($response->failed()) {
                Log::warning('Groq API error', ['status' => $response->status(), 'body' => $response->body()]);
                return null;
            }

            $text = data_get($response->json(), 'choices.0.message.content');
            if (! $text) {
                return null;
            }

            return trim(preg_replace('/^["\'“]|["\'”]$/u', '', trim($text)));
        } catch (\Throwable $e) {
            Log::warning('Groq request failed: ' . $e->getMessage());
            return null;
        }
    }
}
