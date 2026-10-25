<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Models\RiwayatAktivitas;
use App\Models\User;
use Illuminate\Auth\Events\Login;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();

        // Catat waktu login terakhir + riwayat aktivitas login pengguna.
        Event::listen(Login::class, function (Login $event): void {
            User::whereKey($event->user->getAuthIdentifier())
                ->update(['last_login_at' => now()]);

            RiwayatAktivitas::create([
                'user_id' => $event->user->getAuthIdentifier(),
                'activity' => 'login',
                'description' => 'Masuk ke sistem SARPRA.',
                'module' => 'pengguna',
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        });
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);

        // Desain login SARPRA memakai satu kolom "Username / Email".
        // Terima email seperti biasa, atau nama pengguna (kolom `name`)
        // sebagai fallback.
        Fortify::authenticateUsing(function (Request $request) {
            $identity = trim((string) $request->input(Fortify::username()));

            $user = User::where('email', strtolower($identity))->first()
                ?? User::where('name', $identity)->first();

            if (! $user || ! Hash::check((string) $request->input('password'), $user->password)) {
                return null;
            }

            // Akun nonaktif tidak dapat masuk.
            if (! $user->is_active) {
                return null;
            }

            return $user;
        });
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn () => Inertia::render('auth/login'));
        Fortify::confirmPasswordView(fn () => Inertia::render('auth/confirm-password'));
        Fortify::registerView(fn () => Inertia::render('auth/register'));
        Fortify::resetPasswordView(fn () => Inertia::render('auth/reset-password'));
        Fortify::requestPasswordResetLinkView(fn () => Inertia::render('auth/forgot-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });
    }
}
