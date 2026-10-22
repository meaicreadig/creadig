"use server"

import { cookies, headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { after } from "next/server"

import { schreibeAntragsskizze } from "@/lib/assistent/kapital-antrag"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { antworte } from "@/lib/assistent/agent"
import { AGENT_KEYS, fuehreAgentAus, type AgentKey } from "@/lib/assistent/truppe"
import { postBeitrag } from "@/lib/assistent/redaktion-post"
import { erkenneLoeschwunsch, loescheFirmen } from "@/lib/assistent/loeschen"
import { istMail, markiereAntwort, sendeFreigabeMail } from "@/lib/assistent/versand"
import { sendeForderung } from "@/lib/agenten/forderungen"
import {
  aendereInhalt,
  assistentDb,
  beantworteRat,
  ergaenzeExtra,
  ladeFreigabe,
  ladeLinkedin,
  ladeRaete,
  setzeRatErledigt,
  fragenHeute,
  ladeVerlauf,
  setzeFreigabe,
  setzeMailKopf,
  speichereNachricht,
  TAGESLIMIT,
  KAPITAL_STUFEN,
  type KapitalStufe,
  type Nachricht,
} from "@/lib/assistent/store"
import { darfBetreten } from "@/lib/rollen"
import { protokolliereFaden } from "@/lib/zentrale/faden-protokoll"
import { generateText } from "ai"

async function werteAntwortAus(frage: string, antwort: string, loeschauftrag: boolean): Promise<string | null> {
  const { text } = await generateText({
    model: "openai/gpt-5.4-mini",
    prompt: `Du bist der Chief of Staff von Emin (creaDIG Solutions). Die Geschäftsleitung hat gefragt:
"${frage}"
Emin hat geantwortet:
"${antwort}"
${loeschauftrag ? "Ein Löschauftrag wurde daraus bereits als Freigabe-Karte angelegt." : ""}
Schreibe in 1–2 kurzen deutschen Sätzen, was die Truppe jetzt konkret daraus macht (Ergebnis-Sprache, kein Zitat der Antwort, keine Floskeln, kein Markdown).`,
  })
  const t = text.trim()
  return t ? t.slice(0, 400) : null
}

async function pruefe() {
  const zugang = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (zugang.verdict !== "ok" || !zugang.rolle || !darfBetreten(zugang.rolle, "/admin/assistent")) {
    throw new Error("Nicht berechtigt")
  }
  return zugang.rolle
}

export type FrageErgebnis = { ok: true; antwort: Nachricht } | { ok: false; fehler: string }

export async function frage(eingabe: string, bildDaten?: string | null): Promise<FrageErgebnis> {
  await pruefe()
  let bild: { base64: string; mediaType: string } | undefined
  if (bildDaten) {
    const m = bildDaten.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/)
    if (!m) return { ok: false, fehler: "Bildformat nicht unterstützt (PNG, JPG, WebP)." }
    if (m[2].length > 5_500_000) return { ok: false, fehler: "Bild zu groß – bitte kleiner als 4 MB." }
    bild = { mediaType: m[1], base64: m[2] }
  }
  const text = (eingabe.trim() || (bild ? "Was steht auf dem Bild – und was machen wir damit?" : "")).slice(0, 4000)
  if (!text) return { ok: false, fehler: "Leere Nachricht" }
  if ((await fragenHeute()) >= TAGESLIMIT) {
    return { ok: false, fehler: `Tageslimit von ${TAGESLIMIT} Fragen erreicht – morgen geht es weiter.` }
  }
  await speichereNachricht("user", bild ? `[Bild angehängt] ${text}` : text)
  try {
    const verlauf = await ladeVerlauf(16)
    const antwort = await antworte(verlauf, bild)
    const gespeichert = await speichereNachricht("assistant", antwort)
    revalidatePath("/admin/assistent")
    return { ok: true, antwort: gespeichert }
  } catch (e) {
    console.error("[assistent]", e)
    return { ok: false, fehler: "Der Assistent ist gerade nicht erreichbar. Bitte gleich nochmal versuchen." }
  }
}

export async function agentStarten(form: FormData): Promise<void> {
  await pruefe()
  const key = form.get("agent")
  if (typeof key !== "string" || !AGENT_KEYS.includes(key as AgentKey)) return
  await fuehreAgentAus(key as AgentKey)
  revalidatePath("/admin/assistent")
}

