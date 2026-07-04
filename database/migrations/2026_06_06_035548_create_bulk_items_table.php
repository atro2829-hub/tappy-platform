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
        Schema::create('bulk_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bulk_batch_id')->constrained()->cascadeOnDelete();
            $table->string('country', 2);
            $table->string('recipient');
            $table->unsignedBigInteger('amount_usd_minor');
            $table->string('status')->default('pending');
            $table->foreignId('transaction_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bulk_items');
    }
};
