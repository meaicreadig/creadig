-- ===========================================================================
-- 022 · MARKETING — SICHTBARKEIT (Verzeichnisse, Profile, Plattformen)
--
-- Lesbare Fassung. Angewendet wird das Schema aus `lib/neon-client.ts`.
-- Der Katalog selbst steht im Code (`lib/sichtbarkeit.ts`); hier steht nur,
-- welcher Eintrag bereits erledigt ist.
--
-- Idempotent. Additiv. Aendert keine bestehende Zeile.
-- Ohne diese Tabelle zeigt der Admin die Liste als „nicht gemessen“.
-- Produktion NUR mit Owner-Freigabe.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS visibility_listings (
  key text PRIMARY KEY,
  eingetragen boolean NOT NULL DEFAULT false,
  actor text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
