<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigrateSqliteToPgsql extends Command
{
    protected $signature = 'app:migrate-sqlite-to-pgsql {--chunk=1000 : Number of rows per insert chunk} {--skip=* : Tables to skip (comma separated)}';

    protected $description = 'Copy all data from the default SQLite database into the configured PostgreSQL database.';

    public function handle(): int
    {
        $this->info('Starting SQLite -> PostgreSQL data migration');

        // Ensure connections are available
        try {
            DB::connection('sqlite')->getPdo();
        } catch (\Throwable $e) {
            $this->error('SQLite connection failed: ' . $e->getMessage());
            return self::FAILURE;
        }

        try {
            DB::connection('pgsql')->getPdo();
        } catch (\Throwable $e) {
            $this->error('PostgreSQL connection failed: ' . $e->getMessage());
            return self::FAILURE;
        }

        // Migrate schema to pgsql if not present
        if (!Schema::connection('pgsql')->hasTable('migrations')) {
            $this->info('PostgreSQL schema appears empty; running migrations on pgsql...');
            Artisan::call('migrate', ['--database' => 'pgsql', '--force' => true]);
            $this->line(Artisan::output());
        }

        $skip = collect($this->option('skip'))
            ->flatMap(fn ($s) => array_map('trim', explode(',', (string) $s)))
            ->filter()
            ->merge(['sqlite_sequence', 'migrations'])
            ->unique()
            ->values();

        $chunk = (int) $this->option('chunk') ?: 1000;

        // Get list of tables from SQLite
        $tables = collect(DB::connection('sqlite')->select("SELECT name FROM sqlite_master WHERE type='table'"))
            ->map(fn ($row) => $row->name)
            ->reject(fn ($name) => $skip->contains($name))
            ->values();

        if ($tables->isEmpty()) {
            $this->warn('No tables found in SQLite to migrate.');
            return self::SUCCESS;
        }

        foreach ($tables as $table) {
            $this->migrateTable($table, $chunk);
        }

        $this->info('Data migration completed successfully.');
        return self::SUCCESS;
    }

    protected function migrateTable(string $table, int $chunk): void
    {
        $sqlite = DB::connection('sqlite');
        $pgsql = DB::connection('pgsql');

        // Check that table exists in pgsql
        $existsPg = Schema::connection('pgsql')->hasTable($table);
        if (!$existsPg) {
            $this->warn("Skipping table '$table' because it does not exist in PostgreSQL. Run migrations first.");
            return;
        }

        $count = (int) $sqlite->table($table)->count();
        $this->info("Migrating table '$table' ($count rows)...");

        if ($count === 0) {
            $this->line(" - Table '$table' is empty; skipping.");
            return;
        }

        $inserted = 0;
        $offset = 0;

        while ($offset < $count) {
            $rows = $sqlite->table($table)
                ->orderBy('id')
                ->offset($offset)
                ->limit($chunk)
                ->get()
                ->map(fn ($row) => (array) $row)
                ->toArray();

            $pgsql->transaction(function () use ($pgsql, $table, $rows) {
                if (!empty($rows)) {
                    $pgsql->table($table)->insert($rows);
                }
            });

            $inserted += count($rows);
            $offset += $chunk;

            $this->line(" - Inserted $inserted/$count rows into '$table'.");
        }

        // Reset sequence on id columns (if present)
        try {
            if ($this->tableHasColumn($pgsql, $table, 'id')) {
                $pgsql->statement(sprintf(
                    'SELECT setval(pg_get_serial_sequence(''%s'', ''id''), COALESCE((SELECT MAX(id) FROM %s), 1))',
                    $this->quoteIdent($table),
                    $this->quoteIdent($table)
                ));
                $this->line(" - Sequence reset for '$table.id'.");
            }
        } catch (\Throwable $e) {
            $this->warn(" - Could not reset sequence for '$table': " . $e->getMessage());
        }
    }

    protected function tableHasColumn($connection, string $table, string $column): bool
    {
        $rows = $connection->select(
            'SELECT column_name FROM information_schema.columns WHERE table_name = ? AND column_name = ? AND table_schema = ANY (current_schemas(false))',
            [$table, $column]
        );
        return !empty($rows);
    }

    protected function quoteIdent(string $ident): string
    {
        // Simple identifier quoting for SQL fragments
        return '"' . str_replace('"', '""', $ident) . '"';
    }
}