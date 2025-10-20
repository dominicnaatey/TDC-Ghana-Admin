<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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

Artisan::command('db:verify-sqlite-vs-pgsql', function () {
    $sqlite = DB::connection('sqlite');
    $pgsql = DB::connection('pgsql');

    $tables = collect($sqlite->select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"))
        ->pluck('name')
        ->reject(fn ($name) => $name === 'migrations')
        ->values();

    if ($tables->isEmpty()) {
        $this->warn('No tables found in SQLite. Ensure SQLITE_DB_PATH points to your legacy database file.');
        return;
    }

    $this->info('Verifying table row counts between SQLite and PostgreSQL...');

    $rows = [];
    $allMatch = true;

    foreach ($tables as $table) {
        try {
            $sqliteCount = (int) $sqlite->table($table)->count();
        } catch (\Throwable $e) {
            $sqliteCount = -1;
        }

        try {
            $pgsqlCount = (int) $pgsql->table($table)->count();
        } catch (\Throwable $e) {
            $pgsqlCount = -1;
        }

        $match = ($sqliteCount >= 0 && $pgsqlCount >= 0 && $sqliteCount === $pgsqlCount);
        $allMatch = $allMatch && $match;

        $rows[] = [
            'table' => $table,
            'sqlite_count' => $sqliteCount,
            'pgsql_count' => $pgsqlCount,
            'status' => $match ? 'OK' : 'MISMATCH',
        ];
    }

    $this->table(['table', 'sqlite_count', 'pgsql_count', 'status'], $rows);

    if ($allMatch) {
        $this->info('All table counts match between SQLite and PostgreSQL.');
    } else {
        $this->warn('Some table counts differ. Investigate mismatches above.');
    }
})->purpose('Verify counts between SQLite and PostgreSQL after migration');

Artisan::command('db:test-create-post {--title=} {--category_id=} {--publish}', function () {
    $title = $this->option('title') ?: 'Test Post '.now()->format('Ymd_His');
    $slugBase = Str::slug($title);
    $slug = $slugBase;

    $i = 1;
    while (\App\Models\Post::where('slug', $slug)->exists()) {
        $slug = $slugBase.'-'.$i++;
    }

    $categoryId = $this->option('category_id') ?: null;

    $post = \App\Models\Post::create([
        'title' => $title,
        'slug' => $slug,
        'excerpt' => 'Seeded test post',
        'content' => 'This is a seeded test content.',
        'category_id' => $categoryId,
        'is_published' => (bool) $this->option('publish'),
        'published_at' => $this->option('publish') ? now() : null,
    ]);

    $this->info('Created post with ID: '.$post->id.' and slug: '.$post->slug);
})->purpose('Create a test post to verify write access to PostgreSQL');

Artisan::command('tinymce:test-seed', function () {
    $year = date('Y');
    $month = date('m');
    $basePath = "/storage/editor/{$year}/{$month}";

    $html = <<<HTML
<p>TinyMCE verification content.</p>
<p>
<img src="{$basePath}/tinymce-test.jpg" alt="JPG test">
<img src="{$basePath}/tinymce-test.png" alt="PNG test">
<img src="{$basePath}/tinymce-test.gif" alt="GIF test">
</p>
HTML;

    $title = 'TinyMCE Verification '.now()->format('Ymd_His');
    $slugBase = \Illuminate\Support\Str::slug($title);
    $slug = $slugBase;
    $i = 1;
    while (\App\Models\Post::where('slug', $slug)->exists()) {
        $slug = $slugBase.'-'.$i++;
    }

    $post = \App\Models\Post::create([
        'title' => $title,
        'slug' => $slug,
        'excerpt' => 'Verification post with images',
        'content' => $html,
        'category_id' => null,
        'is_published' => false,
        'published_at' => null,
    ]);

    $this->info('Created TinyMCE verification post ID: '.$post->id);
    $this->info('Image URLs:');
    $this->line($basePath.'/tinymce-test.jpg');
    $this->line($basePath.'/tinymce-test.png');
    $this->line($basePath.'/tinymce-test.gif');
})->purpose('Create a post containing image HTML to verify DB and rendering');

Artisan::command('posts:fix-storage-urls {--dry-run}', function () {
    $patterns = [
        'http://localhost/storage/' => '/storage/',
        'http://127.0.0.1:8000/storage/' => '/storage/',
    ];

    $scanned = 0;
    $updated = 0;

    \App\Models\Post::query()->select(['id', 'content'])->chunkById(100, function ($posts) use (&$scanned, &$updated, $patterns) {
        foreach ($posts as $post) {
            $scanned++;
            $original = $post->content ?? '';
            $new = $original;

            foreach ($patterns as $from => $to) {
                $new = str_replace($from, $to, $new);
            }

            if ($new !== $original) {
                if (!$this->option('dry-run')) {
                    $post->content = $new;
                    $post->save();
                }
                $updated++;
            }
        }
    });

    $message = $this->option('dry-run')
        ? "Scanned {$scanned} posts. Would update {$updated} posts."
        : "Scanned {$scanned} posts. Updated {$updated} posts.";

    $this->info($message);
})->purpose('Replace localhost-based storage URLs in post content with relative /storage URLs');
