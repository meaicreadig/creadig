-- 026 · Termin-Motor: Verfügbarkeit, Sperren, Buchungslinks, Termine.
-- Rein additiv. Doppelbuchung verhindert die Datenbank selbst (EXCLUDE auf hold_range),
-- nicht nur die Oberfläche.

CREATE TABLE IF NOT EXISTS availability_settings (
  id text PRIMARY KEY DEFAULT 'owner',
  timezone text NOT NULL DEFAULT 'Europe/Berlin',
  week jsonb NOT NULL,
  buffer_min integer NOT NULL DEFAULT 30 CHECK (buffer_min BETWEEN 0 AND 240),
  min_notice_hours integer NOT NULL DEFAULT 24 CHECK (min_notice_hours BETWEEN 0 AND 336),
  horizon_days integer NOT NULL DEFAULT 21 CHECK (horizon_days BETWEEN 1 AND 90),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text
);

CREATE TABLE IF NOT EXISTS availability_blocks (
  id text PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('unavailable','tentative','soft_hold')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text,
  deleted_at timestamptz,
  CHECK (ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS availability_blocks_range_idx ON availability_blocks (starts_at, ends_at) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS booking_links (
  token text PRIMARY KEY,
  contact_id text REFERENCES contacts (id) ON DELETE SET NULL,
  organisation_id text REFERENCES organisations (id) ON DELETE SET NULL,
  meeting_kind text NOT NULL,
  duration_min integer NOT NULL CHECK (duration_min BETWEEN 10 AND 240),
  topic text,
  source text NOT NULL DEFAULT 'mail',
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text,
  used_at timestamptz,
  revoked_at timestamptz
);
CREATE INDEX IF NOT EXISTS booking_links_contact_idx ON booking_links (contact_id);

CREATE TABLE IF NOT EXISTS appointments (
  id text PRIMARY KEY,
  reference text NOT NULL UNIQUE,
  booking_token text REFERENCES booking_links (token) ON DELETE SET NULL,
  manage_token text NOT NULL UNIQUE,
  contact_id text REFERENCES contacts (id) ON DELETE SET NULL,
  organisation_id text REFERENCES organisations (id) ON DELETE SET NULL,
  meeting_kind text NOT NULL,
  topic text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  hold_range tstzrange NOT NULL,
  timezone text NOT NULL DEFAULT 'Europe/Berlin',
  status text NOT NULL DEFAULT 'booked'
    CHECK (status IN ('booked','confirmed','pending_calendar','rescheduled','cancelled','completed','no_show','booking_failed')),
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_note text,
  calendar_state text NOT NULL DEFAULT 'feed_only',
  calendar_external_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz,
  cancel_reason text,
  CHECK (ends_at > starts_at),
  CONSTRAINT appointments_no_overlap EXCLUDE USING gist (hold_range WITH &&)
    WHERE (status IN ('booked','confirmed','pending_calendar','rescheduled'))
);
CREATE INDEX IF NOT EXISTS appointments_starts_idx ON appointments (starts_at);
CREATE INDEX IF NOT EXISTS appointments_contact_idx ON appointments (contact_id);
