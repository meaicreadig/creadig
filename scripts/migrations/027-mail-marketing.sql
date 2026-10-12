-- 027 · Mail-Marketing: Empfänger mit Rechtsgrundlage, Kampagnen, Zustellungen.
-- Auf BEIDEN Neon-Branches ausführen (Produktion + v0-preview).
-- Rechtsgrundlage (UWG §7): 'einwilligung' (ausdrücklich, mit Quelle) oder
-- 'bestandskunde' (§7 Abs. 3: eigene ähnliche Leistungen, Widerspruch jederzeit).

CREATE TABLE IF NOT EXISTS mail_recipients (
  id text PRIMARY KEY,
  email text NOT NULL,
  email_normalised text NOT NULL UNIQUE,
  name text,
  contact_id text REFERENCES contacts (id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'aktiv' CHECK (status IN ('aktiv','abgemeldet','unzustellbar')),
  basis text NOT NULL CHECK (basis IN ('einwilligung','bestandskunde')),
  source text NOT NULL,
  consent_at timestamptz NOT NULL DEFAULT now(),
  token text NOT NULL UNIQUE,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mail_campaigns (
  id text PRIMARY KEY,
  subject text NOT NULL DEFAULT '',
  preheader text NOT NULL DEFAULT '',
  headline text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  cta_text text NOT NULL DEFAULT '',
  cta_url text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'entwurf' CHECK (status IN ('entwurf','versendet')),
  recipients_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

CREATE TABLE IF NOT EXISTS mail_deliveries (
  id text PRIMARY KEY,
  campaign_id text NOT NULL REFERENCES mail_campaigns (id) ON DELETE CASCADE,
  recipient_id text NOT NULL REFERENCES mail_recipients (id) ON DELETE CASCADE,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'wartet' CHECK (status IN ('wartet','gesendet','fehler')),
  error text,
  sent_at timestamptz,
  opened_at timestamptz,
  clicked_at timestamptz,
  UNIQUE (campaign_id, recipient_id)
);
CREATE INDEX IF NOT EXISTS mail_deliveries_campaign_idx ON mail_deliveries (campaign_id);
