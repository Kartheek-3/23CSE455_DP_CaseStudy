<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('security_deposits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('owner_id')->constrained()->onDelete('cascade');
            $table->decimal('total_amount', 10, 2);          // e.g. 80,000 (2 months)
            $table->integer('months_count')->default(2);       // how many months security
            $table->decimal('monthly_rent_at_time', 10, 2);   // rent when deposit was taken
            $table->string('amount_in_words');
            $table->date('deposit_date');
            $table->enum('payment_method', ['cash', 'bank_transfer', 'cheque', 'online'])->default('cash');
            $table->enum('status', ['held', 'partially_refunded', 'fully_refunded', 'forfeited'])->default('held');
            $table->decimal('total_deductions', 10, 2)->default(0);
            $table->decimal('refunded_amount', 10, 2)->default(0);
            $table->decimal('balance', 10, 2);                 // remaining deposit
            $table->date('refund_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('security_deposits');
    }
};
