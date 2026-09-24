-- ===========================================================================
-- 020 · MARKETING · B-3 — DAS VEROEFFENTLICHUNGSREGISTER
--
-- Diese Datei ist die LESBARE Fassung. Angewendet wird das Schema aus
-- `lib/neon-client.ts` (`npm run db-migrate`).
--
-- WARUM
-- Die Frage, die dieses Haus heute nicht beantworten kann, ist nicht
-- „wie viele Impressionen" — sondern:
--
--   Was haben wir veroeffentlicht, wo, wann, und hat daraus jemand geantwortet?
--
-- Genau diese vier Spalten stehen hier, und keine fuenfte. Kein Kampagnen-
-- werkzeug, kein Redaktionsplan, keine Kennzahlenwand: Der Engpass ist nicht
-- die Verwaltung des Veroeffentlichens, sondern das Veroeffentlichen selbst.
-- Ein Register, das in dreissig Sekunden ausgefuellt ist, wird gefuehrt. Ein
-- Redaktionssystem nicht.
--
-- WARUM NICHT IN `activities`
-- Die Chronik traegt einen CHECK auf vier Subjektarten und haengt jede Zeile
-- an einen Datensatz. Eine Veroeffentlichung haengt an keinem: Sie ist eine
-- Handlung des Hauses nach aussen. Sie dort einzuordnen haette denselben
-- CHECK aufbohren muessen — dieselbe Migration, nur mit unklarer Bedeutung.
--
-- DIE BRUECKE ZUR CHRONIK
-- `bezug_art` / `bezug_id` zeigen auf einen bestehenden Datensatz, WENN aus
-- der Reaktion ein Kontakt wurde. Dann — und nur dann — schreibt der Store
-- zusaetzlich eine Chronikzeile an DIESEM Datensatz. Es entsteht keine zweite
-- Beziehungsgeschichte: Das Register merkt sich die Veroeffentlichung, die
-- Chronik merkt sich, was mit dem Menschen geschah.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS publications (
  id text PRIMARY KEY,
  -- Ein Satz. Kein Textkoerper: Der Inhalt steht dort, wo er veroeffentlicht wurde.
  was text NOT NULL,
  kanal text NOT NULL
    CHECK (kanal IN ('linkedin','website','netzwerk','gespraech','andere')),
  veroeffentlicht_am date NOT NULL,
  url text,
  -- Die einzige Wirkung, die heute zaehlt: hat ein Mensch geantwortet?
  reaktion text NOT NULL DEFAULT 'keine'
    CHECK (reaktion IN ('keine','kommentar','nachricht','anruf','empfehlung','anfrage','andere')),
  reaktion_notiz text,
  bezug_art text CHECK (bezug_art IN ('kontakt','organisation','anfrage','chance')),
  bezug_id text,
  actor text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS publications_datum_idx ON publications (veroeffentlicht_am DESC);
