<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('security_deposit_deductions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('security_deposit_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('reason');          // e.g. "Wall damage repair", "Unpaid electricity"
            $table->date('deduction_date');
            $table->text('notes')->nullable();
            $table->string('attachment')->nullable();  // photo evidence etc.
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('security_deposit_deductions');
    }
};
