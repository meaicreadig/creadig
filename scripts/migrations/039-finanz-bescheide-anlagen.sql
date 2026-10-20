-- 039 · Finanz: Bescheide-Ablage und Anlagen (Investment).
-- Lesbare Kopie; die Seiten legen die Tabellen selbst an (CREATE IF NOT EXISTS), additiv.

CREATE TABLE IF NOT EXISTS fin_bescheide (
    id text PRIMARY KEY,
    art text NOT NULL CHECK (art IN ('vorauszahlung','nachzahlung','erstattung','sonstig')),
    steuerart text NOT NULL CHECK (steuerart IN ('est','ust','gewerbe','sonstig')),
    jahr int NOT NULL,
    datum date NOT NULL,
    betrag_cent bigint,
    gueltig_ab date,
    aktenzeichen text,
    ablageort text,
    notiz text,
    frist_ids text[] NOT NULL DEFAULT '{}',
    storniert_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS fin_anlagen (
    id text PRIMARY KEY,
    name text NOT NULL,
    klasse text NOT NULL CHECK (klasse IN ('tagesgeld','etf','aktie','krypto','immobilie','beteiligung','sonstig')),
    einstand_cent bigint NOT NULL DEFAULT 0 CHECK (einstand_cent >= 0),
    seit date NOT NULL DEFAULT CURRENT_DATE,
    notiz text,
    archiviert_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS fin_anlagen_staende (
    anlage_id text NOT NULL REFERENCES fin_anlagen (id),
    datum date NOT NULL,
    wert_cent bigint NOT NULL CHECK (wert_cent >= 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (anlage_id, datum));

-- Wiederkehrende Rechnungen
CREATE TABLE IF NOT EXISTS fin_abos (
    id text PRIMARY KEY,
    titel text NOT NULL,
    kunde jsonb NOT NULL,
    positionen jsonb NOT NULL,
    geschaeftsfeld text NOT NULL DEFAULT 'digitalprodukte',
    intervall text NOT NULL CHECK (intervall IN ('monat','quartal','jahr')),
    naechste date NOT NULL,
    zahlungsziel_tage int NOT NULL DEFAULT 14,
    aktiv boolean NOT NULL DEFAULT true,
    letzter_entwurf_id text,
    erstellt_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX IF NOT EXISTS fin_abos_faellig_idx ON fin_abos (naechste) WHERE aktiv;