export async function ratAntworten(form: FormData): Promise<void> {
  await pruefe()
  const id = form.get("id")
  const antwort = form.get("antwort")
  if (typeof id !== "string" || typeof antwort !== "string" || !antwort.trim()) return
  const ratId = id.slice(0, 80)
  const text = antwort.trim().slice(0, 2000)
  await beantworteRat(ratId, text)
  const loesch = await erkenneLoeschwunsch(text, ratId).catch((e) => {
    console.error("[loeschen] erkennen", e)
    return null
  })
  const rat = (await ladeRaete(6)).find((r) => r.id === ratId)
  if (rat) {
    const erledigt = await werteAntwortAus(rat.protokoll.frage, text, Boolean(loesch)).catch(() => null)
    await setzeRatErledigt(ratId, erledigt ?? "Antwort ist angekommen und fließt in die nächste Sitzung ein.")
  }
  revalidatePath("/admin/assistent")
}

export async function antwortErhalten(form: FormData): Promise<void> {
  await pruefe()
  const id = form.get("id")
  if (typeof id !== "string") return
  await markiereAntwort(id.slice(0, 80))
  revalidatePath("/admin/assistent")
}

/** Absagegrund mitschreiben (freiwillig) — die Qualitätssicherung gibt ihn dem Agenten als Lernstoff zurück. */
async function merkeAbsageGrund(id: string, form: FormData): Promise<void> {
  const grund = String(form.get("grund") ?? "").trim().slice(0, 80)
  if (grund) await ergaenzeExtra(id, { grund }).catch((e) => console.error("[assistent] grund", e instanceof Error ? e.message : e))
}

/* Eigene Aktion: hängt nicht davon ab, ob der Browser den gedrückten Knopf mitschickt – sendet nie. */
export async function freigabeVerwerfen(form: FormData): Promise<void> {
  await pruefe()
  const id = form.get("id")
  if (typeof id !== "string") return
  await setzeFreigabe(id.slice(0, 80), "verworfen")
  await merkeAbsageGrund(id.slice(0, 80), form)
  revalidatePath("/admin/assistent")
}

