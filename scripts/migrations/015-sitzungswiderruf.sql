-- ===========================================================================
-- 015 · ADMIN OS · ADM-02 · H2 — SITZUNGEN SERVERSEITIG WIDERRUFEN
--
-- Diese Datei ist die LESBARE Fassung. Angewendet wird das Schema aus
-- `lib/neon-client.ts` (`npm run db-migrate`).
--
-- WARUM
-- Abmelden loeschte nur das Cookie im eigenen Browser. Eine Kopie blieb bis
-- zum Ablauf (8 h) gueltig. Diese Tabelle fuehrt die WIDERRUFENEN Sitzungen
-- (nicht alle): `sid` = 32 hex fuer eine Sitzung, `sid = '*'` als Stichtag
-- fuer „ueberall abmelden" (`revoked_at` = alles davor Ausgestellte gilt nicht).
--
-- WAS HIER BEWUSST NICHT STEHT
-- Kein Cookie-Wert, keine Signatur, keine IP, kein Nutzername. Die ID allein
-- oeffnet nichts; sie sperrt nur.
--
-- Idempotent. Additiv. Aendert keine bestehende Zeile.
-- Ohne diese Tabelle laeuft der Admin unveraendert weiter (es kann ja keinen
-- Widerruf geben); Abmelden meldet dann ehrlich `revoked: "browser-only"`.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS admin_session_revocations (
  sid text PRIMARY KEY,
  revoked_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  reason text NOT NULL
);

CREATE INDEX IF NOT EXISTS admin_session_revocations_expires_idx
  ON admin_session_revocations (expires_at);
