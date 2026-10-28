<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('electricity_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('owner_id')->constrained()->onDelete('cascade');
            $table->string('month');
            $table->integer('main_previous_reading');
            $table->integer('main_current_reading');
            $table->date('main_previous_date');
            $table->date('main_current_date');
            $table->integer('main_total_units');
            $table->integer('sub_previous_reading');
            $table->integer('sub_current_reading');
            $table->integer('tenant_units_consumed');
            $table->decimal('rate_per_unit', 8, 2);
            $table->decimal('tenant_bill', 10, 2);
            $table->decimal('main_bill_amount', 10, 2);
            $table->integer('owner_units_consumed');
            $table->decimal('owner_bill', 10, 2);
            $table->string('tenant_amount_in_words');
            $table->enum('payment_method', ['cash', 'bank_transfer', 'cheque', 'online'])->default('cash');
            $table->date('payment_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('electricity_receipts');
    }
};
