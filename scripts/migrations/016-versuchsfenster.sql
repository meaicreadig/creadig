-- ===========================================================================
-- 016 · ADMIN OS · ADM-02 · H3 — VERSUCHSFENSTER UEBER INSTANZEN
--
-- Lesbare Fassung. Angewendet wird `SCHEMA` aus `lib/neon-client.ts`
-- (`npm run db-migrate`).
--
-- WARUM
-- Das Fenster gegen das Durchprobieren (Admin-Anmeldung, Formular-Absendung)
-- lag im Arbeitsspeicher je Instanz. Mehrere Instanzen = mehrere Fenster.
--
-- WAS HIER STEHT
-- `bucket` = SHA-256 eines bereits HMAC-signierten Schluessels. Keine Adresse,
-- kein Name, kein Inhalt. Fenster aelter als ein Tag werden geloescht.
--
-- Ohne diese Tabelle gilt weiter das Fenster im Arbeitsspeicher.
-- Idempotent. Additiv.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS rate_limit_windows (
  bucket text NOT NULL,
  window_start timestamptz NOT NULL,
  hits integer NOT NULL,
  PRIMARY KEY (bucket, window_start)
);
