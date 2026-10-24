import "server-only"

import { assistentDb } from "@/lib/assistent/store"
import { siteUrl } from "@/lib/termine/mail"

/**
 * Abteilung Recht & Compliance.
 * Grundsatz (UWG § 7 Abs. 2 Nr. 2, DSGVO Art. 6/21): Werbung per E-Mail nur mit Einwilligung
 * oder in einer bestehenden Beziehung. Kaltakquise per Mail ist auch im B2B-Bereich unzulässig.
 * Ein Widerspruch gilt für immer – die Adresse (bei Firmendomains die ganze Domain) wird gesperrt.
 */

export type RechtsBasis = "einwilligung" | "bestandskunde" | "anfrage" | "antwort" | "gespraech" | "bestaetigt" | "keine"
export type Pruefung = { erlaubt: boolean; basis: RechtsBasis; grund: string }

export const BASIS_TEXT: Record<RechtsBasis, string> = {
  einwilligung: "Einwilligung liegt vor",
  bestandskunde: "Bestandskunde",
  anfrage: "Anfrage über das Website-Formular",
  antwort: "Empfänger hat selbst geschrieben",
  gespraech: "Laufendes Gespräch",
  bestaetigt: "Von Emin bestätigt",
  keine: "Keine Rechtsgrundlage",
}

const FREEMAIL = new Set([
  "gmail.com", "googlemail.com", "gmx.de", "gmx.net", "gmx.at", "gmx.ch", "web.de", "outlook.com", "outlook.de",
  "hotmail.com", "hotmail.de", "live.com", "live.de", "yahoo.com", "yahoo.de", "t-online.de", "icloud.com", "me.com",
  "aol.com", "freenet.de", "posteo.de", "mail.de", "protonmail.com", "proton.me",
])

const norm = (s: string) => s.trim().toLowerCase()
const domainVon = (mail: string) => norm(mail).split("@")[1] ?? ""

let bereit: Promise<void> | null = null
async function db() {
  const q = await assistentDb()
  if (!q) return null
  if (!bereit) {
    bereit = q(
      `CREATE TABLE IF NOT EXISTS mail_sperrliste (
         wert text PRIMARY KEY,
         art text NOT NULL CHECK (art IN ('email','domain')),
         grund text NOT NULL,
         quelle text,
         created_at timestamptz NOT NULL DEFAULT now())`,
      [],
    )
      .then(() => undefined)
      .catch((e) => {
        bereit = null
        throw e
      })
  }
  await bereit
  return q
}

/** Sperrt nach Widerspruch: Firmendomain komplett, Freemail nur die Adresse. */
export async function sperre(adresse: string, grund: string, quelle?: string | null): Promise<string | null> {
  const q = await db()
  if (!q || !adresse.includes("@")) return null
  const domain = domainVon(adresse)
  const wert = FREEMAIL.has(domain) ? norm(adresse) : domain
  const art = FREEMAIL.has(domain) ? "email" : "domain"
  await q(
    `INSERT INTO mail_sperrliste (wert, art, grund, quelle) VALUES ($1,$2,$3,$4)
     ON CONFLICT (wert) DO UPDATE SET grund = EXCLUDED.grund`,
    [wert, art, grund.slice(0, 500), quelle ?? null],
  )
  await q(`UPDATE mail_recipients SET status = 'abgemeldet' WHERE email_normalised = $1 OR email_normalised LIKE $2`, [
    norm(adresse),
    art === "domain" ? `%@${domain}` : norm(adresse),
  ]).catch(() => null)
  /* Alles, was noch offen an diese Adresse/Domain wartet, geht nicht mehr raus. */
  await q(
    `UPDATE assistent_freigaben SET status = 'verworfen', erledigt_at = now(),
       extra = coalesce(extra,'{}'::jsonb) || jsonb_build_object('automatisch', 'Recht & Compliance: Empfänger hat widersprochen')
     WHERE status = 'offen' AND art = 'mail' AND (lower(empfaenger) = $1 OR lower(empfaenger) LIKE $2)`,
    [norm(adresse), art === "domain" ? `%@${domain}` : norm(adresse)],
  )
  /* Ins Rückgrat melden: kein Motor-Ablauf schreibt dieser Person weiter. */
  const kontakt = (await q(`SELECT id FROM contacts WHERE email_normalised = $1 LIMIT 1`, [norm(adresse)]).catch(() => [])) as { id: string }[]
  const { ereignis } = await import("@/lib/motor/ereignis")
  await ereignis("kontakt_gesperrt", {
    kontaktId: kontakt[0]?.id ?? null,
    subjekt: `mail:${norm(adresse)}`,
    email: norm(adresse),
    daten: { grund: grund.slice(0, 200) },
    schluessel: `sperre:${wert}`,
  })
  return wert
}

