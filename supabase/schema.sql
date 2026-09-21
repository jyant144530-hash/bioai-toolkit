create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  is_student boolean default false,
  tier text default 'free' check (tier in ('free','pro')),
  stripe_customer_id text,
  reviews_used int default 0,
  research_used int default 0,
  period_start timestamptz default now(),
  created_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  filename text,
  score int,
  result jsonb,
  created_at timestamptz default now()
);

create table if not exists research_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  query text,
  result jsonb,
  created_at timestamptz default now()
);

create index if not exists reviews_user_idx on reviews(user_id, created_at desc);
create index if not exists research_user_idx on research_reports(user_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, is_student)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email ~* '\.(edu|ac\.in|edu\.in)$'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table profiles enable row level security;
alter table reviews enable row level security;
alter table research_reports enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id);
create policy "own reviews" on reviews for all using (auth.uid() = user_id);
create policy "own reports" on research_reports for all using (auth.uid() = user_id);
