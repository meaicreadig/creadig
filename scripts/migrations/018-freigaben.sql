-- ===========================================================================
-- 018 · ADMIN OS · ADM-05 — FREIGABEN (Beleg-Erlaubnis)
--
-- Lesbare Fassung. Angewendet wird `SCHEMA` aus `lib/neon-client.ts`
-- (`npm run db-migrate`).
--
-- WARUM ES DIESE TABELLE GIBT
--   Die Erlaubnis eines Kunden, seinen Namen, sein Logo, eine Zahl oder ein
--   Zitat zu zeigen, stand bisher ausschliesslich als Code in
--   `lib/site-data.ts`. Damit war sie nur mit einem Commit erfassbar — und
--   ein WIDERRUF war eine Programmieraufgabe. Ein Kunde, der am Telefon
--   sagt „nehmen Sie das bitte raus", darf nicht auf einen Deploy warten.
--
-- WAS SIE NICHT TUT
--   Sie steuert die oeffentliche Seite noch NICHT. Die Projektion auf
--   creadig.de liest weiterhin `lib/site-data.ts` (G18, gesperrt). Bis diese
--   Bruecke gebaut ist, HAELT diese Tabelle eine Erlaubnis fest und setzt sie
--   nicht durch — und die Oberflaeche sagt das an jeder Stelle, an der es
--   zaehlt. Eine Freigabeverwaltung, die so tut, als wirke sie, waere
--   schlimmer als gar keine.
--
-- WAS EIN EINTRAG TRAEGT (Modell: `lib/proof.ts`)
--   by_name/by_role/by_company  Ein Mensch erteilt sie, nicht „die Firma".
--   form                        mail · vertrag · unterschrift · oeffentlich-
--                               veroeffentlicht. Die Form begrenzt, was die
--                               Freigabe ueberhaupt decken kann.
--   granted_on                  Wann (Datum, Europe/Berlin).
--   scopes                      Wofuer genau. Leer waere eine Zustimmung zu nichts.
--   reference                   WO sie liegt — Postfach, Ordner, Adresse. Das
--                               Dokument selbst gehoert nicht ins Repository.
--   withdrawn_at/_reason        Zurueckgezogen. Der Eintrag BLEIBT stehen: Man
--                               muss spaeter erklaeren koennen, warum damals
--                               etwas veroeffentlicht wurde.
--   actor                       Wer im Haus sie erfasst hat (Rolle).
--
-- IDEMPOTENZ
--   `releases_eindeutig` verhindert, dass derselbe Vorgang zweimal erfasst
--   wird: dieselbe Organisation, derselbe Mensch, dieselbe Form, dasselbe
--   Datum, dieselbe Fundstelle = eine Freigabe. Zwei Klicks auf „Erfassen"
--   ergeben keine zweite Erlaubnis.
--
-- Idempotent. Aendert keine bestehende Zeile.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS releases (
  id text PRIMARY KEY,
  organisation_id text NOT NULL REFERENCES organisations (id),
  by_name text NOT NULL,
  by_role text NOT NULL,
  by_company text NOT NULL,
  form text NOT NULL,
  granted_on date NOT NULL,
  scopes text[] NOT NULL DEFAULT '{}',
  reference text NOT NULL,
  withdrawn_at timestamptz,
  withdrawn_reason text,
  actor text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS releases_organisation_idx ON releases (organisation_id);

CREATE UNIQUE INDEX IF NOT EXISTS releases_eindeutig
  ON releases (organisation_id, lower(btrim(by_name)), form, granted_on, lower(btrim(reference)));
