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
            'pin'      => 'required|digits:6',
        ]);

        $result = $this->auth->register($validated);

        return response()->json([
            'message'      => 'Account created.',
            'access_token' => $result['token'],
            'token_type'   => 'Bearer',
            'user'         => $result['user'],
        ], 201);
    }

    public function otpVerify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'otp'   => 'required|digits:6',
        ]);

        $result = $this->auth->verifyOtp($validated['email'], $validated['otp']);

        return response()->json([
            'message'      => 'Email verified.',
            'access_token' => $result['token'],
            'token_type'   => 'Bearer',
            'user'         => $result['user'],
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
            $this->auth->resetPassword($validated['email'], $validated['password']);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => collect($e->errors())->flatten()->first() ?? 'Could not reset password.',
            ], 422);
        }

        return response()->json(['message' => 'Password updated. You can now log in with your new password.']);
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
            return response()->json(['message' => collect($e->errors())->flatten()->first() ?? 'Invalid email or password.'], $e->status ?? 401);
        }

        return response()->json([
            'message'      => 'Login successful.',
            'access_token' => $result['token'],
            'token_type'   => 'Bearer',
            'user'         => $result['user'],
        ]);
    }

    public function loginPin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'pin'   => 'required|digits:6',
        ]);

        try {
            $result = $this->auth->loginWithPin($validated['email'], $validated['pin']);
        } catch (ValidationException $e) {
            // Check if the error is specifically about PIN not being set up
            $errorMessage = collect($e->errors())->flatten()->first() ?? 'Invalid PIN.';

            // Return a more specific error for PIN not set up
            if (str_contains($errorMessage, 'PIN is not set up')) {
                return response()->json([
                    'message' => 'PIN login is not set up for this account. Please use email and password instead.',
                    'error_type' => 'pin_not_setup'
                ], 401);
            }

            return response()->json([
                'message' => $errorMessage
            ], $e->status ?? 401);
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
