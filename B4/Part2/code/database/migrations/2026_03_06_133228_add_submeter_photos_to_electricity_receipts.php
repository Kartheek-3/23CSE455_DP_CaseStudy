<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('electricity_receipts', function (Blueprint $table) {
            $table->string('submeter_previous_photo')->nullable()->after('bill_attachment');
            $table->string('submeter_current_photo')->nullable()->after('submeter_previous_photo');
        });
    }

    public function down(): void
    {
        Schema::table('electricity_receipts', function (Blueprint $table) {
            $table->dropColumn(['submeter_previous_photo', 'submeter_current_photo']);
        });
    }
};