export async function sperrGrund(adresse: string): Promise<string | null> {
  const q = await db()
  if (!q) return null
  const r = (await q(`SELECT grund FROM mail_sperrliste WHERE wert = $1 OR wert = $2 LIMIT 1`, [norm(adresse), domainVon(adresse)])) as {
    grund: string
  }[]
  return r[0]?.grund ?? null
}

export async function ladeSperrliste(limit = 50): Promise<{ wert: string; art: string; grund: string; zeit: string }[]> {
  const q = await db()
  if (!q) return []
  const r = (await q(`SELECT wert, art, grund, created_at FROM mail_sperrliste ORDER BY created_at DESC LIMIT $1`, [limit])) as {
    wert: string
    art: string
    grund: string
    created_at: string
  }[]
  return r.map((x) => ({ wert: x.wert, art: x.art, grund: x.grund, zeit: String(x.created_at) }))
}

async function ersterTreffer(q: NonNullable<Awaited<ReturnType<typeof db>>>, sql: string, p: unknown[]): Promise<boolean> {
  try {
    return ((await q(sql, p)) as unknown[]).length > 0
  } catch {
    return false
  }
}

/** Warum wir diese Adresse anschreiben dürfen – oder dass es keinen Grund gibt. */
export async function rechtsBasis(adresse: string, bestaetigt = false): Promise<RechtsBasis> {
  if (bestaetigt) return "bestaetigt"
  const q = await db()
  if (!q) return "keine"
  const a = norm(adresse)
  if (await ersterTreffer(q, `SELECT 1 FROM mail_recipients WHERE email_normalised = $1 AND status = 'aktiv' AND basis = 'einwilligung' LIMIT 1`, [a])) return "einwilligung"
  if (await ersterTreffer(q, `SELECT 1 FROM mail_recipients WHERE email_normalised = $1 AND status = 'aktiv' AND basis = 'bestandskunde' LIMIT 1`, [a])) return "bestandskunde"
  /* Wer über das Formular anfragt, will eine Antwort – das ist keine Werbung (24.10.2026: blockierte sonst jede Erstantwort). */
  if (await ersterTreffer(q, `SELECT 1 FROM leads WHERE lower(email) = $1 AND created_at > now() - interval '2 years' LIMIT 1`, [a])) return "anfrage"
  if (
    await ersterTreffer(
      q,
      `SELECT 1 FROM mail_eingang WHERE lower(von) LIKE '%' || $1 || '%' AND coalesce(art,'') NOT IN ('nein','abwesend') LIMIT 1`,
      [a],
    )
  )
    return "antwort"
  if (
    await ersterTreffer(
      q,
      `SELECT 1 FROM assistent_freigaben WHERE lower(empfaenger) = $1 AND extra ? 'antwortAt'
         AND coalesce(extra->>'antwortArt','') <> 'nein' AND NOT coalesce((extra->>'widerspruch')::boolean, false) LIMIT 1`,
      [a],
    )
  )
    return "antwort"
  if (
    await ersterTreffer(
      q,
      `SELECT 1 FROM contacts c
         LEFT JOIN opportunities o ON o.contact_id = c.id
         LEFT JOIN activities x ON x.subject_type = 'contact' AND x.subject_id = c.id AND (x.kind LIKE 'gespraech%' OR x.kind LIKE 'termin%')
        WHERE c.email_normalised = $1
          AND (o.status IN ('qualified','proposal','negotiation','won') OR x.id IS NOT NULL)
        LIMIT 1`,
      [a],
    )
  )
    return "gespraech"
  return "keine"
}

