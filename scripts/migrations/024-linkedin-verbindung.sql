-- ===========================================================================
-- 024 · LINKEDIN-VERBINDUNG
--
-- Lesbare Fassung. Angewendet wird das Schema aus `lib/neon-client.ts`.
-- Genau eine Zeile: das verbundene persoenliche Profil. Der Zugangsschluessel
-- liegt nur verschluesselt vor (AES-256-GCM, Schluessel aus ADMIN_SESSION_SECRET).
--
-- Idempotent. Additiv. Aendert keine bestehende Zeile.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS linkedin_connection (
  id integer PRIMARY KEY CHECK (id = 1),
  person_urn text NOT NULL,
  name text NOT NULL,
  token_enc text NOT NULL,
  expires_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
