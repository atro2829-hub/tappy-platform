<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('wallets', function (Blueprint $table) {
            $table->boolean('auto_reload_enabled')->default(false)->after('status');
            $table->unsignedBigInteger('auto_reload_threshold_minor')->nullable()->after('auto_reload_enabled');
            $table->unsignedBigInteger('auto_reload_amount_minor')->nullable()->after('auto_reload_threshold_minor');
            $table->timestamp('auto_reloaded_at')->nullable()->after('auto_reload_amount_minor');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wallets', function (Blueprint $table) {
            $table->dropColumn([
                'auto_reload_enabled',
                'auto_reload_threshold_minor',
                'auto_reload_amount_minor',
                'auto_reloaded_at',
            ]);
        });
    }
};
