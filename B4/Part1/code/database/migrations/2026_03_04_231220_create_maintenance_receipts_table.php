<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->onDelete('cascade');
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('owner_id')->constrained()->onDelete('cascade');
            $table->string('month');
            $table->decimal('total_maintenance', 10, 2);
            $table->integer('owner_percent')->default(50);
            $table->integer('tenant_percent')->default(50);
            $table->decimal('owner_share', 10, 2);
            $table->decimal('tenant_share', 10, 2);
            $table->string('tenant_amount_in_words');
            $table->enum('payment_method', ['cash', 'bank_transfer', 'cheque', 'online'])->default('cash');
            $table->date('payment_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_receipts');
    }
};
