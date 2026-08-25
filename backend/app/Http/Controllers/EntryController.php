<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEntryRequest;
use App\Http\Requests\UpdateEntryRequest;
use App\Models\Entry;
use App\Services\EntryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EntryController extends Controller
{
    public function __construct(private EntryService $entries) {}

    public function index(Request $request): JsonResponse
    {
        $entries = $this->entries->list(
            $request->user(),
            $request->only(['tag', 'date', 'month'])
        );

        return response()->json(['entries' => $entries]);
    }

    public function store(StoreEntryRequest $request): JsonResponse
    {
        $entry = $this->entries->create($request->user(), $request->validated());

        return response()->json([
            'message' => 'Entry created successfully.',
            'entry'   => $entry,
        ], 201);
    }

    public function show(Request $request, Entry $entry): JsonResponse
    {
        $this->entries->assertOwnership($entry, $request->user());

        return response()->json(['entry' => $entry->load('tags')]);
    }

    public function update(UpdateEntryRequest $request, Entry $entry): JsonResponse
    {
        $this->entries->assertOwnership($entry, $request->user());

        $entry = $this->entries->update($entry, $request->user(), $request->validated());

        return response()->json([
            'message' => 'Entry updated successfully.',
            'entry'   => $entry,
        ]);
    }

    public function destroy(Request $request, Entry $entry): JsonResponse
    {
        $this->entries->assertOwnership($entry, $request->user());

        $this->entries->delete($entry);

        return response()->json(['message' => 'Entry deleted successfully.']);
    }

    public function stats(Request $request): JsonResponse
    {
        return response()->json($this->entries->stats($request->user()));
    }
}
