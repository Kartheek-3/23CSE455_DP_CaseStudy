<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('electricity_receipts', function (Blueprint $table) {
            $table->string('bill_reference')->nullable()->after('notes');
            $table->string('bill_attachment')->nullable()->after('bill_reference');
        });

        Schema::table('maintenance_receipts', function (Blueprint $table) {
            $table->string('bill_reference')->nullable()->after('notes');
            $table->string('bill_attachment')->nullable()->after('bill_reference');
        });
    }

    public function down(): void
    {
        Schema::table('electricity_receipts', function (Blueprint $table) {
            $table->dropColumn(['bill_reference', 'bill_attachment']);
        });

        Schema::table('maintenance_receipts', function (Blueprint $table) {
            $table->dropColumn(['bill_reference', 'bill_attachment']);
        });
    }
};
