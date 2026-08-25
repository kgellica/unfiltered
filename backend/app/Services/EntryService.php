<?php

namespace App\Services;

use App\Models\Entry;
use App\Models\User;
use App\Repositories\EntryRepository;
use App\Repositories\TagRepository;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Exceptions\HttpResponseException;
use Symfony\Component\HttpFoundation\Response;

class EntryService
{
    public function __construct(
        private EntryRepository $entries,
        private TagRepository   $tags,
    ) {}

    public function list(User $user, array $filters = []): Collection
    {
        return $this->entries->getForUser($user, $filters);
    }

    public function create(User $user, array $data): Entry
    {
        $entry = $this->entries->createForUser($user, $data);

        if (!empty($data['tags'])) {
            $this->tags->syncTagsForUser($entry, $user, $data['tags']);
        }

        return $entry->load('tags');
    }

    public function update(Entry $entry, User $user, array $data): Entry
    {
        $entry = $this->entries->update($entry, $data);

        if (isset($data['tags'])) {
            $this->tags->syncTagsForUser($entry, $user, $data['tags']);
        }

        return $entry->load('tags');
    }

    public function delete(Entry $entry): void
    {
        $this->entries->delete($entry);
    }

    public function stats(User $user): array
    {
        $dates = $this->entries->getUniqueDatesForUser($user)->toArray();

        $streak    = 0;
        $today     = Carbon::today()->format('Y-m-d');
        $yesterday = Carbon::yesterday()->format('Y-m-d');

        if (!empty($dates)) {
            $latestDate = $dates[0];

            if ($latestDate === $today || $latestDate === $yesterday) {
                $currentCheck = Carbon::parse($latestDate);

                foreach ($dates as $date) {
                    if ($date === $currentCheck->format('Y-m-d')) {
                        $streak++;
                        $currentCheck->subDay();
                    } else {
                        break;
                    }
                }
            }
        }

        return [
            'total_entries'  => $user->entries()->count(),
            'current_streak' => $streak,
            'total_tags'     => $user->tags()->count(),
        ];
    }

    public function assertOwnership(Entry $entry, User $user): void
    {
        if ($entry->user_id !== $user->id) {
            throw new HttpResponseException(
                response()->json(['message' => 'Unauthorized access.'], Response::HTTP_FORBIDDEN)
            );
        }
    }
}
