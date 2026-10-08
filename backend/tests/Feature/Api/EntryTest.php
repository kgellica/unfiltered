<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Entry;

class EntryTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_entry()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
                         ->postJson('/api/entries', [
                             'title'      => 'My First Journal Entry',
                             'content'    => 'Today was a great day.',
                             'mood'       => 'okay',
                             'entry_date' => '2026-10-08',
                             'bg_color'   => '#FFFFFF',
                         ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'entry' => ['id', 'user_id', 'title', 'content', 'mood', 'entry_date']
                 ])
                 ->assertJsonPath('entry.title', 'My First Journal Entry')
                 ->assertJsonPath('entry.user_id', $user->id);

        $this->assertDatabaseCount('entries', 1);
        $this->assertDatabaseHas('entries', [
            'user_id' => $user->id,
            'title'   => 'My First Journal Entry',
        ]);
    }

    public function test_authenticated_user_can_fetch_their_entries()
    {
        $user = User::factory()->create();

        for ($i = 0; $i < 3; $i++) {
            Entry::create([
                'user_id'    => $user->id,
                'title'      => "Journal Entry {$i}",
                'content'    => "Sample content {$i}",
                'mood'       => 'okay',
                'entry_date' => '2026-10-08',
            ]);
        }

        $response = $this->actingAs($user, 'sanctum')
                         ->getJson('/api/entries');

        $response->assertStatus(200)
                 ->assertJsonStructure(['entries']);
    }

    public function test_user_cannot_view_another_users_entry()
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $entryA = Entry::create([
            'user_id'    => $userA->id,
            'title'      => 'Private Entry',
            'content'    => 'Secrets here',
            'mood'       => 'okay',
            'entry_date' => '2026-10-08',
        ]);

        $response = $this->actingAs($userB, 'sanctum')
                         ->getJson("/api/entries/{$entryA->id}");

        $this->assertTrue(in_array($response->status(), [403, 404]));
    }

    public function test_unauthenticated_user_cannot_access_entries()
    {
        $response = $this->getJson('/api/entries');

        $response->assertStatus(401)
                 ->assertJson(['message' => 'Unauthenticated.']);
    }
}