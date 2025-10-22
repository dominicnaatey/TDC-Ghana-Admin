-- Create core tables for TDC-Ghana-Admin (PostgreSQL)
-- Safe to re-run: uses IF NOT EXISTS and avoids nonstandard directives

CREATE SCHEMA IF NOT EXISTS public;

-- users
CREATE TABLE IF NOT EXISTS public.users (
  id bigserial PRIMARY KEY,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL UNIQUE,
  email_verified_at timestamp(0) without time zone,
  password varchar(255) NOT NULL,
  remember_token varchar(100),
  created_at timestamp(0) without time zone,
  updated_at timestamp(0) without time zone
);

-- password_reset_tokens
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  email varchar(255) PRIMARY KEY,
  token varchar(255) NOT NULL,
  created_at timestamp(0) without time zone
);

-- sessions
CREATE TABLE IF NOT EXISTS public.sessions (
  id varchar(255) PRIMARY KEY,
  user_id bigint,
  ip_address varchar(45),
  user_agent text,
  payload text NOT NULL,
  last_activity integer NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_last_activity_idx ON public.sessions (last_activity);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON public.sessions (user_id);

-- cache
CREATE TABLE IF NOT EXISTS public.cache (
  key varchar(255) PRIMARY KEY,
  value text NOT NULL,
  expiration integer NOT NULL
);

-- cache_locks
CREATE TABLE IF NOT EXISTS public.cache_locks (
  key varchar(255) PRIMARY KEY,
  owner varchar(255) NOT NULL,
  expiration integer NOT NULL
);

-- jobs
CREATE TABLE IF NOT EXISTS public.jobs (
  id bigserial PRIMARY KEY,
  queue varchar(255) NOT NULL,
  payload text NOT NULL,
  attempts smallint NOT NULL,
  reserved_at integer,
  available_at integer NOT NULL,
  created_at integer NOT NULL
);
CREATE INDEX IF NOT EXISTS jobs_queue_idx ON public.jobs (queue);

-- job_batches
CREATE TABLE IF NOT EXISTS public.job_batches (
  id varchar(255) PRIMARY KEY,
  name varchar(255) NOT NULL,
  total_jobs integer NOT NULL,
  pending_jobs integer NOT NULL,
  failed_jobs integer NOT NULL,
  failed_job_ids text NOT NULL,
  options text,
  cancelled_at integer,
  created_at integer NOT NULL,
  finished_at integer
);

-- failed_jobs
CREATE TABLE IF NOT EXISTS public.failed_jobs (
  id bigserial PRIMARY KEY,
  uuid varchar(255) NOT NULL UNIQUE,
  connection text NOT NULL,
  queue text NOT NULL,
  payload text NOT NULL,
  exception text NOT NULL,
  failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- migrations
CREATE TABLE IF NOT EXISTS public.migrations (
  id serial PRIMARY KEY,
  migration varchar(255) NOT NULL,
  batch integer NOT NULL
);

-- categories
CREATE TABLE IF NOT EXISTS public.categories (
  id bigserial PRIMARY KEY,
  name varchar(255) NOT NULL UNIQUE,
  description text,
  created_at timestamp(0) without time zone,
  updated_at timestamp(0) without time zone
);

-- posts
CREATE TABLE IF NOT EXISTS public.posts (
  id bigserial PRIMARY KEY,
  title varchar(255) NOT NULL,
  slug varchar(255) NOT NULL UNIQUE,
  excerpt text,
  content text,
  featured_image_path varchar(255),
  is_published boolean DEFAULT false NOT NULL,
  published_at timestamp(0) without time zone,
  created_at timestamp(0) without time zone,
  updated_at timestamp(0) without time zone,
  category_id bigint,
  deleted_at timestamp(0) without time zone,
  CONSTRAINT posts_category_id_fkey
    FOREIGN KEY (category_id)
    REFERENCES public.categories (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS posts_category_id_idx ON public.posts (category_id);

-- projects
CREATE TABLE IF NOT EXISTS public.projects (
  id bigserial PRIMARY KEY,
  name varchar(255) NOT NULL,
  slug varchar(255) NOT NULL UNIQUE,
  description text,
  cover_image_path varchar(255),
  start_date date,
  end_date date,
  is_published boolean DEFAULT false NOT NULL,
  published_at timestamp(0) without time zone,
  created_at timestamp(0) without time zone,
  updated_at timestamp(0) without time zone
);

-- gallery_images
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id bigserial PRIMARY KEY,
  title varchar(255) NOT NULL,
  image_path varchar(255) NOT NULL,
  caption text,
  sort_order integer DEFAULT 0 NOT NULL,
  is_published boolean DEFAULT false NOT NULL,
  published_at timestamp(0) without time zone,
  created_at timestamp(0) without time zone,
  updated_at timestamp(0) without time zone
);