export async function freigabeEntscheiden(form: FormData): Promise<void> {
  const rolle = await pruefe()
  const id = form.get("id")
  /* Karten tragen ein verstecktes status=freigegeben; der Verwerfen-Knopf schickt zusätzlich "verworfen" – das gewinnt immer. */
  const werte = form.getAll("status").map(String)
  const status = werte.includes("verworfen") ? "verworfen" : werte.includes("freigegeben") ? "freigegeben" : null
  if (typeof id !== "string" || !status) return
  const fid = id.slice(0, 80)
  const f = await ladeFreigabe(fid)
  if (!f || f.status !== "offen") return
  if (status === "verworfen") await merkeAbsageGrund(fid, form)

  const titel = form.get("titel")
  const inhalt = form.get("inhalt")
  if (status === "freigegeben" && typeof titel === "string" && typeof inhalt === "string" && inhalt.trim()) {
    await aendereInhalt(fid, titel.trim() || f.titel, inhalt.trim())
    /* Geändert vor der Freigabe = der Agent lag daneben. Zählt in seine Note (Qualitätssicherung). */
    if (inhalt.trim() !== f.inhalt.trim() || (titel.trim() && titel.trim() !== f.titel.trim())) await ergaenzeExtra(fid, { bearbeitet: true })
  }

  if (status === "freigegeben" && f.art === "mail") {
    const an = String(form.get("empfaenger") ?? f.empfaenger ?? "").trim()
    const betreff = String(form.get("betreff") ?? f.betreff ?? "").trim() || f.titel
    const text = typeof inhalt === "string" && inhalt.trim() ? inhalt.trim() : f.inhalt
    if (istMail(an)) await setzeMailKopf(fid, an, betreff)
    /* Emin bestätigt ausdrücklich eine Rechtsgrundlage (Einwilligung/Gespräch) – wird mit Zeitpunkt dokumentiert. */
    if (form.get("basis") === "1") {
      const basisBestaetigt = new Date().toISOString()
      await ergaenzeExtra(fid, { basisBestaetigt })
      f.extra = { ...(f.extra ?? {}), basisBestaetigt }
    }
    /* Tahsilat-Karten senden über das Mahnwesen (Vorlage, offener Betrag, Mahnstufe im Beleg) – nie als Vertriebsmail. */
    const forderung = f.agent === "forderungen" && f.extra.bezug?.startsWith("finanz:") ? f.extra.bezug.slice(7) : null
    const r = forderung ? await sendeForderung(forderung) : await sendeFreigabeMail(f, an, betreff, text)
    if (!r.ok) {
      await ergaenzeExtra(fid, { fehler: r.grund })
      revalidatePath("/admin/assistent")
      return
    }
    await ergaenzeExtra(fid, { gesendetAt: new Date().toISOString(), mailId: r.id, fehler: undefined })
    await protokolliereFaden(await assistentDb().catch(() => null), "assistent", "mailstudio", betreff)
  }

  if (status === "freigegeben" && f.art === "loeschen") {
    if (form.get("bestaetigt") !== "ja") return
    const r = await loescheFirmen(f.extra.orgIds ?? [])
    if (!r.ok) {
      await ergaenzeExtra(fid, { fehler: r.grund })
      revalidatePath("/admin/assistent")
      return
    }
    await ergaenzeExtra(fid, { fehler: undefined })
    revalidatePath("/admin/kunden")
    revalidatePath("/admin/verkaufen")
  }

  if (status === "freigegeben" && f.art === "kapital") {
    await ergaenzeExtra(fid, { antrag: { stufe: "pruefen", seit: new Date().toISOString() } })
    after(() => schreibeAntragsskizze(fid).catch((e) => console.error("[kapital] skizze", e)))
  }

  const zielWert = form.get("ziel")
  const kanal = zielWert === "firma" ? "firma" : "inhaber"
  const aufLinkedin = zielWert !== "keins"
  const aufInstagram = form.get("instagram") === "ja"
  if (status === "freigegeben" && f.art === "linkedin") {
    const text = typeof inhalt === "string" && inhalt.trim() ? inhalt.trim() : f.inhalt
    const ziel = aufLinkedin ? kanal : null
    const geplant = f.extra.geplant ? new Date(f.extra.geplant) : null
    /* Geplanter Beitrag: freigeben heißt "zum Sendetermin raus" – der Morgen-Takt postet. */
    if (geplant && geplant.getTime() > Date.now() + 10 * 60000 && (ziel || aufInstagram)) {
      if (ziel && !(await ladeLinkedin(ziel))) {
        await ergaenzeExtra(fid, { fehler: `${ziel === "firma" ? "Firmenseite" : "LinkedIn"} ist nicht verbunden — bitte zuerst verbinden.` })
        revalidatePath("/admin/assistent")
        return
      }
      await ergaenzeExtra(fid, { wartet: { kanal: ziel, instagram: aufInstagram, text }, fehler: undefined })
    } else {
      const h = await headers()
      const r = await postBeitrag({
        f,
        text,
        kanal: ziel,
        instagram: aufInstagram,
        kennung: rolle,
        origin: `https://${h.get("x-forwarded-host") ?? h.get("host")}`,
      })
      await ergaenzeExtra(fid, { fehler: r.fehler ?? undefined })
      if (!r.erfolg) {
        revalidatePath("/admin/assistent")
        return
      }
      revalidatePath("/admin/veroeffentlichungen")
    }
  }
  await setzeFreigabe(fid, status)
  revalidatePath("/admin/assistent")
}

export async function kapitalStufe(form: FormData): Promise<void> {
  await pruefe()
  const id = String(form.get("id") ?? "").slice(0, 80)
  const stufe = form.get("stufe")
  if (!KAPITAL_STUFEN.includes(stufe as KapitalStufe)) return
  const f = await ladeFreigabe(id)
  if (!f || f.art !== "kapital" || f.status !== "freigegeben") return
  await ergaenzeExtra(id, {
    antrag: { stufe: stufe as KapitalStufe, seit: new Date().toISOString(), skizze: f.extra.antrag?.skizze },
  })
  if (!f.extra.antrag?.skizze) after(() => schreibeAntragsskizze(id).catch(() => undefined))
  revalidatePath("/admin/assistent")
}
