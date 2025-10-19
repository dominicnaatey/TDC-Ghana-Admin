# TDC Ghana Admin

This is a Laravel + Inertia + React application.

## Quick Start

- Copy `.env.example` to `.env` and set your env vars
- Install PHP dependencies: `composer install`
- Install JS dependencies: `npm install`
- Generate app key: `php artisan key:generate`
- Run development servers: `php artisan serve` and `npm run dev`

## Database

The app now defaults to PostgreSQL.

### Configure PostgreSQL

Set the following in `.env`:

```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=tdc_ghana_admin
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

Ensure the database exists and your user has privileges.

### Migrate Schema

Run migrations on PostgreSQL:

```
php artisan migrate --database=pgsql
```

### Migrate Data (from SQLite)

A command is provided to copy existing data from the old SQLite database to PostgreSQL. The command:

```
php artisan app:migrate-sqlite-to-pgsql --chunk=1000
```

Notes:
- It reads from the `sqlite` connection (defaulting to `database/database.sqlite`).
- It writes to the configured `pgsql` connection.
- It skips internal SQLite tables and resets sequences on `id` columns.
- Ensure schema exists first (migrations run automatically if `migrations` table is missing).

You can skip specific tables:

```
php artisan app:migrate-sqlite-to-pgsql --skip=migrations,sqlite_sequence
```

## Queues

Queues are configured to use the `database` driver. Ensure the jobs table exists:

```
php artisan queue:table --database=pgsql
php artisan migrate --database=pgsql
```

Start the worker:

```
php artisan queue:work --queue=default
```

## Performance Tips (PostgreSQL)

- Prefer `jsonb` columns for structured JSON where possible.
- Add appropriate indexes for frequent filters/sorting.
- Use `timestampsTz()` in migrations when timezone-aware timestamps are needed.
- Keep `APP_ENV=production` and cache config/routes/views in production:
  - `php artisan config:cache && php artisan route:cache && php artisan view:cache`

## Troubleshooting

- Enable `pdo_pgsql` in PHP.
- If using Docker, map port `5432` and provide `.env` credentials.
- Clear caches after changing `.env`:
  - `php artisan config:clear && php artisan config:cache`
