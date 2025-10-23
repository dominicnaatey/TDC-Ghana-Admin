# MySQL Compatibility: TDC-Ghana-Admin

This document describes changes made to support MySQL and how to verify the application works with a MySQL backend.

## Overview of Changes

- Added `database/migrations_mysql/2025_10_22_000007_create_all_dump_tables.mysql.sql` containing a MySQL-compatible schema converted from the PostgreSQL dump.
- Switched the default database connection to MySQL in `config/database.php`.
- Updated `.env.example` to use typical MySQL defaults (`DB_CONNECTION=mysql`, port `3306`, user `root`).

## Schema Conversion Notes

- `bigserial` → `BIGINT UNSIGNED AUTO_INCREMENT`
- `serial` → `INT UNSIGNED AUTO_INCREMENT`
- `boolean` → `TINYINT(1)` with defaults `0/1`
- `timestamp(0) without time zone` → `TIMESTAMP NULL`
- `text`, `varchar`, `date` mapped directly to MySQL equivalents
- Removed schema-qualified identifiers (`public.`) and PostgreSQL-only constructs
- Preserved foreign keys, unique constraints, and indexes

## How to Apply the MySQL Schema

You can apply the schema with the MySQL CLI or any MySQL GUI:

1. Create the database (if not present):
   - `CREATE DATABASE tdc_ghana_admin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

2. Import the schema file:
   - `mysql -u root -p tdc_ghana_admin < database/migrations_mysql/2025_10_22_000007_create_all_dump_tables.mysql.sql`

Alternatively, inside Laravel you can load the SQL once:

- `DB::unprepared(file_get_contents(base_path('database/migrations_mysql/2025_10_22_000007_create_all_dump_tables.mysql.sql')));`

Note: The schema file uses `CREATE TABLE IF NOT EXISTS`. Index creation is not idempotent in MySQL; run the import once.

## Application Configuration (MySQL)

- `.env`:
  - `DB_CONNECTION=mysql`
  - `DB_HOST=127.0.0.1`
  - `DB_PORT=3306`
  - `DB_DATABASE=tdc_ghana_admin`
  - `DB_USERNAME=root`
  - `DB_PASSWORD=` (or your password)

- `config/database.php`: default connection is set to MySQL and uses `utf8mb4`.

## Testing Requirements

- Table creation:
  - Connect to MySQL and `SHOW TABLES;` for `users`, `posts`, `projects`, `categories`, `gallery_images`, `sessions`, `cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `migrations`, `password_reset_tokens`.

- Constraints and indexes:
  - `SHOW CREATE TABLE posts;` confirms FK `posts_category_id_fkey` with `ON DELETE SET NULL` and `ON UPDATE CASCADE`.
  - `SHOW INDEX FROM sessions;` includes `sessions_last_activity_idx` and `sessions_user_id_idx`.
  - `SHOW INDEX FROM jobs;` includes `jobs_queue_idx`.

- Application smoke test:
  - Update `.env` for MySQL and run `php artisan config:clear && php artisan migrate` (if you later add Laravel migrations) or simply start the app.
  - Open the app; create a Category, Post, Project, and Gallery image via the Admin UI to confirm write/read operations.

## PostgreSQL-specific Code

The app controllers and pages use Laravel’s query builder/Eloquent and are database-agnostic. No changes were required there.

If you have custom console commands targeting PostgreSQL for data migration (e.g., `db:copy-sqlite-to-pgsql`), either disable them in production or implement MySQL equivalents if needed.

## Production Notes

- Ensure the MySQL server uses `utf8mb4` and an InnoDB engine.
- Match column types for foreign keys (`BIGINT UNSIGNED`) to avoid FK errors.
- For cPanel deployment, set `.env` to your MySQL credentials and verify `config:cache` picks them up.