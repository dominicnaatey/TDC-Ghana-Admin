<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Only create if missing, to avoid errors in environments where it already exists
        if (Schema::hasTable('sessions')) {
            return;
        }

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->text('payload');
            $table->integer('last_activity');

            // Indexes consistent with Laravel defaults and current PostgreSQL schema
            $table->index('last_activity');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};