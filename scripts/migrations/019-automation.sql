-- ===========================================================================
-- 019 · ADMIN OS · ADM-06 — AUTOMATION: AUSFUEHRUNG, PROTOKOLL, SCHALTER
--
-- Lesbare Fassung. Angewendet wird `SCHEMA` aus `lib/neon-client.ts`
-- (`npm run db-migrate`).
--
-- WAS BISHER FEHLTE
--   `lib/ereignis.ts` (G26) beschreibt seit langem, WAS aus einem Ereignis
--   folgen darf: vier Wirkungen (notieren, erinnern, weiterreichen, pruefen),
--   drei Ausloeser, eine geschlossene Liste erlaubter Handlungen und zehn
--   Dinge, die NIE automatisch geschehen. Gerechnet hat diese Schicht immer.
--   Ausgefuehrt hat sie nie — es gab keinen Ort, an dem eine Ausfuehrung
--   haette stehen koennen.
--
-- WAS EINE AUTOMATION HIER NICHT DARF
--   Einen Geschaeftsdatensatz aendern. Keine Zeile in `leads`,
--   `opportunities`, `offers` oder `projects` entsteht oder aendert sich,
--   weil eine Automation lief. Die Wirkung einer Automation IST ihr Eintrag
--   in diesem Protokoll (plus, bei `notieren`, eine Chronikzeile mit
--   Herkunft AUTOMATION).
--
--   Das ist keine Vorsicht, sondern die Regel aus G26: „Wiederholung
--   automatisieren, NICHT VERANTWORTUNG." Und es macht Umkehrbarkeit zur
--   Eigenschaft der Bauart statt zu einer Funktion, die jemand schreiben
--   und vergessen kann: Was nichts veraendert hat, laesst sich vollstaendig
--   zuruecknehmen.
--
-- IDEMPOTENZ
--   `schluessel` ist abgeleitet (Ausloeser : Ereignis : Gegenstand) und
--   eindeutig. Dasselbe Ereignis zweimal — durch einen Doppelklick, eine
--   Wiederholung oder zwei Instanzen — ergibt EINE Wirkung.
--
-- ZUSTAENDE
--   offen            die Wirkung steht und wartet auf einen Menschen
--   erledigt         ein Mensch hat sie abgehakt (mit Rolle und Zeitpunkt)
--   zurueckgenommen  ein Mensch hat sie zurueckgenommen; der Eintrag bleibt
--   fehlgeschlagen   der Versuch ist gescheitert; `versuche` zaehlt mit
--
-- SCHALTER
--   Eine Automation laeuft, SOLANGE sie niemand abgeschaltet hat. Ein
--   abgeschalteter Ausloeser steht mit `aktiv = false` in `automation_switches`;
--   fehlt die Zeile, ist er an. Der Schalter gewinnt vor der Idempotenz: Wer
--   abschaltet, will, dass nichts geschieht — nicht, dass es einmal noch
--   geschieht.
--
-- Idempotent. Aendert keine bestehende Zeile.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS automation_runs (
  id text PRIMARY KEY,
  ausloeser text NOT NULL,
  ereignis text NOT NULL,
  gegenstand_art text NOT NULL,
  gegenstand text NOT NULL,
  schluessel text NOT NULL,
  wirkung text NOT NULL,
  zustand text NOT NULL DEFAULT 'offen',
  -- Maschinenwert des Ergebnisses; der Satz entsteht im Woerterbuch (H21).
  ergebnis text,
  -- Werte fuer den Satz (Zahlen, Namen) — nie uebersetzt.
  daten jsonb,
  versuche integer NOT NULL DEFAULT 1,
  fehler text,
  erledigt_at timestamptz,
  erledigt_von text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS automation_runs_schluessel_idx ON automation_runs (schluessel);
CREATE INDEX IF NOT EXISTS automation_runs_offen_idx ON automation_runs (zustand, created_at DESC);

CREATE TABLE IF NOT EXISTS automation_switches (
  ausloeser text PRIMARY KEY,
  aktiv boolean NOT NULL DEFAULT true,
  geaendert_at timestamptz NOT NULL DEFAULT now(),
  geaendert_von text
);
