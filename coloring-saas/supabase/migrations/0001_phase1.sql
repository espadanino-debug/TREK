-- Phase 1: tool MVP
-- Run this in the Supabase SQL editor (or with `supabase db push`).
-- Tables for later phases (themes, printables, orders) come in their own migrations.

-- ---------------------------------------------------------------------------
-- profiles: one row per signed-in user, created automatically on sign up
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  credits int not null default 3 check (credits >= 0),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);
-- No insert/update/delete policies: credits change only on the server (service role).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- generations: every coloring page made with the tool
-- ---------------------------------------------------------------------------
create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  anon_id uuid,                       -- cookie id for visitors who are not signed in
  input_type text not null check (input_type in ('photo', 'prompt')),
  input_url text,                     -- storage path of the upload; cleared once the photo is deleted
  prompt text,
  output_url text,                    -- storage path in the "outputs" bucket
  style text not null check (style in ('simple', 'detailed')),
  status text not null default 'pending'
    check (status in ('pending', 'succeeded', 'failed', 'rejected')),
  watermarked boolean not null default true,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists generations_user_created_idx
  on public.generations (user_id, created_at desc);
create index if not exists generations_anon_idx on public.generations (anon_id);

alter table public.generations enable row level security;

drop policy if exists "generations: read own" on public.generations;
create policy "generations: read own" on public.generations
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- uploads: every signed upload URL we hand out, so the cleanup job can delete
-- photos that were uploaded but never used. Server-only (no policies).
-- ---------------------------------------------------------------------------
create table if not exists public.uploads (
  path text primary key,
  user_id uuid references auth.users (id) on delete cascade,
  anon_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists uploads_created_idx on public.uploads (created_at);
alter table public.uploads enable row level security;

-- ---------------------------------------------------------------------------
-- anon_usage: free generations claimed by visitors who are not signed in.
-- ip_hash is a salted SHA-256 of the IP, never the raw IP. Server-only.
-- ---------------------------------------------------------------------------
create table if not exists public.anon_usage (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  anon_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists anon_usage_ip_idx on public.anon_usage (ip_hash, created_at desc);
create index if not exists anon_usage_anon_idx on public.anon_usage (anon_id);
alter table public.anon_usage enable row level security;

-- ---------------------------------------------------------------------------
-- Credit and quota functions. Called only by the server with the service role.
-- ---------------------------------------------------------------------------

-- Takes one credit. Returns the credits left, or -1 if the user had none.
create or replace function public.consume_credit(p_user_id uuid)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_left int;
begin
  update public.profiles
     set credits = credits - 1
   where id = p_user_id and credits > 0
  returning credits into v_left;
  return coalesce(v_left, -1);
end;
$$;

create or replace function public.refund_credit(p_user_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles set credits = credits + 1 where id = p_user_id;
$$;

-- Claims the one free generation for a visitor. Returns the claim id, or null
-- if this cookie already used it, or this IP used one inside the window.
create or replace function public.claim_anon_generation(
  p_ip_hash text,
  p_anon_id uuid,
  p_window_hours int
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id bigint;
begin
  perform pg_advisory_xact_lock(hashtext(p_ip_hash));

  if exists (select 1 from public.anon_usage where anon_id = p_anon_id)
     or exists (
       select 1 from public.anon_usage
        where ip_hash = p_ip_hash
          and created_at > now() - make_interval(hours => p_window_hours)
     ) then
    return null;
  end if;

  insert into public.anon_usage (ip_hash, anon_id)
  values (p_ip_hash, p_anon_id)
  returning id into v_id;
  return v_id;
end;
$$;

-- Lock these down: by default Postgres lets anyone execute new functions,
-- which would let a visitor call refund_credit through the public API.
revoke execute on function public.consume_credit(uuid) from public, anon, authenticated;
revoke execute on function public.refund_credit(uuid) from public, anon, authenticated;
revoke execute on function public.claim_anon_generation(text, uuid, int) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.consume_credit(uuid) to service_role;
grant execute on function public.refund_credit(uuid) to service_role;
grant execute on function public.claim_anon_generation(text, uuid, int) to service_role;

-- ---------------------------------------------------------------------------
-- Storage buckets (both private; the app hands out short-lived signed URLs)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('uploads', 'uploads', false, 10485760,
    array['image/jpeg', 'image/png', 'image/heic', 'image/heif']),
  ('outputs', 'outputs', false, 20971520,
    array['image/png', 'application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
