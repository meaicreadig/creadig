-- ===========================================================================
-- 001 · Die Lead-Tabelle
--
-- Bildet `LeadRecord` aus lib/lead-store.ts ab. Eine Tabelle, sonst nichts:
-- keine Kunden, keine Projekte, keine Rechnungen. Die kommen, wenn es sie
-- wirklich gibt, mit ihrer eigenen Migration.
--
-- Idempotent: laesst sich mehrfach ausfuehren, ohne Schaden anzurichten.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS leads (
  -- Interne, unveraenderliche Kennung (UUID). Primaerschluessel.
  id              text PRIMARY KEY,

  -- Menschliche Nummer CD-JJMMTT-XXXX. Steht in der Mail und nennt der
  -- Anrufer. BEWUSST kein Primaerschluessel: Sie ist fuer Menschen gemacht,
  -- und was Menschen lesen, aendert sich irgendwann.
  reference       text NOT NULL,

  -- HMAC des Absende-Tokens. Der Schluessel gegen Doppeleintraege — und
  -- zwar HIER im Schema, nicht nur im Anwendungscode: Zwei gleichzeitige
  -- Anfragen koennen die Pruefung im Code beide passieren; die Datenbank
  -- laesst nur eine durch.
  --
  -- Nullable, weil eine Anfrage ohne Token denkbar bleibt. Postgres erlaubt
  -- beliebig viele NULL in einem UNIQUE-Index — genau das gewuenschte
  -- Verhalten: kein Token heisst keine Doppelpruefung, nicht "Kollision".
  submission_key  text UNIQUE,

  source          text NOT NULL,
  locale          text NOT NULL,

  name            text NOT NULL,
  email           text NOT NULL,
  phone           text NOT NULL,
  business        text,
  message         text,
  site_url        text,

  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_term        text,
  utm_content     text,

  -- Die neun Zustaende aus SALES_STATES. Als CHECK und nicht als ENUM:
  -- Ein ENUM zu erweitern ist eine Migration, eine CHECK-Liste auch — aber
  -- die CHECK-Liste steht lesbar hier und nicht in einem Systemkatalog.
  sales_status    text NOT NULL DEFAULT 'new'
                  CHECK (sales_status IN (
                    'new','contacted','qualified','discovery','audit',
                    'proposal','negotiation','won','lost'
                  )),

  next_action     text,
  next_action_at  date,

  -- Nur bei 'lost' gefuellt. Die Regel dahinter steht im Anwendungscode;
  -- das Schema erzwingt sie nicht, weil ein Statuswechsel sonst zwei
  -- Schreibvorgaenge in fester Reihenfolge braeuchte.
  lost_reason     text,

  created_at      timestamptz NOT NULL,
  updated_at      timestamptz NOT NULL
);

-- Die Liste sortiert nach Eingang, neueste zuerst.
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);

-- Der Statusfilter im Control Center.
CREATE INDEX IF NOT EXISTS leads_sales_status_idx ON leads (sales_status);

-- Die Aufbewahrungs-Abfrage laeuft auf updated_at und schliesst 'won' aus
-- (docs/ops/neon-decision-pack.md §13b/§14).
CREATE INDEX IF NOT EXISTS leads_updated_at_idx ON leads (updated_at);

-- Mehr Indizes gibt es bewusst nicht. Jeder kostet bei jedem Schreibvorgang,
-- und die Freitextsuche laeuft bei dieser Groessenordnung schnell genug
-- sequenziell. Wenn das eines Tages nicht mehr stimmt, ist es messbar.
