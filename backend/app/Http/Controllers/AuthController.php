<?php

namespace App\Http\Controllers;

use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private AuthService $auth) {}

    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $result = $this->auth->register($validated);

        return response()->json([
            'message'      => 'User registered successfully.',
            'access_token' => $result['token'],
            'token_type'   => 'Bearer',
            'user'         => $result['user'],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        try {
            $result = $this->auth->login($credentials);
        } catch (ValidationException $e) {
            return response()->json(['message' => 'Invalid email or password.'], 401);
        }

        return response()->json([
            'message'      => 'Login successful.',
            'access_token' => $result['token'],
            'token_type'   => 'Bearer',
            'user'         => $result['user'],
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()]);
    }

    public function me(Request $request): JsonResponse
    {
        return $this->user($request);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Successfully logged out.']);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'       => 'sometimes|string|max:255',
            'email'      => [
                'sometimes',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'avatar_url' => 'sometimes|nullable|string|max:2048',
        ]);

        $user->fill($validated)->save();

        return response()->json([
            'message' => 'Profile updated.',
            'user'    => $user,
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!\Illuminate\Support\Facades\Hash::check($validated['current_password'], $user->password)) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'current_password' => ['Your current password is incorrect.'],
            ]);
        }

        $user->password = \Illuminate\Support\Facades\Hash::make($validated['password']);
        $user->save();

        return response()->json(['message' => 'Password updated.']);
    }

    public function googleLogin(Request $request): JsonResponse
    {
        $request->validate(['token' => 'required|string']);

        try {
            $result = $this->auth->googleLogin($request->token);
        } catch (\Exception $e) {
            \Log::error('Google Login Error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Invalid Google token',
                'error'   => $e->getMessage(),
            ], 401);
        }

        return response()->json([
            'message'      => 'Google authentication successful',
            'access_token' => $result['token'],
            'token_type'   => 'Bearer',
            'user'         => $result['user'],
        ]);
    }
}
