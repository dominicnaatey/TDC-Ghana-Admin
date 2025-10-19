<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('db:copy-sqlite-to-pgsql', function () {
    $sqlite = DB::connection('sqlite');
    $pgsql = DB::connection('pgsql');

    // Discover tables in SQLite, excluding internal tables and migrations
    $tables = collect($sqlite->select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"))
        ->pluck('name')
        ->reject(fn ($name) => $name === 'migrations')
        ->values();

    if ($tables->isEmpty()) {
        $this->warn('No tables found in SQLite. Ensure SQLITE_DB_PATH points to your legacy database file.');
        return;
    }

    $this->info('Found tables: '.implode(', ', $tables->all()));

    // Disable triggers and constraints for bulk import
    $this->info('Disabling triggers and constraints on PostgreSQL...');
    $pgsql->statement('SET session_replication_role = replica');

    foreach ($tables as $table) {
        $this->info("\nCopying table: {$table}");

        // Clean target table to avoid duplicates and ensure fresh import
        try {
            $pgsql->statement('TRUNCATE TABLE "'.$table.'" RESTART IDENTITY CASCADE');
            $this->info("Truncated {$table} in PostgreSQL");
        } catch (\Throwable $e) {
            $this->warn("Could not truncate {$table}: ".$e->getMessage());
        }

        // Determine if the table has an id column for ordering and sequence fix
        $columns = collect($sqlite->select("PRAGMA table_info({$table})"))->pluck('name')->all();
        $hasId = in_array('id', $columns, true);

        $total = $sqlite->table($table)->count();
        $copied = 0;

        $rows = $sqlite->table($table)->get();
        foreach ($rows->chunk(1000) as $chunk) {
            $batch = [];
            foreach ($chunk as $row) {
                $batch[] = (array) $row;
            }
            if (!empty($batch)) {
                $pgsql->table($table)->insert($batch);
                $copied += count($batch);
            }
        }

        $this->info("Copied {$copied}/{$total} rows for {$table}");

        // Fix the sequence for id columns
        if ($hasId) {
            try {
                $seqRow = $pgsql->selectOne('SELECT pg_get_serial_sequence(?, ?)', ["\"$table\"", 'id']);
                $sequenceName = $seqRow ? array_values((array) $seqRow)[0] : null;
                if ($sequenceName) {
                    $maxIdRow = $pgsql->selectOne('SELECT COALESCE(MAX("id"), 0) AS max_id FROM "'.$table.'"');
                    $maxId = (int) ($maxIdRow->max_id ?? 0);
                    if ($maxId > 0) {
                        $pgsql->statement('SELECT setval(?, ?, true)', [$sequenceName, $maxId]);
                    } else {
                        // For empty tables, set sequence to 1 and mark as not called
                        $pgsql->statement('SELECT setval(?, ?, false)', [$sequenceName, 1]);
                    }
                    $this->info("Adjusted sequence for {$table}.id to {$maxId}");
                } else {
                    $this->warn("Could not resolve serial sequence for {$table}.id");
                }
            } catch (\Throwable $e) {
                $this->warn("Skipping sequence adjustment for {$table}: ".$e->getMessage());
            }
        }
    }

    // Re-enable triggers and constraints
    $this->info('Re-enabling triggers and constraints on PostgreSQL...');
    $pgsql->statement('SET session_replication_role = origin');

    $this->info("\nData copy complete. Verify counts and application behavior.");
})->purpose('Copy data from SQLite to PostgreSQL, preserving IDs and constraints');
