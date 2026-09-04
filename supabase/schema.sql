-- Run this in Supabase: Dashboard > SQL Editor > New query > paste > Run

create extension if not exists "pgcrypto";

-- Profiles table: one row per user, keyed to Supabase auth
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Links table: each user's list of social links
create table if not exists links (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references profiles(id) on delete cascade not null,
  label text not null,
  url text not null,
  position integer default 0,
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;
alter table links enable row level security;

-- Anyone can view any profile/links (needed for public tapcard.co/username pages)
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Public links are viewable by everyone"
  on links for select
  using (true);

-- Users can only create/edit/delete their own profile
create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Users can only create/edit/delete links tied to their own profile
create policy "Users can insert their own links"
  on links for insert
  with check (auth.uid() = profile_id);

create policy "Users can update their own links"
  on links for update
  using (auth.uid() = profile_id);

create policy "Users can delete their own links"
  on links for delete
  using (auth.uid() = profile_id);
