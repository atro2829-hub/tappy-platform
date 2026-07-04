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
        Schema::table('commission_rules', function (Blueprint $table) {
            $table->decimal('markup_percent', 6, 3)->default(0)->after('markup');
            $table->unsignedBigInteger('markup_flat_minor')->default(0)->after('markup_percent');
            $table->unsignedBigInteger('cap_minor')->nullable()->after('markup_flat_minor');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commission_rules', function (Blueprint $table) {
            $table->dropColumn(['markup_percent', 'markup_flat_minor', 'cap_minor']);
        });
    }
};
