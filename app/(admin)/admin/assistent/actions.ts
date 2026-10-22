"use server"

import { cookies, headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { after } from "next/server"

import { veroeffentlicheInstagram } from "@/lib/assistent/instagram"
import { schreibeAntragsskizze } from "@/lib/assistent/kapital-antrag"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { antworte } from "@/lib/assistent/agent"
import { AGENT_KEYS, fuehreAgentAus, type AgentKey } from "@/lib/assistent/truppe"
import { veroeffentliche } from "@/lib/assistent/linkedin"
import { erkenneLoeschwunsch, loescheFirmen } from "@/lib/assistent/loeschen"
import { istMail, markiereAntwort, sendeFreigabeMail } from "@/lib/assistent/versand"
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
import { getVertriebStore } from "@/lib/lead-store"
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

/* Eigene Aktion: hängt nicht davon ab, ob der Browser den gedrückten Knopf mitschickt – sendet nie. */
export async function freigabeVerwerfen(form: FormData): Promise<void> {
  await pruefe()
  const id = form.get("id")
  if (typeof id !== "string") return
  await setzeFreigabe(id.slice(0, 80), "verworfen")
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

  const titel = form.get("titel")
  const inhalt = form.get("inhalt")
  if (status === "freigegeben" && typeof titel === "string" && typeof inhalt === "string" && inhalt.trim()) {
    await aendereInhalt(fid, titel.trim() || f.titel, inhalt.trim())
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
    const r = await sendeFreigabeMail(f, an, betreff, text)
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
    const fehler: string[] = []
    let erfolg = false

    if (aufInstagram) {
      try {
        const h = await headers()
        const origin = `https://${h.get("x-forwarded-host") ?? h.get("host")}`
        const r = await veroeffentlicheInstagram({ freigabeId: fid, text, origin })
        await ergaenzeExtra(fid, { instagramId: r.medienId, instagramUrl: r.link })
        erfolg = true
        const heute = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date())
        await getVertriebStore({ kennung: rolle, herkunft: "HUMAN" })
          ?.recordPublication({ was: `Instagram: ${text.split("\n")[0].slice(0, 180)}`, kanal: "andere", veroeffentlichtAm: heute, url: r.link })
          .catch(() => null)
      } catch (e) {
        console.error("[instagram] post", e)
        fehler.push(`Instagram: ${e instanceof Error ? e.message.slice(0, 200) : "fehlgeschlagen"}`)
      }
    }

    if (!aufLinkedin) {
      if (!erfolg) {
        await ergaenzeExtra(fid, { fehler: fehler.join(" · ") || "Kein Kanal gewählt — nichts wurde gepostet." })
        revalidatePath("/admin/assistent")
        return
      }
      await ergaenzeExtra(fid, { fehler: undefined })
      await setzeFreigabe(fid, status)
      revalidatePath("/admin/assistent")
      return
    }

    /* Ohne Verbindung wird NICHT als freigegeben markiert: Der Inhaber muss sehen, dass nichts gepostet wurde. */
    if (!(await ladeLinkedin(kanal))) {
      if (erfolg) {
        await ergaenzeExtra(fid, { fehler: "LinkedIn nicht verbunden – nur auf Instagram gepostet." })
        await setzeFreigabe(fid, status)
        revalidatePath("/admin/assistent")
        return
      }
      fehler.push(`${kanal === "firma" ? "Firmenseite" : "LinkedIn"} ist nicht verbunden — nichts wurde gepostet. Bitte verbinden und erneut freigeben.`)
      await ergaenzeExtra(fid, { fehler: fehler.join(" · ") })
      revalidatePath("/admin/assistent")
      return
    }
    try {
      const postUrn = await veroeffentliche({ text, bildPfad: f.bildPfad, alt: f.extra.alt, kanal })
      await ergaenzeExtra(fid, { postUrn, fehler: fehler.length ? fehler.join(" · ") : undefined })
      /* Jeder echte Post gehört ins Veröffentlichungsregister — wie bei der Werkstatt unter /admin/marketing. */
      const heute = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date())
      try {
        await getVertriebStore({ kennung: rolle, herkunft: "HUMAN" })?.recordPublication({
          was: text.split("\n")[0].slice(0, 200),
          kanal: "linkedin",
          veroeffentlichtAm: heute,
          url: postUrn.startsWith("urn:li:") ? `https://www.linkedin.com/feed/update/${postUrn}/` : null,
        })
        revalidatePath("/admin/veroeffentlichungen")
      } catch {
        /* Der Beitrag ist live; ein fehlender Registereintrag darf das nicht als Fehler melden. */
      }
      await protokolliereFaden(await assistentDb().catch(() => null), "marketing", "assistent", f.titel)
    } catch (e) {
      console.error("[linkedin] post", e)
      fehler.push(`LinkedIn: ${e instanceof Error ? e.message.slice(0, 200) : "Veröffentlichung fehlgeschlagen"}`)
      await ergaenzeExtra(fid, { fehler: fehler.join(" · ") })
      if (!erfolg) {
        revalidatePath("/admin/assistent")
        return
      }
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
