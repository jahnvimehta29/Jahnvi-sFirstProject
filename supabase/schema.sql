-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).

create extension if not exists pgcrypto;

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  party_size text not null,
  reservation_date date not null,
  reservation_time time not null,
  notes text default '',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'countered')),
  proposed_date date,
  proposed_time time,
  guest_token text,
  created_at timestamptz not null default now()
);

create unique index if not exists reservations_guest_token_idx
  on reservations (guest_token)
  where guest_token is not null;

-- Lock the table down: only requests using the service_role key (used
-- exclusively by our Netlify Functions, never sent to the browser) can
-- read or write. The anon/public API key has no access at all.
alter table reservations enable row level security;
