-- Finanzabteilung (legt sich auch selbst an, lib/finanz/store.ts)

CREATE TABLE IF NOT EXISTS fin_buchungen (
    id text PRIMARY KEY,
    art text NOT NULL CHECK (art IN ('einnahme','ausgabe')),
    status text NOT NULL DEFAULT 'gebucht' CHECK (status IN ('gebucht','geplant')),
    datum date NOT NULL,
    brutto_cent bigint NOT NULL CHECK (brutto_cent > 0),
    ust_satz int NOT NULL DEFAULT 19 CHECK (ust_satz IN (0,7,19)),
    kategorie text NOT NULL,
    gegenpartei text,
    notiz text,
    wiederholung text NOT NULL DEFAULT 'keine' CHECK (wiederholung IN ('keine','monatlich','quartal','jaehrlich')),
    quelle text NOT NULL DEFAULT 'manuell',
    storniert_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now());

CREATE INDEX IF NOT EXISTS fin_buchungen_datum_idx ON fin_buchungen (datum DESC);

CREATE TABLE IF NOT EXISTS fin_einstellungen (
    id text PRIMARY KEY,
    kontostand_cent bigint NOT NULL DEFAULT 0,
    kontostand_am date NOT NULL DEFAULT CURRENT_DATE,
    est_quote int NOT NULL DEFAULT 30 CHECK (est_quote BETWEEN 0 AND 60),
    ust_pflichtig boolean NOT NULL DEFAULT true,
    ust_rhythmus text NOT NULL DEFAULT 'quartal' CHECK (ust_rhythmus IN ('monatlich','quartal')),
    ust_bezahlt_bis date NOT NULL DEFAULT (date_trunc('quarter', CURRENT_DATE) - interval '1 day')::date,
    updated_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS fin_fristen (
    id text PRIMARY KEY,
    titel text NOT NULL,
    art text NOT NULL CHECK (art IN ('ust','est','sonstig')),
    faellig date NOT NULL,
    periode_ende date,
    betrag_cent bigint,
    erledigt_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now());

CREATE TABLE IF NOT EXISTS fin_protokoll (
    id bigserial PRIMARY KEY,
    aktion text NOT NULL,
    daten jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now());

INSERT INTO fin_einstellungen (id) VALUES ('haupt') ON CONFLICT (id) DO NOTHING;

INSERT INTO fin_fristen (id, titel, art, faellig, periode_ende) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING;

INSERT INTO fin_protokoll (aktion, daten) VALUES ($1, $2::jsonb);
