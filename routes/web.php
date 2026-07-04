<?php

use App\Http\Controllers\Admin\AdminAuditController;
use App\Http\Controllers\Admin\AdminCatalogController;
use App\Http\Controllers\Admin\AdminCommissionController;
use App\Http\Controllers\Admin\AdminKycController;
use App\Http\Controllers\Admin\AdminRiskController;
use App\Http\Controllers\Admin\AdminSettingsController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\AutomationController;
use App\Http\Controllers\BulkController;
use App\Http\Controllers\CopilotController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeveloperController;
use App\Http\Controllers\DocumentationController;
use App\Http\Controllers\GiftCardController;
use App\Http\Controllers\ImpersonationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RecipientController;
use App\Http\Controllers\ReloadlyWebhookController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\ResellerCustomerController;
use App\Http\Controllers\ResellerEarningsController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\TopUpController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\WalletController;
use App\Http\Middleware\VerifyReloadlyWebhookSignature;
use App\Support\LandingContent;
use App\Support\SystemSettings;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// The marketing homepage can be disabled from System Settings; when off, the
// root URL routes straight to the dashboard (authenticated) or sign-in page.
Route::get('/', function () {
    if (! SystemSettings::homepageEnabled()) {
        return redirect()->route(auth()->check() ? 'dashboard' : 'login');
    }

    // Server-render SEO/social meta so crawlers see it without executing JS.
    view()->share('homeSeo', LandingContent::seo());

    return Inertia::render('welcome', [
        'content' => LandingContent::content(),
    ]);
})->name('home');

// Reloadly async status callbacks (public; verified by HMAC signature).
Route::post('webhooks/reloadly', [ReloadlyWebhookController::class, 'handle'])
    ->middleware(VerifyReloadlyWebhookSignature::class)
    ->name('webhooks.reloadly');

// Stripe Checkout webhook (public; verified by signature when configured).
Route::post('webhooks/stripe', [StripeWebhookController::class, 'handle'])->name('webhooks.stripe');

// Public product documentation (Admin + Customer guides) at /documentation.
Route::get('documentation/{slug?}', [DocumentationController::class, 'show'])->name('documentation');

// Stop impersonating — reachable as the impersonated (non-admin) user, so it
// sits outside the verified/active group an admin's session normally requires.
Route::post('impersonate/stop', [ImpersonationController::class, 'stop'])->middleware('auth')->name('impersonate.stop');

