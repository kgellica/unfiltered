<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JournalEntry;
use Illuminate\Http\Request;

class JournalEntryController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->journalEntries()->orderByDesc('entry_date');

        if ($request->filled('month')) {
            // month=YYYY-MM
            $query->whereRaw("strftime('%Y-%m', entry_date) = ?", [$request->query('month')]);
        }

        if ($request->filled('date')) {
            $query->whereDate('entry_date', $request->query('date'));
        }

        return response()->json(['entries' => $query->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'entry_date' => ['required', 'date'],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'mood' => ['nullable', 'string', 'max:50'],
            'photo_path' => ['nullable', 'string'],
            'voice_path' => ['nullable', 'string'],
            'stickers' => ['nullable', 'array'],
        ]);

        $entry = $request->user()->journalEntries()->create($data);

        return response()->json(['entry' => $entry], 201);
    }

    public function show(Request $request, JournalEntry $entry)
    {
        $this->authorizeOwner($request, $entry);

        return response()->json(['entry' => $entry]);
    }

    public function update(Request $request, JournalEntry $entry)
    {
        $this->authorizeOwner($request, $entry);

        $data = $request->validate([
            'entry_date' => ['sometimes', 'date'],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'mood' => ['nullable', 'string', 'max:50'],
            'photo_path' => ['nullable', 'string'],
            'voice_path' => ['nullable', 'string'],
            'stickers' => ['nullable', 'array'],
        ]);

        $entry->update($data);

        return response()->json(['entry' => $entry]);
    }

    public function destroy(Request $request, JournalEntry $entry)
    {
        $this->authorizeOwner($request, $entry);
        $entry->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    private function authorizeOwner(Request $request, JournalEntry $entry): void
    {
        abort_unless($entry->user_id === $request->user()->id, 403, 'Forbidden.');
    }
}
