-- KONVOY · Live-Positionen
-- Einmal im Supabase SQL-Editor ausführen (Projekt → SQL Editor → New query → Run).
-- Keine Accounts, keine Anmeldung: der öffentliche Anon-Key darf lesen und schreiben.
-- Nach der Hochzeit: Projekt löschen (oder: delete from public.konvoy_positions;).

create table if not exists public.konvoy_positions (
  id          text primary key,
  event       text not null,
  name        text not null default '',
  color       text not null default '#2457E6',
  lead        boolean not null default false,
  lat         double precision not null,
  lng         double precision not null,
  heading     real,
  speed       real,
  accuracy    real,
  updated_at  timestamptz not null default now()
);

create index if not exists konvoy_positions_event_idx
  on public.konvoy_positions (event, updated_at desc);

-- updated_at immer vom Server setzen (Handy-Uhren gehen falsch)
create or replace function public.konvoy_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists konvoy_touch on public.konvoy_positions;
create trigger konvoy_touch before insert or update on public.konvoy_positions
  for each row execute function public.konvoy_touch();

alter table public.konvoy_positions enable row level security;

drop policy if exists "konvoy read"   on public.konvoy_positions;
drop policy if exists "konvoy insert" on public.konvoy_positions;
drop policy if exists "konvoy update" on public.konvoy_positions;
drop policy if exists "konvoy delete" on public.konvoy_positions;
create policy "konvoy read"   on public.konvoy_positions for select to anon, authenticated using (true);
create policy "konvoy insert" on public.konvoy_positions for insert to anon, authenticated with check (true);
create policy "konvoy update" on public.konvoy_positions for update to anon, authenticated using (true) with check (true);
create policy "konvoy delete" on public.konvoy_positions for delete to anon, authenticated using (true);

-- Sicht mit Alter der Position in Sekunden (Server-Uhr) — die App liest nur diese Sicht.
create or replace view public.konvoy_live with (security_invoker = true) as
  select id, event, name, color, lead, lat, lng, heading, speed, accuracy, updated_at,
         extract(epoch from (now() - updated_at))::int as age
  from public.konvoy_positions;

grant select, insert, update, delete on public.konvoy_positions to anon, authenticated;
grant select on public.konvoy_live to anon, authenticated;
