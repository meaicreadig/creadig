import "server-only"

import { generateText } from "ai"

import { assistentDb, legeFreigabeAn } from "@/lib/assistent/store"
import { sperrGrund } from "@/lib/recht/compliance"
import { tabelleFehlt, type Abfrage } from "@/lib/neon-abfrage"

import { istVerdaechtig } from "./regeln"
import { firmenText } from "@/lib/firmenwahrheit"

/**
 * Abteilung Kundenservice.
 * Der Gelir Motoru beantwortet Antworten auf Vertriebsmails. Alles andere —
 * Fragen von Bestandskunden, Mails ohne Bezug, „Sonstiges“ — blieb bisher
 * liegen. Hier bekommt jede solche Mail der letzten 14 Tage einen
 * Antwortentwurf in deiner Freigabe. Gesendet wird nichts; gesperrte Absender
 * und verdächtige Mails (Prompt-Injection) gehen nie an die KI.
 */

const MODELL = "openai/gpt-5.4-mini"
const JE_LAUF = 5
const GRUSS = "Viele Grüße\nEmin Akyol\ncreaDIG Solutions"

type Mail = { id: string; von: string; betreff: string | null; text: string }

async function bekannterKunde(q: Abfrage, mail: string): Promise<string | null> {
  const adresse = mail.trim().toLowerCase()
  const kontakt = (await q(`SELECT name FROM contacts WHERE email_normalised = $1 LIMIT 1`, [adresse]).catch((e) => {
    if (tabelleFehlt(e, "contacts")) return []
    throw e
  })) as { name: string | null }[]
  if (kontakt[0]) return kontakt[0].name ?? adresse
  const kunde = (await q(`SELECT daten->>'firma' AS firma, daten->>'name' AS name FROM fin_kunden WHERE lower(daten->>'email') = $1 LIMIT 1`, [adresse]).catch(
    (e) => {
      if (tabelleFehlt(e, "fin_kunden")) return []
      throw e
    },
  )) as { firma: string | null; name: string | null }[]
  return kunde[0] ? kunde[0].firma || kunde[0].name || adresse : null
}

async function entwurf(m: Mail, kunde: string | null): Promise<string> {
  const { text } = await generateText({
    model: MODELL,
    prompt: `Du bist der Kundenservice von creaDIG Solutions.
${firmenText("voll")}
${kunde ? `Absender ist bekannt: ${kunde}.` : "Absender ist UNBEKANNT – bedanke dich und frage freundlich nach, worum es genau geht und in welchem Zusammenhang."}

Schreibe einen Antwortentwurf: Deutsch (oder die Sprache des Absenders), Sie-Form, höchstens 120 Wörter, menschlich, konkret.
Verboten: Preise, Termine, Zusagen, Fristen, Rabatte, Behauptungen über Zertifizierungen oder Kunden. Was du nicht weißt, kündigst du als Rückmeldung von Emin an.
Beginne mit einer Anrede, ende genau mit:
${GRUSS}

Antworte NUR mit dem Mailtext.

MAIL von ${m.von} (Betreff: ${m.betreff ?? ""}):
${m.text.slice(0, 2500)}`,
  })
  const t = text.trim()
  return t.endsWith("creaDIG Solutions") ? t : `${t}\n\n${GRUSS}`
}

export async function kundenserviceRunde(): Promise<{ ergebnis: string; anzahl: number }> {
  const q = await assistentDb()
  if (!q) return { ergebnis: "Keine Datenbank", anzahl: 0 }
  let mails: Mail[]
  try {
    mails = (await q(
      `SELECT id, von, betreff, text FROM mail_eingang
        WHERE created_at > now() - interval '14 days' AND von <> '' AND entwurf_id IS NULL
          AND art IN ('sonstiges','unzugeordnet')
        ORDER BY created_at ASC LIMIT 30`,
      [],
    )) as Mail[]
  } catch (e) {
    if (tabelleFehlt(e, "mail_eingang")) return { ergebnis: "Kein Mail-Eingang", anzahl: 0 }
    throw e
  }

  let neu = 0
  let uebersprungen = 0
  let fehler = 0
  for (const m of mails) {
    if (neu >= JE_LAUF) break
    if ((await sperrGrund(m.von)) || istVerdaechtig(`${m.betreff ?? ""}\n${m.text}`)) {
      uebersprungen++
      continue
    }
    try {
      const kunde = await bekannterKunde(q, m.von)
      const text = await entwurf(m, kunde)
      const betreff = m.betreff ? (/^re:/i.test(m.betreff) ? m.betreff : `Re: ${m.betreff}`) : "Ihre Nachricht an creaDIG"
      const id = await legeFreigabeAn({
        art: "mail",
        titel: kunde ? `Kundenanfrage von ${kunde}` : `Unbekannte Mail von ${m.von}`,
        empfaenger: m.von,
        betreff,
        inhalt: `${text}\n---\nKunde schrieb: ${m.text.slice(0, 1200)}`,
        quelle: `kundenservice:${m.id}`,
        agent: "kundenservice",
        extra: { warum: kunde ? "Bekannter Kontakt ohne Bezug zu einer Vertriebsmail" : "Absender unbekannt – Rückfrage" },
      })
      if (id) {
        await q(`UPDATE mail_eingang SET entwurf_id = $2 WHERE id = $1`, [m.id, id])
        neu++
      }
    } catch (e) {
      fehler++
      console.error("[kundenservice]", m.id, e instanceof Error ? e.message : e)
    }
  }
  if (fehler && !neu) throw new Error(`${fehler} Entwürfe gescheitert`)
  return {
    ergebnis: [
      neu ? `${neu} Antwortentwurf/-entwürfe` : "Keine offene Kundenmail",
      uebersprungen ? `${uebersprungen} gesperrt/verdächtig übersprungen` : null,
      fehler ? `${fehler} gescheitert` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    anzahl: neu,
  }
}
