<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained()->onDelete('cascade');
            $table->foreignId('tenant_id')->nullable()->constrained()->onDelete('set null');
            $table->string('address');
            $table->decimal('monthly_rent', 10, 2);
            $table->decimal('maintenance_total', 10, 2)->default(0);
            $table->integer('owner_maintenance_percent')->default(50);
            $table->integer('tenant_maintenance_percent')->default(50);
            $table->decimal('electricity_rate_per_unit', 8, 2)->default(0);
            $table->enum('status', ['vacant', 'occupied'])->default('vacant');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
