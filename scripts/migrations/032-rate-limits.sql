-- ===========================================================================
-- 032 · MISSBRAUCHSSCHUTZ /dokument/[token] (Phase 8)
--
-- Lesbare Fassung. Angewendet wird das Schema aus lib/finanz/rate-limit.ts
-- (RATE_LIMIT_SCHEMA), lazy beim ersten pruefeRateLimit()-Aufruf.
--
-- Anders als lib/lead-guard.ts (Arbeitsspeicher, eine Server-Instanz) über
-- die Datenbank: mehrere Instanzen bedienen denselben Kundenlink gleichzeitig,
-- und das Limit (z. B. 10 Antwortversuche je Token+IP und Stunde) soll über
-- alle Instanzen hinweg gelten, nicht nur pro Instanz.
--
-- Jede Zeile ist ein Zeitstempel eines Zugriffs, kein Zähler — einfacher zu
-- pruefen (count in einem Zeitfenster) und selbsterklärend im Protokoll.
-- Aeltere Zeilen werden beilaeufig geloescht (siehe pruefeRateLimit()), kein
-- eigener Cron fuer eine Tabelle mit so kurzem Betrachtungsfenster.
--
-- Idempotent. Additiv.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS fin_rate_limits (
  id bigserial PRIMARY KEY,
  schluessel text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS fin_rate_limits_schluessel_idx ON fin_rate_limits (schluessel, created_at);
