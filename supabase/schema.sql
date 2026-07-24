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
    check (status in ('pending', 'approved', 'rejected', 'countered', 'cancelled')),
  proposed_date date,
  proposed_time time,
  guest_token text,
  cancel_token text,
  created_at timestamptz not null default now()
);

create unique index if not exists reservations_guest_token_idx
  on reservations (guest_token)
  where guest_token is not null;

create unique index if not exists reservations_cancel_token_idx
  on reservations (cancel_token)
  where cancel_token is not null;

-- Lock the table down: only requests using the service_role key (used
-- exclusively by our Netlify Functions, never sent to the browser) can
-- read or write. The anon/public API key has no access at all.
alter table reservations enable row level security;

-- If you already ran an earlier version of this file (before cancellation
-- support was added) and the table already exists, run this instead of the
-- CREATE TABLE above:
--
-- alter table reservations add column if not exists cancel_token text;
-- alter table reservations drop constraint if exists reservations_status_check;
-- alter table reservations add constraint reservations_status_check
--   check (status in ('pending', 'approved', 'rejected', 'countered', 'cancelled'));
-- create unique index if not exists reservations_cancel_token_idx
--   on reservations (cancel_token) where cancel_token is not null;
