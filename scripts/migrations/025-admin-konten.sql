-- 025 · Admin-Konten: Anmeldung mit E-Mail + Passwort (scrypt-Hash, nie Klartext).
-- Das erste Konto entsteht bei der ersten Anmeldung mit einer Rollen-Variable (z. B. ADMIN_PASSWORD).
CREATE TABLE IF NOT EXISTS admin_users (
  email text PRIMARY KEY,
  name text,
  rolle text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);
