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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reseller_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('contact');
            $table->string('tier')->default('Standard');
            $table->string('status')->default('active');
            $table->string('country', 2)->nullable();
            $table->timestamps();

            $table->index(['reseller_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
