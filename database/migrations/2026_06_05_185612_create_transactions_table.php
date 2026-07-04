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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique(); // public ref, e.g. TXN-20260606-4821
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type');                 // airtime | data | giftcard | utility
            $table->string('status')->default('pending');

            $table->string('country', 2)->nullable();
            $table->string('operator_id')->nullable();
            $table->string('operator_name')->nullable();
            $table->string('recipient')->nullable();      // phone / account number
            $table->string('recipient_name')->nullable();

            // All money in integer minor units.
            $table->unsignedBigInteger('amount_usd_minor');        // charged to the wallet (excl. fee)
            $table->unsignedBigInteger('fee_minor')->default(0);
            $table->unsignedBigInteger('local_amount_minor')->nullable(); // amount delivered locally
            $table->string('local_currency', 3)->nullable();

            $table->string('provider')->default('reloadly');
            $table->string('provider_transaction_id')->nullable()->index();
            $table->string('provider_status')->nullable();

            $table->string('idempotency_key')->nullable()->unique();
            $table->json('meta')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
