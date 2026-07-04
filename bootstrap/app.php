<?php

use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\EnsureUserIsActive;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\LimitRequestSize;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(prepend: [
            LimitRequestSize::class,
        ]);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => EnsureUserHasRole::class,
            'active' => EnsureUserIsActive::class,
        ]);

        // Reloadly posts webhooks without a CSRF token; they are verified by signature instead.
        $middleware->validateCsrfTokens(except: ['webhooks/*']);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Render JSON for API routes and for raw XHR/fetch calls that expect it
        // (e.g. the top-up and Copilot endpoints), so validation/auth errors come
        // back as 422/419 JSON the client can read — but NOT for Inertia visits,
        // which need a redirect to surface errors through the page.
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*')
                || ($request->expectsJson() && ! $request->header('X-Inertia')),
        );
    })->create();
