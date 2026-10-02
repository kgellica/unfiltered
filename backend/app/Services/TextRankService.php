<?php

namespace App\Services;

class TextRankService
{
    public function summarize(string $text, int $maxSentences = 2): ?string
    {
        $text = trim(strip_tags($text));

        if ($text === '' || mb_strlen($text) < 20) {
            return null;
        }

        // Limit very large journal entries
        $text = mb_substr($text, 0, 10000);

        $sentences = $this->splitSentences($text);

        if (count($sentences) === 0) {
            return null;
        }

        if (count($sentences) <= $maxSentences) {
            return implode(' ', $sentences);
        }

        $scores = $this->rankSentences($sentences);

        arsort($scores);

        $selectedIndexes = array_slice(
            array_keys($scores),
            0,
            min($maxSentences, count($sentences))
        );

        // Keep the selected sentences in their original order
        sort($selectedIndexes);

        $summary = [];

        foreach ($selectedIndexes as $index) {
            $summary[] = $sentences[$index];
        }

        return trim(implode(' ', $summary));
    }

    private function splitSentences(string $text): array
    {
        $sentences = preg_split(
            '/(?<=[.!?])\s+/u',
            $text,
            -1,
            PREG_SPLIT_NO_EMPTY
        );

        return array_values(
            array_filter(
                array_map('trim', $sentences),
                fn ($sentence) => mb_strlen($sentence) > 10
            )
        );
    }

    private function rankSentences(array $sentences): array
    {
        $count = count($sentences);
        $scores = array_fill(0, $count, 1.0);

        $vectors = [];

        foreach ($sentences as $sentence) {
            $vectors[] = $this->wordFrequency($sentence);
        }

        for ($i = 0; $i < $count; $i++) {
            $score = 1.0;

            for ($j = 0; $j < $count; $j++) {
                if ($i === $j) {
                    continue;
                }

                $similarity = $this->cosineSimilarity(
                    $vectors[$i],
                    $vectors[$j]
                );

                $score += $similarity;
            }

            $scores[$i] = $score;
        }

        return $scores;
    }

    private function wordFrequency(string $sentence): array
    {
        $words = preg_split(
            '/[^\p{L}\p{N}]+/u',
            mb_strtolower($sentence),
            -1,
            PREG_SPLIT_NO_EMPTY
        );

        $stopWords = [
            'the', 'and', 'a', 'an', 'is', 'are', 'was', 'were',
            'to', 'of', 'in', 'on', 'for', 'with', 'this', 'that',
            'it', 'i', 'me', 'my', 'we', 'our', 'you', 'your',
            'ang', 'ng', 'mga', 'sa', 'ako', 'ko', 'kami', 'namin',
            'at', 'ay', 'na', 'para'
        ];

        $frequency = [];

        foreach ($words as $word) {
            if (mb_strlen($word) < 2 || in_array($word, $stopWords, true)) {
                continue;
            }

            $frequency[$word] = ($frequency[$word] ?? 0) + 1;
        }

        return $frequency;
    }

    private function cosineSimilarity(array $a, array $b): float
    {
        if (empty($a) || empty($b)) {
            return 0.0;
        }

        $dotProduct = 0.0;
        $normA = 0.0;
        $normB = 0.0;

        foreach ($a as $word => $value) {
            $normA += $value * $value;

            if (isset($b[$word])) {
                $dotProduct += $value * $b[$word];
            }
        }

        foreach ($b as $value) {
            $normB += $value * $value;
        }

        if ($normA === 0.0 || $normB === 0.0) {
            return 0.0;
        }

        return $dotProduct / (sqrt($normA) * sqrt($normB));
    }
}
