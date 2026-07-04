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
        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained()->cascadeOnDelete();
            $table->string('direction'); // credit | debit
            // Positive magnitude in minor units; sign is carried by `direction`.
            $table->unsignedBigInteger('amount_minor');
            // Running wallet balance immediately after this entry was applied.
            $table->bigInteger('balance_after_minor');
            $table->string('reason'); // funding | purchase | refund | fee | adjustment
            // Linked transaction (top-up/giftcard/etc.). FK added once transactions exists.
            $table->unsignedBigInteger('transaction_id')->nullable()->index();
            // Guards against double-applying the same financial event.
            $table->string('idempotency_key')->nullable()->unique();
            $table->string('description')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['wallet_id', 'id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ledger_entries');
    }
};
