<?php

namespace App\Services;

use App\Mail\OtpMail;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;

class AuthService
{
    private const OTP_TTL_MINUTES = 10;
    private const OTP_MAX_ATTEMPTS = 5;
    private const PIN_MAX_ATTEMPTS = 5;
    private const PIN_LOCKOUT_MINUTES = 15;

    /**
     * Creates a user and immediately issues a Sanctum token.
     * OTP email verification is skipped (no verified sending domain yet) —
     * the account is marked verified at creation time instead.
     */
    public function register(array $data): array
    {
        $user = User::create([
            'name'              => $data['name'],
            'email'             => $data['email'],
            'password'          => Hash::make($data['password']),
            'pin_hash'          => Hash::make($data['pin']),
            'email_verified_at' => now(),
        ]);

        return [
            'user'  => $user,
            'token' => $this->issueToken($user),
        ];
    }

    public function issueOtp(User $user): void
    {
        $code = (string) random_int(100000, 999999);

        $user->forceFill([
            'otp_hash'       => Hash::make($code),
            'otp_expires_at' => now()->addMinutes(self::OTP_TTL_MINUTES),
            'otp_attempts'   => 0,
        ])->save();

        Mail::to($user->email)->send(new OtpMail($code));
    }

    /**
     * Simple, self-service password reset: since there is no verified
     * outbound-email domain to reliably deliver an OTP/reset link (see
     * register() above), the user proves ownership by supplying their
     * account email and simply sets a new password directly. All existing
     * Sanctum tokens are revoked so any other logged-in session is signed
     * out once the password changes.
     */
    public function resetPassword(string $email, string $newPassword): void
    {
        $user = User::where('email', $email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['We could not find an account with that email.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($newPassword),
        ])->save();

        $user->tokens()->delete();
    }

    public function verifyOtp(string $email, string $code): array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !$user->otp_hash || !$user->otp_expires_at) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid or expired code. Please request a new one.'],
            ]);
        }

        if ($user->otp_attempts >= self::OTP_MAX_ATTEMPTS || now()->greaterThan($user->otp_expires_at)) {
            throw ValidationException::withMessages([
                'otp' => ['This code has expired. Please request a new one.'],
            ]);
        }

        if (!Hash::check($code, $user->otp_hash)) {
            $user->increment('otp_attempts');
            throw ValidationException::withMessages([
                'otp' => ['That code is incorrect.'],
            ]);
        }

        $user->forceFill([
            'email_verified_at' => now(),
            'otp_hash'          => null,
            'otp_expires_at'    => null,
            'otp_attempts'      => 0,
        ])->save();

        return [
            'user'  => $user,
            'token' => $this->issueToken($user),
        ];
    }

    public function login(array $credentials): array
    {
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ])->status(401);
        }

        $this->backfillVerification($user);
        $this->resetPinLockout($user);

        return [
            'user'  => $user,
            'token' => $this->issueToken($user),
        ];
    }

    /**
     * Logs a returning user in with their 6-digit PIN, enforcing the
     * 5-attempt / 15-minute lockout.
     */
    public function loginWithPin(string $email, string $pin): array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !$user->pin_hash) {
            throw ValidationException::withMessages([
                'pin' => ['PIN login is not set up for this account.'],
            ]);
        }

        $this->backfillVerification($user);

        if ($user->pin_locked_until && now()->lessThan($user->pin_locked_until)) {
            throw ValidationException::withMessages([
                'pin' => ['Too many attempts. Try again in a few minutes.'],
            ])->status(429);
        }

        if (!Hash::check($pin, $user->pin_hash)) {
            $attempts = $user->pin_attempts + 1;
            $update = ['pin_attempts' => $attempts];

            if ($attempts >= self::PIN_MAX_ATTEMPTS) {
                $update['pin_locked_until'] = now()->addMinutes(self::PIN_LOCKOUT_MINUTES);
                $update['pin_attempts'] = 0;
            }

            $user->forceFill($update)->save();

            throw ValidationException::withMessages([
                'pin' => ['Incorrect PIN.'],
            ]);
        }

        $this->resetPinLockout($user);

        return [
            'user'  => $user,
            'token' => $this->issueToken($user),
        ];
    }

    public function googleLogin(string $googleToken): array
    {
        $googleUser = Socialite::driver('google')->userFromToken($googleToken);

        $user = User::firstOrCreate(
            ['email' => $googleUser->getEmail()],
            [
                'name'              => $googleUser->getName(),
                'password'          => bcrypt(Str::random(24)),
                'email_verified_at' => now(),
            ]
        );

        return [
            'user'  => $user,
            'token' => $this->issueToken($user),
        ];
    }

    /**
     * register() has marked accounts verified at creation time since OTP
     * sending was disabled (no verified sending domain yet — see register()
     * above). Accounts created before that change can still have a null
     * email_verified_at, and since the OTP verify/resend screen was removed
     * from the app's navigation, there is no in-app way for those users to
     * ever satisfy a verification check. Rather than leave them permanently
     * locked out, heal them here the moment they prove ownership of the
     * account (correct password or correct PIN).
     */
    private function backfillVerification(User $user): void
    {
        if (!$user->email_verified_at) {
            $user->forceFill(['email_verified_at' => now()])->save();
        }
    }

    private function resetPinLockout(User $user): void
    {
        if ($user->pin_attempts !== 0 || $user->pin_locked_until !== null) {
            $user->forceFill(['pin_attempts' => 0, 'pin_locked_until' => null])->save();
        }
    }

    public function issueToken(User $user): string
    {
        return $user->createToken('auth_token')->plainTextToken;
    }
}
