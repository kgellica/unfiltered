<?php

namespace App\Repositories;

use App\Models\Entry;
use App\Models\Tag;
use App\Models\User;

class TagRepository
{
    public function syncTagsForUser(Entry $entry, User $user, array $tagNames): void
    {
        $tagIds = [];

        foreach ($tagNames as $tagName) {
            $tag = Tag::firstOrCreate([
                'user_id' => $user->id,
                'name'    => strtolower(trim($tagName)),
            ]);

            $tagIds[] = $tag->id;
        }

        $entry->tags()->sync($tagIds);
    }
}
