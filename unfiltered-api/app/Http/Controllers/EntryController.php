<?php

namespace App\Http\Controllers;

use App\Models\Entry;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class EntryController extends Controller
{
    /**
     * Fetch all diary entries for the authenticated user (with optional tag filtering).
     */
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->entries()->with('tags')->latest('entry_date');

        // Optional filter by tag
        if ($request->has('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('name', $request->tag);
            });
        }

        return response()->json([
            'entries' => $query->get()
        ]);
    }

    /**
     * Store a new diary entry and attach tags.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'mood' => 'required|in:great,good,okay,low,sad',
            'bg_color' => 'nullable|string|max:7',
            'entry_date' => 'required|date',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $entry = $request->user()->entries()->create([
            'title' => $validated['title'] ?? null,
            'content' => $validated['content'],
            'mood' => $validated['mood'],
            'bg_color' => $validated['bg_color'] ?? '#FFFFFF',
            'entry_date' => $validated['entry_date'],
        ]);

        // Process tags if provided
        if (!empty($validated['tags'])) {
            $tagIds = [];
            foreach ($validated['tags'] as $tagName) {
                $tag = Tag::firstOrCreate([
                    'user_id' => $request->user()->id,
                    'name' => strtolower(trim($tagName)),
                ]);
                $tagIds[] = $tag->id;
            }
            $entry->tags()->sync($tagIds);
        }

        return response()->json([
            'message' => 'Entry created successfully.',
            'entry' => $entry->load('tags')
        ], 201);
    }

    /**
     * Show a specific entry.
     */
    public function show(Request $request, Entry $entry): JsonResponse
    {
        // Ensure user owns the entry
        if ($entry->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        return response()->json([
            'entry' => $entry->load('tags')
        ]);
    }

    /**
     * Update an existing diary entry.
     */
    public function update(Request $request, Entry $entry): JsonResponse
    {
        if ($entry->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'mood' => 'required|in:great,good,okay,low,sad',
            'bg_color' => 'nullable|string|max:7',
            'entry_date' => 'required|date',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $entry->update([
            'title' => $validated['title'] ?? null,
            'content' => $validated['content'],
            'mood' => $validated['mood'],
            'bg_color' => $validated['bg_color'] ?? '#FFFFFF',
            'entry_date' => $validated['entry_date'],
        ]);

        if (isset($validated['tags'])) {
            $tagIds = [];
            foreach ($validated['tags'] as $tagName) {
                $tag = Tag::firstOrCreate([
                    'user_id' => $request->user()->id,
                    'name' => strtolower(trim($tagName)),
                ]);
                $tagIds[] = $tag->id;
            }
            $entry->tags()->sync($tagIds);
        }

        return response()->json([
            'message' => 'Entry updated successfully.',
            'entry' => $entry->load('tags')
        ]);
    }

    /**
     * Delete a diary entry.
     */
    public function destroy(Request $request, Entry $entry): JsonResponse
    {
        if ($entry->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized access.'], 403);
        }

        $entry->delete();

        return response()->json([
            'message' => 'Entry deleted successfully.'
        ]);
    }

    /**
     * Calculate current streak and summary stats.
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Fetch unique dates user made an entry, sorted descending
        $dates = $user->entries()
            ->selectRaw('DATE(entry_date) as date')
            ->distinct()
            ->orderBy('date', 'desc')
            ->pluck('date')
            ->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))
            ->toArray();

        $streak = 0;
        $today = Carbon::today()->format('Y-m-d');
        $yesterday = Carbon::yesterday()->format('Y-m-d');

        if (!empty($dates)) {
            // Check if user has posted today or yesterday to keep streak active
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

        return response()->json([
            'total_entries' => $user->entries()->count(),
            'current_streak' => $streak,
            'total_tags' => $user->tags()->count(),
        ]);
    }
}