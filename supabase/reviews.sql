create table public.reviews (
  id         bigint generated always as identity primary key,
  user_id    uuid     not null default auth.uid() references auth.users(id) on delete cascade,
  product_id integer  not null,
  rating     smallint not null check (rating between 1 and 5),
  comment    text     not null check (char_length(comment) between 1 and 500),
  author     text     not null default split_part(coalesce(auth.jwt() ->> 'email', ''), '@', 1),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.reviews enable row level security;

create policy "read all"   on public.reviews for select to anon, authenticated using (true);
create policy "insert own" on public.reviews for insert to authenticated with check (auth.uid() = user_id);
create policy "update own" on public.reviews for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own" on public.reviews for delete to authenticated using (auth.uid() = user_id);
