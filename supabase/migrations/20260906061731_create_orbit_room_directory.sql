create table public.orbit_rooms (
  id uuid primary key,
  code text not null unique check (code ~ '^[A-Z2-9]{6}$'),
  signal_key text not null unique,
  leader_id uuid not null,
  leader_token_hash text not null,
  seats jsonb not null default '[]'::jsonb,
  status text not null default 'waiting' check (status in ('waiting', 'playing')),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index orbit_rooms_expires_at_idx on public.orbit_rooms (expires_at);

alter table public.orbit_rooms enable row level security;
revoke all on table public.orbit_rooms from anon, authenticated;
grant select, insert, update, delete on table public.orbit_rooms to service_role;

comment on table public.orbit_rooms is 'Short-lived directory and signaling metadata for Liars Orbit. Gameplay stays in the leader browser.';
