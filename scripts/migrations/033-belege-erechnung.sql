-- ===========================================================================
-- 033 · BELEGE UND EINGEHENDE E-RECHNUNGEN (nachgetragen)
--
-- Lesbare Fassung von BELEGE_SCHEMA (lib/finanz/belege.ts). Dieses Schema lief
-- bereits seit den Commits "finanz(phase2): Belege selbst hochladen" und
-- "finanz(phase3): eingehende E-Rechnungen lesen" produktiv (Tabellen
-- erzeugen sich selbst, siehe scripts/migrations/029-finanz.sql) — diese
-- Datei holt nur die nach FESTER REGEL vorgeschriebene lesbare Fassung nach,
-- die beim Original-Commit gefehlt hat.
--
-- fin_belege: zwei Achsen je Zeile — Quelle (woher: 'hand' = Handy-Kamera/
-- Drag&Drop, 'fibero' = aus dem Subunternehmer-Geschäft, künftige Quellen
-- möglich) × Geschäftsfeld (wofür: GESCHAEFTSFELDER aus beleg-felder.ts).
-- Geschäftsfeld NULL = liegt im Eingangskorb, noch nicht zugeordnet.
-- UNIQUE (quelle, extern_id) macht jeden Kopierlauf idempotent.
--
-- erechnung_*-Spalten (Phase 3): eingehende E-Rechnungen (UBL/CII, auch aus
-- ZUGFeRD/Factur-X-PDF ausgelesen, siehe lib/finanz/e-eingang.ts). Das
-- Original-XML bleibt in erechnung_xml stehen, unabhängig davon, was später
-- an den übrigen Feldern von Hand korrigiert wird.
--
-- fin_kopierlaeufe: Protokoll eines Fibero-Kopierlaufs (soll/ist/stimmt) —
-- nicht die Belege selbst, nur ob ein Lauf vollständig war.
--
-- Idempotent. Additiv.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS fin_belege (
  id text PRIMARY KEY,
  quelle text NOT NULL,
  extern_id text NOT NULL,
  art text NOT NULL DEFAULT 'beleg' CHECK (art IN ('beleg','lose_datei')),
  datum date,
  haendler text NOT NULL DEFAULT '',
  belegnummer text,
  brutto_cent bigint NOT NULL DEFAULT 0,
  netto_cent bigint NOT NULL DEFAULT 0,
  vorsteuer_cent bigint NOT NULL DEFAULT 0,
  kategorie text NOT NULL DEFAULT '',
  datev_konto text NOT NULL DEFAULT '',
  quelle_status text,
  archiviert boolean NOT NULL DEFAULT false,
  geschaeftsfeld text,
  zugeordnet_at timestamptz,
  datei_quelle_pfad text,
  datei_status text NOT NULL DEFAULT 'keine' CHECK (datei_status IN ('keine','offen','kopiert','fehler')),
  datei_pfad text,
  datei_sha256 text,
  quelle_sha256 text,
  datei_bytes bigint,
  datei_typ text,
  datei_fehler text,
  rohdaten jsonb NOT NULL DEFAULT '{}'::jsonb,
  kopiert_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (quelle, extern_id)
);

CREATE INDEX IF NOT EXISTS fin_belege_korb_idx ON fin_belege (geschaeftsfeld, datum DESC);
CREATE INDEX IF NOT EXISTS fin_belege_datei_idx ON fin_belege (datei_status);

ALTER TABLE fin_belege ADD COLUMN IF NOT EXISTS erechnung_format text CHECK (erechnung_format IN ('ubl','cii'));
ALTER TABLE fin_belege ADD COLUMN IF NOT EXISTS erechnung_xml text;
ALTER TABLE fin_belege ADD COLUMN IF NOT EXISTS erechnung_nummer text;
ALTER TABLE fin_belege ADD COLUMN IF NOT EXISTS erechnung_iban text;

CREATE TABLE IF NOT EXISTS fin_kopierlaeufe (
  id text PRIMARY KEY,
  quelle text NOT NULL,
  soll jsonb NOT NULL DEFAULT '{}'::jsonb,
  ist jsonb,
  stimmt boolean,
  gestartet_at timestamptz NOT NULL DEFAULT now(),
  fertig_at timestamptz
);
