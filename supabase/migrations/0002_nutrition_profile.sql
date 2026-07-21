-- Nutrition profile — per-user body metrics + goal used to compute daily
-- calorie/macro targets. Local device storage remains the source of truth
-- (offline-first); this table is for optional cloud sync.

create table if not exists public.nutrition_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  sex text not null default 'male' check (sex in ('male', 'female')),
  age int not null default 25 check (age between 12 and 100),
  height_cm int not null default 175 check (height_cm between 120 and 230),
  weight_kg numeric not null default 70 check (weight_kg between 30 and 250),
  activity text not null default 'moderate' check (activity in ('low', 'moderate', 'high')),
  goal text not null default 'maintain' check (goal in ('lose', 'maintain', 'gain')),
  updated_at timestamptz not null default now()
);

alter table public.nutrition_profiles enable row level security;

create policy nutrition_profiles_owner_select on public.nutrition_profiles
  for select using ((select auth.uid()) = user_id);

create policy nutrition_profiles_owner_modify on public.nutrition_profiles
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
