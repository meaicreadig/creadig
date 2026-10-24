import "server-only"
import { randomBytes } from "node:crypto"

import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"
import { SITE_URL } from "@/lib/routes"
import { sendeMail } from "@/lib/termine/mail"

import { empfaengerEintragen } from "./store"

/**
 * NEWSLETTER MIT DOUBLE-OPT-IN — 24.10.2026 (Recherche „Pazarlama satış ve
 * konumlandırma“, Automatik 1 von 4).
 *
 * Bisher kam in mail_recipients nur, wen Emin von Hand eintrug. Eine Anmeldung
 * auf der Website ist jetzt der einzige Weg zu basis = 'einwilligung' – und
 * zwar erst nach dem Klick auf den Bestätigungslink. Bis dahin liegt sie nur
 * hier, mit allem, was im Streit die Einwilligung beweist (UWG § 7, DSGVO Art. 7
 * Abs. 1 – die Beweislast liegt bei uns):
 *
 *   Zeitpunkt Anmeldung + Bestätigung, wörtlicher Einwilligungstext samt
 *   Version, Quelle/Seite, Sprache und ein HMAC der IP (nie die IP selbst).
 *
 * Die Bestätigungsmail enthält keine Werbung, nur den Link. Bestätigt wird per
 * Knopf, nicht per GET – Link-Scanner in Firmenpostfächern würden sonst
 * „bestätigen“. Unbestätigte Anmeldungen verfallen nach 30 Tagen.
 */

export const EINWILLIGUNG_VERSION = "2026-10-24"
export const EINWILLIGUNG_TEXT: Record<"de" | "tr" | "en", string> = {
  de: "Ja, ich möchte neue Beiträge und Hinweise von creaDIG per E-Mail erhalten (höchstens zweimal im Monat). Abmeldung jederzeit über den Link in jeder Mail.",
  tr: "Evet, creaDIG'in yeni yazılarını ve duyurularını e-postayla almak istiyorum (ayda en fazla iki kez). Her e-postadaki bağlantıyla istediğim zaman çıkabilirim.",
  en: "Yes, I would like to receive new articles and notes from creaDIG by e-mail (at most twice a month). Unsubscribe any time via the link in every e-mail.",
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS mail_anmeldungen (
    id text PRIMARY KEY,
    email text NOT NULL,
    email_normalised text NOT NULL,
    token text NOT NULL UNIQUE,
    sprache text NOT NULL DEFAULT 'de',
    quelle text NOT NULL,
    text_version text NOT NULL,
    einwilligung_text text NOT NULL,
    ip_hmac text,
    angemeldet_at timestamptz NOT NULL DEFAULT now(),
    bestaetigt_at timestamptz,
    bestaetigt_ip_hmac text)`,
  `CREATE INDEX IF NOT EXISTS mail_anmeldungen_email_idx ON mail_anmeldungen (email_normalised)`,
]
let bereit: Promise<void> | null = null
async function db(): Promise<Abfrage | null> {
  const q = neonAbfrage()
  if (!q) return null
  if (!bereit) {
    bereit = (async () => {
      for (const ddl of SCHEMA) await q(ddl, [])
    })().catch((e) => {
      bereit = null
      throw e
    })
  }
  await bereit
  return q
}

const istMail = (s: string) => /^[^\s@<>()]{1,64}@[^\s@<>()]{1,190}\.[a-z]{2,}$/i.test(s)

export type AnmeldeErgebnis = { ok: true } | { ok: false; grund: "ungueltig" | "nicht_eingerichtet" | "fehler" }

export async function meldeAn(a: { email: string; sprache: "de" | "tr" | "en"; quelle: string; ipHmac: string | null }): Promise<AnmeldeErgebnis> {
  const email = a.email.trim()
  if (!istMail(email) || email.length > 254) return { ok: false, grund: "ungueltig" }
  const q = await db()
  if (!q) return { ok: false, grund: "nicht_eingerichtet" }
  const norm = email.toLowerCase()

  /* Bereits aktiv? Dann still „ok“ – keine zweite Mail, und niemand erfährt, wer abonniert ist. */
  const aktiv = (await q(`SELECT 1 FROM mail_recipients WHERE email_normalised = $1 AND status = 'aktiv' LIMIT 1`, [norm]).catch(() => [])) as unknown[]
  if (aktiv.length) return { ok: true }
  /* Höchstens eine Bestätigungsmail je Adresse und Tag – sonst ließe sich jemand per Formular zuspammen. */
  const juengst = (await q(
    `SELECT 1 FROM mail_anmeldungen WHERE email_normalised = $1 AND bestaetigt_at IS NULL AND angemeldet_at > now() - interval '1 day' LIMIT 1`,
    [norm],
  )) as unknown[]
  if (juengst.length) return { ok: true }

  await q(`DELETE FROM mail_anmeldungen WHERE bestaetigt_at IS NULL AND angemeldet_at < now() - interval '30 days'`, []).catch(() => null)
  const token = randomBytes(24).toString("base64url")
  await q(
    `INSERT INTO mail_anmeldungen (id, email, email_normalised, token, sprache, quelle, text_version, einwilligung_text, ip_hmac)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [`anm-${randomBytes(6).toString("hex")}`, email, norm, token, a.sprache, a.quelle.slice(0, 200), EINWILLIGUNG_VERSION, EINWILLIGUNG_TEXT[a.sprache], a.ipHmac],
  )

  const link = `${SITE_URL}/mail/bestaetigen/${token}`
  const t = {
    de: { betreff: "Bitte bestätigen Sie Ihre Anmeldung", gruss: "Guten Tag,", satz: "Sie (oder jemand mit Ihrer Adresse) haben sich auf creadig.de für unsere E-Mails angemeldet. Bitte bestätigen Sie das mit einem Klick:", knopf: "Anmeldung bestätigen", sonst: "Wenn Sie das nicht waren, ignorieren Sie diese Mail einfach – Sie erhalten dann nichts weiter." },
    tr: { betreff: "Lütfen kaydınızı onaylayın", gruss: "Merhaba,", satz: "Siz (ya da adresinizi kullanan biri) creadig.de üzerinden e-postalarımıza kaydoldunuz. Lütfen tek tıkla onaylayın:", knopf: "Kaydı onayla", sonst: "Bu siz değilseniz bu e-postayı dikkate almayın – başka bir şey almayacaksınız." },
    en: { betreff: "Please confirm your sign-up", gruss: "Hello,", satz: "You (or someone using your address) signed up for our e-mails on creadig.de. Please confirm with one click:", knopf: "Confirm sign-up", sonst: "If this wasn't you, simply ignore this e-mail – you won't hear from us again." },
  }[a.sprache]
  const versand = await sendeMail({
    to: email,
    subject: t.betreff,
    text: `${t.gruss}\n\n${t.satz}\n${link}\n\n${t.sonst}\n\ncreaDIG Solutions · Inh. Muhammed Emin Akyol`,
    html: `<p>${t.gruss}</p><p>${t.satz}</p><p><a href="${link}" style="display:inline-block;padding:10px 18px;background:#1f3fd1;color:#fff;border-radius:8px;text-decoration:none">${t.knopf}</a></p><p style="color:#666">${t.sonst}</p><p style="color:#666;font-size:12px">creaDIG Solutions · Inh. Muhammed Emin Akyol</p>`,
  }).catch(() => ({ ok: false as const, grund: "fehler" as const }))
  return versand.ok ? { ok: true } : { ok: false, grund: versand.grund === "nicht_eingerichtet" ? "nicht_eingerichtet" : "fehler" }
}

