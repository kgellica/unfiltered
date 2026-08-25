<?php

namespace App\Repositories;

use App\Models\Entry;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as SupportCollection;

class EntryRepository
{
    public function getForUser(User $user, array $filters = []): Collection
    {
        $query = $user->entries()->with('tags')->latest('entry_date');

        if (!empty($filters['tag'])) {
            $query->whereHas('tags', fn($q) => $q->where('name', $filters['tag']));
        }

        if (!empty($filters['date'])) {
            $query->whereDate('entry_date', $filters['date']);
        }

        if (!empty($filters['month'])) {
            $query->where('entry_date', 'like', $filters['month'] . '%');
        }

        return $query->get();
    }

    public function createForUser(User $user, array $data): Entry
    {
        return $user->entries()->create([
            'title'      => $data['title']      ?? null,
            'content'    => $data['content'],
            'mood'       => $data['mood'],
            'bg_color'   => $data['bg_color']   ?? '#FFFFFF',
            'entry_date' => $data['entry_date'],
            'photo_path' => $data['photo_path'] ?? null,
            'voice_path' => $data['voice_path'] ?? null,
        ]);
    }

    public function update(Entry $entry, array $data): Entry
    {
        $entry->update([
            'title'      => $data['title']      ?? null,
            'content'    => $data['content'],
            'mood'       => $data['mood'],
            'bg_color'   => $data['bg_color']   ?? '#FFFFFF',
            'entry_date' => $data['entry_date'],
            'photo_path' => $data['photo_path'] ?? null,
            'voice_path' => $data['voice_path'] ?? null,
        ]);

        return $entry;
    }


    public function delete(Entry $entry): void
    {
        $entry->delete();
    }

    public function getUniqueDatesForUser(User $user): SupportCollection
    {
        return $user->entries()
            ->selectRaw('DATE(entry_date) as date')
            ->distinct()
            ->orderBy('date', 'desc')
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->format('Y-m-d'));
    }
}