/** Prüft vor jedem Versand. Ohne Rechtsgrundlage geht keine Werbemail raus. */
export async function pruefeEmpfaenger(adresse: string, opts: { bestaetigt?: boolean } = {}): Promise<Pruefung> {
  const sperr = await sperrGrund(adresse)
  if (sperr) return { erlaubt: false, basis: "keine", grund: `Gesperrt: ${sperr}` }
  const basis = await rechtsBasis(adresse, opts.bestaetigt)
  if (basis === "keine") {
    return {
      erlaubt: false,
      basis,
      grund:
        "Recht & Compliance: Keine Einwilligung und keine bestehende Beziehung – Werbung per E-Mail wäre unzulässig (UWG § 7 Abs. 2 Nr. 2). Nur senden, wenn eine Einwilligung oder Geschäftsbeziehung besteht, und das unten bestätigen.",
    }
  }
  return { erlaubt: true, basis, grund: BASIS_TEXT[basis] }
}

/** Täglicher Lauf der Abteilung Recht & Compliance. Ohne KI, ohne Kosten. */
export async function rechtsRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const q = await db()
  if (!q) return { ergebnis: "Keine Datenbank", anzahl: 0 }

  /* 1. Jede offene Mail prüfen: Kaltakquise schließen, Rest mit Rechtsgrundlage kennzeichnen. */
  const offen = (await q(
    `SELECT id, empfaenger, agent, extra FROM assistent_freigaben
      WHERE status = 'offen' AND art = 'mail' AND NOT coalesce(extra,'{}'::jsonb) ? 'kampagneId'`,
    [],
  )) as { id: string; empfaenger: string | null; agent: string | null; extra: Record<string, unknown> | null }[]
  let geschlossen = 0
  let markiert = 0
  for (const f of offen) {
    if (!f.empfaenger) continue
    const p = await pruefeEmpfaenger(f.empfaenger, { bestaetigt: Boolean(f.extra?.basisBestaetigt) })
    const kalt = f.agent === "jaeger" || f.agent === "golf"
    if (!p.erlaubt && (kalt || p.grund.startsWith("Gesperrt"))) {
      await q(
        `UPDATE assistent_freigaben SET status = 'verworfen', erledigt_at = now(),
           extra = coalesce(extra,'{}'::jsonb) || jsonb_build_object('automatisch', $2::text, 'recht', $2::text)
         WHERE id = $1 AND status = 'offen'`,
        [f.id, p.grund.slice(0, 300)],
      )
      geschlossen++
    } else {
      await q(`UPDATE assistent_freigaben SET extra = coalesce(extra,'{}'::jsonb) || jsonb_build_object('recht', $2::text, 'rechtOk', $3::boolean) WHERE id = $1`, [
        f.id,
        p.grund.slice(0, 300),
        p.erlaubt,
      ])
      markiert++
    }
  }

  /* 2. Widersprüche aus dem Eingang, die noch nicht gesperrt sind, nachziehen. */
  let gesperrt = 0
  const absagen = (await q(`SELECT von, id FROM mail_eingang WHERE art = 'nein' ORDER BY created_at DESC LIMIT 50`, []).catch(() => [])) as {
    von: string | null
    id: string
  }[]
  for (const a of absagen) {
    const mail = a.von?.match(/[^\s<>"]+@[^\s<>"]+/)?.[0]
    if (!mail || (await sperrGrund(mail))) continue
    await sperre(mail, "Widerspruch per Antwortmail (kein Interesse)", a.id)
    gesperrt++
  }

  /* 3. Pflichtseiten erreichbar? */
  const basis = siteUrl()
  const fehlend: string[] = []
  for (const pfad of ["/impressum", "/datenschutz"]) {
    try {
      const r = await fetch(`${basis}${pfad}`, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(8000) })
      if (!r.ok) fehlend.push(pfad)
    } catch {
      fehlend.push(pfad)
    }
  }

  const teile = [
    geschlossen ? `${geschlossen} unzulässige Kaltmail${geschlossen === 1 ? "" : "s"} gestoppt` : null,
    gesperrt ? `${gesperrt} Widerspruch${gesperrt === 1 ? "" : "e"} gesperrt` : null,
    markiert ? `${markiert} Mail${markiert === 1 ? "" : "s"} geprüft` : null,
    fehlend.length ? `Pflichtseite nicht erreichbar: ${fehlend.join(", ")}` : "Impressum und Datenschutz erreichbar",
  ].filter(Boolean)
  return { ergebnis: teile.join(" · "), anzahl: geschlossen + gesperrt + markiert }
}
