<?php

namespace App\Providers;

use App\Support\SystemSettings;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Throwable;

/**
 * Applies admin-managed system settings (branding + integration credentials)
 * over the .env defaults at boot, so the platform can be reconfigured entirely
 * from the UI without touching files or redeploying.
 */
class SettingsServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        // The settings table may not exist yet (fresh install, mid-migration,
        // or the console bootstrapping before the DB is ready). Stay silent and
        // fall back to env config in that case.
        try {
            if (! Schema::hasTable('settings')) {
                return;
            }

            SystemSettings::applyRuntimeConfig();
        } catch (Throwable $e) {
            report($e);
        }
    }
}
