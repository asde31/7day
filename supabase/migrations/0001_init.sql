-- 7day — initial schema (Phase 1 + forward-looking tables).
-- Local device storage is the source of truth for the offline-first alarm;
-- these tables provide cloud backup, cross-device sync, and social features.
-- Every table is protected by row-level security scoped to auth.uid().

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  language text not null default 'ru' check (language in ('ru', 'uz', 'en')),
  city text,
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Module 1: Alarms + accountability
-- ---------------------------------------------------------------------------
create table if not exists public.alarms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null default '',
  time_minutes int not null check (time_minutes between 0 and 1439),
  repeat_days int[] not null default '{}',
  enabled boolean not null default true,
  mission jsonb not null,
  snooze_locked boolean not null default true,
  fajr_linked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.wake_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  alarm_id uuid references public.alarms (id) on delete set null,
  date date not null,
  woke_at timestamptz,
  outcome text not null check (outcome in ('success', 'failed', 'snoozed')),
  mission_type text not null check (mission_type in ('math', 'steps', 'affirmation', 'photo'))
);
create index if not exists wake_records_user_date_idx on public.wake_records (user_id, date desc);

-- ---------------------------------------------------------------------------
-- Module 4: Water
-- ---------------------------------------------------------------------------
create table if not exists public.water_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  volume_ml int not null check (volume_ml > 0),
  at timestamptz not null default now()
);
create index if not exists water_entries_user_date_idx on public.water_entries (user_id, date desc);

-- ---------------------------------------------------------------------------
-- Module 5: Breathing / quit-smoking
-- ---------------------------------------------------------------------------
create table if not exists public.quit_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  quit_date timestamptz,
  cigarettes_per_day int not null default 10,
  pack_price_uzs int not null default 25000,
  cigarettes_per_pack int not null default 20
);

create table if not exists public.craving_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  at timestamptz not null default now(),
  trigger text not null,
  resolved boolean not null default false
);
create index if not exists craving_logs_user_idx on public.craving_logs (user_id, at desc);

-- ---------------------------------------------------------------------------
-- Module 3: AI nutrition (Phase 2 — table defined now for a stable schema)
-- Localized food database prioritises Uzbek / regional cuisine.
-- ---------------------------------------------------------------------------
create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  name_ru text not null,
  name_uz text,
  name_en text,
  region text,                     -- e.g. 'uz' for local dishes
  kcal_per_100g numeric not null,
  protein_g numeric not null default 0,
  fat_g numeric not null default 0,
  carbs_g numeric not null default 0,
  verified boolean not null default false
);
create index if not exists foods_name_ru_idx on public.foods using gin (to_tsvector('simple', name_ru));

create table if not exists public.meal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  food_id uuid references public.foods (id) on delete set null,
  free_text text,                  -- when AI/manual entry has no DB match
  grams numeric not null,
  kcal numeric not null,
  protein_g numeric not null default 0,
  fat_g numeric not null default 0,
  carbs_g numeric not null default 0,
  source text not null default 'manual' check (source in ('ai_photo', 'manual', 'search')),
  at timestamptz not null default now()
);
create index if not exists meal_entries_user_date_idx on public.meal_entries (user_id, date desc);

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.alarms enable row level security;
alter table public.wake_records enable row level security;
alter table public.water_entries enable row level security;
alter table public.quit_profiles enable row level security;
alter table public.craving_logs enable row level security;
alter table public.meal_entries enable row level security;
alter table public.foods enable row level security;

-- Owner-only access for per-user tables.
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'alarms', 'wake_records', 'water_entries',
    'quit_profiles', 'craving_logs', 'meal_entries'
  ]
  loop
    execute format($f$
      create policy %1$s_owner_select on public.%1$s for select using (
        (select auth.uid()) = %2$s
      );
      create policy %1$s_owner_modify on public.%1$s for all using (
        (select auth.uid()) = %2$s
      ) with check ((select auth.uid()) = %2$s);
    $f$, t, case when t in ('profiles', 'quit_profiles') then 'id'::text else 'user_id'::text end);
  end loop;
end $$;

-- The food database is public-read (shared reference data), admin-write only.
create policy foods_public_read on public.foods for select using (true);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
