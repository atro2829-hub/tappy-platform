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
        Schema::table('users', function (Blueprint $table) {
            $table->string('status')->default('active')->after('role');
            $table->string('kyc_status')->default('pending')->after('status');
            $table->string('business_name')->nullable()->after('kyc_status');
            $table->string('country', 2)->nullable()->after('business_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['status', 'kyc_status', 'business_name', 'country']);
        });
    }
};
