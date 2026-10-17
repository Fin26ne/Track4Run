create table public.favorites (
  id         bigint generated always as identity primary key,
  user_id    uuid    not null default auth.uid() references auth.users(id) on delete cascade,
  product_id integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.favorites enable row level security;

create policy "read own"
  on public.favorites for select to authenticated using (auth.uid() = user_id);

create policy "insert own"
  on public.favorites for insert to authenticated with check (auth.uid() = user_id);

create policy "delete own"
  on public.favorites for delete to authenticated using (auth.uid() = user_id);
