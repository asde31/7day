-- Module 2: Fitness — workout video library. Videos are hosted externally
-- (Cloudflare Stream / Mux / direct URL); this table stores metadata + the URL.
-- Public read (all users see the library); admin-only write.

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  video_url text not null,
  thumbnail_url text,
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  category text not null check (category in ('hiit', 'strength', 'cardio', 'yoga', 'dance', 'meditation')),
  gender text not null default 'all' check (gender in ('all', 'male', 'female')),
  duration_min int not null check (duration_min > 0),
  premium boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.workouts enable row level security;

-- Everyone (authenticated) can read the library.
create policy workouts_public_read on public.workouts for select using (true);

-- Only admins can insert/update/delete — checked against the profile flag.
create policy workouts_admin_write on public.workouts for all
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));
