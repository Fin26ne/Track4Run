-- ====================================================================
-- TRACK4RUN: DATABASE SCHEMA FOR SUPABASE POSTGRESQL
-- ====================================================================

-- 1. Bảng hồ sơ người dùng (chứa cân nặng phục vụ công thức ACSM)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  weight_kg numeric not null default 60,
  created_at timestamptz not null default now()
);

-- 2. Bảng nhật ký nạp calo (bữa ăn từ ảnh/Gemini)
create table if not exists public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  log_date date not null default current_date,
  items jsonb not null, -- Mảng FoodItem [{ name, weightGrams, caloriesPer100g, totalCalories, confidence }]
  total_calories numeric not null,
  note text
);

-- Index tối ưu truy vấn theo user và ngày
create index if not exists idx_food_logs_user_date on public.food_logs(user_id, log_date desc);

-- 3. Bảng nhật ký tiêu thụ calo khi chạy bộ (công thức ACSM)
create table if not exists public.run_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  log_date date not null default current_date,
  distance_km numeric not null,
  duration_minutes numeric not null,
  calories_burned numeric not null,
  met_value numeric not null,
  source text not null check (source in ('manual', 'photo'))
);

-- Index tối ưu truy vấn theo user và ngày
create index if not exists idx_run_logs_user_date on public.run_logs(user_id, log_date desc);

-- 4. Bảng mục tiêu cá nhân
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_type text not null check (
    goal_type in ('daily_intake_max', 'daily_burn_min', 'weekly_distance_km', 'monthly_deficit_kcal')
  ),
  target_value numeric not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint unique_user_goal_type unique (user_id, goal_type)
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
alter table public.profiles enable row level security;
alter table public.food_logs enable row level security;
alter table public.run_logs enable row level security;
alter table public.goals enable row level security;

-- Profiles: Mỗi user chỉ thấy và sửa profile của chính mình
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id)
  with check (auth.uid() = id);

-- Food Logs: Mỗi user chỉ thấy và ghi food_logs của chính mình
drop policy if exists "own food logs" on public.food_logs;
create policy "own food logs" on public.food_logs
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Run Logs: Mỗi user chỉ thấy và ghi run_logs của chính mình
drop policy if exists "own run logs" on public.run_logs;
create policy "own run logs" on public.run_logs
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Goals: Mỗi user chỉ thấy và sửa goals của chính mình
drop policy if exists "own goals" on public.goals;
create policy "own goals" on public.goals
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ====================================================================
-- TRIGGER TỰ ĐỘNG TẠO PROFILE KHI USER ĐĂNG KÝ
-- ====================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, weight_kg)
  values (new.id, 60)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