Route::middleware(['auth', 'verified', 'active'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::inertia('legal/refund-policy', 'legal/refund-policy')->name('legal.refund-policy');

    Route::post('notifications/read', [NotificationController::class, 'markAllRead'])->name('notifications.read');

    // Sell
    Route::get('topup', [TopUpController::class, 'index'])->name('topup');
    Route::post('topup/detect', [TopUpController::class, 'detect'])->name('topup.detect')->middleware('throttle:30,1');
    Route::post('topup', [TopUpController::class, 'store'])->name('topup.store')->middleware('throttle:30,1');
    Route::get('giftcards', [GiftCardController::class, 'index'])->name('giftcards');
    Route::post('giftcards', [GiftCardController::class, 'store'])->name('giftcards.store')->middleware('throttle:30,1');
    Route::get('bulk', [BulkController::class, 'index'])->name('bulk');
    Route::get('bulk/{batch}', [BulkController::class, 'show'])->name('bulk.show');
    Route::post('bulk', [BulkController::class, 'store'])->name('bulk.store')->middleware('throttle:30,1');

    // Manage
    Route::get('recipients', [RecipientController::class, 'index'])->name('recipients');
    Route::post('recipients', [RecipientController::class, 'store'])->name('recipients.store');
    Route::patch('recipients/{recipient}', [RecipientController::class, 'update'])->name('recipients.update');
    Route::delete('recipients/{recipient}', [RecipientController::class, 'destroy'])->name('recipients.destroy');
    Route::get('automations', [AutomationController::class, 'index'])->name('automations');
    Route::post('automations', [AutomationController::class, 'store'])->name('automations.store');
    Route::patch('automations/{automation}', [AutomationController::class, 'update'])->name('automations.update');
    Route::delete('automations/{automation}', [AutomationController::class, 'destroy'])->name('automations.destroy');
    Route::get('wallet', [WalletController::class, 'index'])->name('wallet');
    Route::post('wallet/fund', [WalletController::class, 'fund'])->name('wallet.fund')->middleware('throttle:30,1');
    Route::patch('wallet/auto-reload', [WalletController::class, 'autoReload'])->name('wallet.auto-reload')->middleware('throttle:30,1');
    Route::post('wallet/fund/checkout', [WalletController::class, 'checkout'])->name('wallet.checkout')->middleware('throttle:30,1');
    Route::get('transactions', [TransactionController::class, 'index'])->name('transactions');
    Route::get('transaction-status/{reference}', [TransactionController::class, 'status'])->name('transactions.status');
    Route::get('transactions/{transaction}', [TransactionController::class, 'show'])->name('transactions.show');
    Route::get('reports', [ReportsController::class, 'index'])->name('reports');

    // Copilot + Developer + Account
    Route::get('ai-activity', [CopilotController::class, 'activity'])->name('ai-activity');
    Route::post('copilot/ask', [CopilotController::class, 'ask'])->name('copilot.ask')->middleware('throttle:30,1');
    Route::post('copilot/stream', [CopilotController::class, 'stream'])->name('copilot.stream')->middleware('throttle:30,1');
    Route::post('copilot/execute', [CopilotController::class, 'execute'])->name('copilot.execute')->middleware('throttle:30,1');
    Route::get('developers', [DeveloperController::class, 'index'])->name('developers');
    Route::post('developers/keys', [DeveloperController::class, 'store'])->name('developers.keys.store')->middleware('throttle:10,1');
    Route::post('developers/test-event', [DeveloperController::class, 'sendTestEvent'])->name('developers.test-event')->middleware('throttle:10,1');
    Route::post('developers/webhook', [DeveloperController::class, 'updateWebhook'])->name('developers.webhook.update')->middleware('throttle:30,1');
    Route::post('developers/webhook/rotate', [DeveloperController::class, 'rotateWebhookSecret'])->name('developers.webhook.rotate')->middleware('throttle:10,1');
    Route::delete('developers/keys/{apiKey}', [DeveloperController::class, 'destroy'])->name('developers.keys.destroy');
    Route::get('support', [SupportController::class, 'index'])->name('support');
    Route::post('support', [SupportController::class, 'store'])->name('support.store');
    Route::patch('support/{ticket}/reply', [SupportController::class, 'reply'])->name('support.reply');

    // Reseller
    Route::middleware('role:reseller')->prefix('reseller')->name('reseller.')->group(function () {
        Route::get('customers', [ResellerCustomerController::class, 'index'])->name('customers');
        Route::post('customers', [ResellerCustomerController::class, 'store'])->name('customers.store');
        Route::post('customers/import', [ResellerCustomerController::class, 'import'])->name('customers.import');
        Route::patch('customers/{customer}', [ResellerCustomerController::class, 'update'])->name('customers.update');
        Route::delete('customers/{customer}', [ResellerCustomerController::class, 'destroy'])->name('customers.destroy');
        Route::get('earnings', [ResellerEarningsController::class, 'index'])->name('earnings');
    });

    // Super Admin
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('users', [AdminUserController::class, 'index'])->name('users');
        Route::post('users', [AdminUserController::class, 'store'])->name('users.store');
        Route::patch('users/{user}', [AdminUserController::class, 'update'])->name('users.update');
        Route::post('users/{user}/credit', [AdminUserController::class, 'credit'])->name('users.credit')->middleware('throttle:30,1');
        Route::post('users/{user}/impersonate', [ImpersonationController::class, 'start'])->name('users.impersonate');
        Route::get('kyc', [AdminKycController::class, 'index'])->name('kyc');
        Route::get('kyc/documents/{document}', [AdminKycController::class, 'document'])->name('kyc.document');
        Route::get('catalog', [AdminCatalogController::class, 'index'])->name('catalog');
        Route::post('catalog/sync', [AdminCatalogController::class, 'sync'])->name('catalog.sync')->middleware('throttle:10,1');
        Route::get('commissions', [AdminCommissionController::class, 'index'])->name('commissions');
        Route::post('commissions', [AdminCommissionController::class, 'store'])->name('commissions.store');
        Route::patch('commissions/{rule}', [AdminCommissionController::class, 'update'])->name('commissions.update');
        Route::delete('commissions/{rule}', [AdminCommissionController::class, 'destroy'])->name('commissions.destroy');
        Route::get('risk', [AdminRiskController::class, 'index'])->name('risk');
        Route::patch('risk/rules', [AdminRiskController::class, 'updateRules'])->name('risk.rules');
        Route::patch('risk/{transaction}/approve', [AdminRiskController::class, 'approve'])->name('risk.approve');
        Route::patch('risk/{transaction}/reject', [AdminRiskController::class, 'reject'])->name('risk.reject');
        Route::patch('risk/{transaction}/resolve', [AdminRiskController::class, 'resolve'])->name('risk.resolve');
        Route::get('audit', [AdminAuditController::class, 'index'])->name('audit');

        Route::get('settings', [AdminSettingsController::class, 'branding'])->name('settings');
        Route::get('settings/integrations', [AdminSettingsController::class, 'integrations'])->name('settings.integrations');
        Route::get('settings/landing', [AdminSettingsController::class, 'landing'])->name('settings.landing');
        Route::post('settings/landing', [AdminSettingsController::class, 'updateLanding'])->name('settings.landing.update');
        Route::post('settings/landing/reset', [AdminSettingsController::class, 'resetLanding'])->name('settings.landing.reset');
        Route::post('settings/branding', [AdminSettingsController::class, 'updateBranding'])->name('settings.branding');
        Route::post('settings/providers', [AdminSettingsController::class, 'updateProviders'])->name('settings.providers');
        Route::post('settings/integrations/{group}', [AdminSettingsController::class, 'updateIntegration'])->name('settings.integration');
        Route::post('settings/integrations/{group}/test', [AdminSettingsController::class, 'testIntegration'])->name('settings.integration.test')->middleware('throttle:10,1');
    });
});

require __DIR__.'/settings.php';
