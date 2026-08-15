-- SpotlightIt schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query)

create extension if not exists "pgcrypto";

-- Niches (seed a starter list; creators/admins can add more later)
create table if not exists niches (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now()
);

insert into niches (name) values
  ('poetry'), ('music'), ('illustration'), ('fitness'),
  ('photography'), ('film & video'), ('fashion'), ('food'),
  ('crafts'), ('comedy'), ('writing'), ('dance')
on conflict (name) do nothing;

-- Creators
create table if not exists creators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  instagram_handle text not null,
  niche_id uuid references niches(id),
  bio text,
  status text not null default 'pending' check (status in ('pending','approved','removed')),
  submitted_by text not null,          -- display name/email of whoever submitted
  submitted_by_is_self boolean default false,
  contact_email text,                  -- optional, used for claim email if provided
  claim_token uuid default gen_random_uuid(),  -- secret token for the /claim/[token] link
  claimed_at timestamptz,
  owner_user_id uuid references auth.users(id), -- set once creator confirms + signs in
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists creators_status_idx on creators(status);
create index if not exists creators_niche_idx on creators(niche_id);

-- Supports (public cheers/comments)
create table if not exists supports (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references creators(id) on delete cascade,
  supporter_name text not null,
  message text not null check (char_length(message) <= 280),
  created_at timestamptz default now()
);

create index if not exists supports_creator_idx on supports(creator_id);

-- updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists creators_set_updated_at on creators;
create trigger creators_set_updated_at
before update on creators
for each row execute function set_updated_at();

-- Row Level Security
alter table creators enable row level security;
alter table supports enable row level security;
alter table niches enable row level security;

-- Public can read niches
create policy "niches are public" on niches
  for select using (true);

-- Public can read only approved creators
create policy "approved creators are public" on creators
  for select using (status = 'approved');

-- Anyone can submit a new creator (goes in as pending)
create policy "anyone can submit a creator" on creators
  for insert with check (status = 'pending');

-- Only the claimed owner can update/remove their own listing
create policy "owner can update own listing" on creators
  for update using (auth.uid() = owner_user_id)
  with check (auth.uid() = owner_user_id);

-- Public can read supports for approved creators
create policy "supports are public for approved creators" on supports
  for select using (
    exists (select 1 from creators c where c.id = creator_id and c.status = 'approved')
  );

-- Anyone can leave a support message on an approved creator
create policy "anyone can cheer approved creators" on supports
  for insert with check (
    exists (select 1 from creators c where c.id = creator_id and c.status = 'approved')
  );

-- NOTE: the actual "approve a pending listing" action is done via the
-- claim flow using the service role key in a server route (app/api/claim),
-- never directly from the client, since it must verify claim_token first.
