<?php

namespace Tests\Feature\Api;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_successfully()
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Test User',
            'email'                 => 'test@unfiltered.com',
            'password'              => 'password123',
            'password_confirmation' => 'password123',
            'pin'                   => '123456',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'message',
                     'access_token',
                     'token_type',
                     'user' => ['id', 'name', 'email']
                 ])
                 ->assertJsonPath('message', 'Account created.')
                 ->assertJsonPath('user.email', 'test@unfiltered.com');

        $this->assertDatabaseHas('users', ['email' => 'test@unfiltered.com']);
        $this->assertDatabaseCount('users', 1);
    }

    public function test_user_can_login_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email'    => 'test@unfiltered.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'test@unfiltered.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'message',
                     'access_token',
                     'token_type',
                     'user' => ['id', 'email']
                 ])
                 ->assertJsonPath('message', 'Login successful.');

        $this->assertNotEmpty($response->json('access_token'));
    }

    public function test_user_cannot_login_with_invalid_password()
    {
        User::factory()->create([
            'email'    => 'test@unfiltered.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email'    => 'test@unfiltered.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401);
    }

    public function test_unauthenticated_request_is_blocked()
    {
        $response = $this->getJson('/api/entries');

        $response->assertStatus(401)
                 ->assertJson(['message' => 'Unauthenticated.']);
    }
}