export async function anmeldungPerToken(token: string): Promise<{ email: string; bestaetigt: boolean } | null> {
  if (!/^[\w-]{20,60}$/.test(token)) return null
  const q = await db()
  if (!q) return null
  const [r] = (await q(`SELECT email, bestaetigt_at FROM mail_anmeldungen WHERE token = $1`, [token])) as { email: string; bestaetigt_at: unknown }[]
  return r ? { email: r.email, bestaetigt: Boolean(r.bestaetigt_at) } : null
}

/** Der Klick auf „Bestätigen“: erst jetzt entsteht die Einwilligung im Verteiler. */
export async function bestaetige(token: string, ipHmac: string | null): Promise<boolean> {
  if (!/^[\w-]{20,60}$/.test(token)) return false
  const q = await db()
  if (!q) return false
  const [r] = (await q(
    `UPDATE mail_anmeldungen SET bestaetigt_at = coalesce(bestaetigt_at, now()), bestaetigt_ip_hmac = coalesce(bestaetigt_ip_hmac, $2)
      WHERE token = $1 AND angemeldet_at > now() - interval '30 days' RETURNING id, email, quelle, text_version`,
    [token, ipHmac],
  )) as { id: string; email: string; quelle: string; text_version: string }[]
  if (!r) return false
  await empfaengerEintragen({ email: r.email, name: null, basis: "einwilligung", source: `doi:${r.id}:${r.quelle}:v${r.text_version}` })
  /* War die Adresse früher abgemeldet, ist die neue Bestätigung eine neue Einwilligung. */
  await q(
    `UPDATE mail_recipients SET status = 'aktiv', basis = 'einwilligung', consent_at = now(), unsubscribed_at = NULL, source = $2
      WHERE email_normalised = $1 AND status = 'abgemeldet'`,
    [r.email.toLowerCase(), `doi:${r.id}:${r.quelle}:v${r.text_version}`],
  )
  return true
}
