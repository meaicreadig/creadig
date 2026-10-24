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
  setzeBeschlussErledigt,
  fragenHeute,
  ladeVerlauf,
  setzeFreigabe,
  setzeMailKopf,
  speichereNachricht,
  TAGESLIMIT,
  KAPITAL_STUFEN,
  type Freigabe,
  type KapitalStufe,
  type Nachricht,
} from "@/lib/assistent/store"
import { notiereEntscheidung } from "@/lib/lernen/store"
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
    const { mitAgent } = await import("@/lib/lernen/kontext")
    const antwort = await mitAgent("assistent", () => antworte(verlauf, bild))
    const gespeichert = await speichereNachricht("assistant", antwort.text, antwort.uebernahmen)
    revalidatePath("/admin/assistent")
    return { ok: true, antwort: gespeichert }
  } catch (e) {
    console.error("[assistent]", e)
    return { ok: false, fehler: "Der Assistent ist gerade nicht erreichbar. Bitte gleich nochmal versuchen." }
  }
}

/** Nachrichten nach `zeit` – der Chat holt so die Meldungen der Nacharbeit (Recherche, Gesprächsraum) nach. */
export async function nachrichtenSeit(zeit: string): Promise<Nachricht[]> {
  await pruefe()
  const t = Date.parse(zeit)
  if (!Number.isFinite(t)) return []
  return (await ladeVerlauf(10)).filter((m) => Date.parse(m.zeit) > t)
}

export type FrageAntwort = { ok: true; nachrichten: Nachricht[] } | { ok: false; fehler: string }

/**
 * Emin beantwortet eine Frage eines KI-Mitarbeiters (Knopf oder Freitext). Die Antwort
 * geht als seine Nachricht an Aylin, die mit ihren Werkzeugen weitermacht.
 */
export async function frageBeantworten(id: string, antwort: string): Promise<FrageAntwort> {
  await pruefe()
  const { ladeFrage, markiereBeantwortet } = await import("@/lib/assistent/fragen")
  const { personVon } = await import("@/lib/zentrale/personen")
  const f = await ladeFrage(String(id).slice(0, 80))
  const a = String(antwort ?? "").trim().slice(0, 1500)
  if (!f) return { ok: false, fehler: "Diese Frage ist schon beantwortet." }
  if (!a) return { ok: false, fehler: "Leere Antwort" }
  await markiereBeantwortet(f.id, a)
  const p = personVon(f.agent)
  const text = `Antwort an ${p.name} (${p.rolle.de}) auf „${f.frage}“: ${a}${f.bezug ? `\n[Bezug: ${f.bezug}${f.kontext ? ` · ${f.kontext}` : ""}]` : ""}`
  const user = await speichereNachricht("user", text)
  try {
    const verlauf = await ladeVerlauf(16)
    const { mitAgent } = await import("@/lib/lernen/kontext")
    const r = await mitAgent("assistent", () => antworte(verlauf))
    const gespeichert = await speichereNachricht("assistant", r.text, r.uebernahmen)
    revalidatePath("/admin/assistent")
    return { ok: true, nachrichten: [user, gespeichert] }
  } catch (e) {
    console.error("[assistent] frage", e)
    return { ok: true, nachrichten: [user] }
  }
}

/** Schwebendes Assistenten-Fenster: nur die Zahl offener Fragen (für den Punkt am Knopf). */
export async function dockStand(): Promise<{ fragen: number }> {
  await pruefe()
  const { offeneFragen } = await import("@/lib/assistent/fragen")
  return { fragen: (await offeneFragen(20).catch(() => [])).length }
}

/** Beim Öffnen des Fensters: Verlauf, Fragen, Rest des Tageslimits. */
export async function dockLaden(): Promise<{ verlauf: Nachricht[]; fragen: import("@/lib/assistent/fragen").EminFrage[]; rest: number }> {
  await pruefe()
  const { offeneFragen } = await import("@/lib/assistent/fragen")
  const [verlauf, fragen, heute] = await Promise.all([ladeVerlauf(30), offeneFragen().catch(() => []), fragenHeute()])
  return { verlauf, fragen, rest: TAGESLIMIT - heute }
}

export async function frageSpaeter(id: string): Promise<void> {
  await pruefe()
  const { verschiebeFrage } = await import("@/lib/assistent/fragen")
  await verschiebeFrage(String(id).slice(0, 80), 1)
  revalidatePath("/admin/assistent")
}

export async function agentStarten(form: FormData): Promise<void> {
  await pruefe()
  const key = form.get("agent")
  if (typeof key !== "string" || !AGENT_KEYS.includes(key as AgentKey)) return
  await fuehreAgentAus(key as AgentKey, { trotzPause: true })
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

export async function beschlussAbhaken(form: FormData): Promise<void> {
  await pruefe()
  const id = form.get("id")
  const nr = Number(form.get("nr"))
  if (typeof id !== "string") return
  await setzeBeschlussErledigt(id.slice(0, 80), nr, form.get("erledigt") === "1")
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
async function merkeAbsageGrund(id: string, form: FormData): Promise<{ grund: string; grundText: string }> {
  const grund = String(form.get("grund") ?? "").trim().slice(0, 80)
  const grundText = String(form.get("grund_text") ?? "").replace(/\s+/g, " ").trim().slice(0, 600)
  if (grund || grundText)
    await ergaenzeExtra(id, { grund: grund || undefined, grundText: grundText || undefined }).catch((e) =>
      console.error("[assistent] grund", e instanceof Error ? e.message : e),
    )
  return { grund, grundText }
}

/** Katman 5: jede Entscheidung ins Firmengedächtnis – ein Fehler dort hält keine Freigabe auf. */
/** Katman 6: Antragsskizzen schreiben mit den Regeln des Kapital-Agenten. */
async function mitKapital<T>(fn: () => Promise<T>): Promise<T> {
  const { mitAgent } = await import("@/lib/lernen/kontext")
  return mitAgent("kapital", fn)
}

async function lerne(f: Freigabe, e: Parameters<typeof notiereEntscheidung>[1]): Promise<void> {
  await notiereEntscheidung(f, e).catch((x) => console.error("[lernen] notieren", x instanceof Error ? x.message : x))
}

/* Eigene Aktion: hängt nicht davon ab, ob der Browser den gedrückten Knopf mitschickt – sendet nie. */
export async function freigabeVerwerfen(form: FormData): Promise<void> {
  await pruefe()
  const id = form.get("id")
  if (typeof id !== "string") return
  const f = await ladeFreigabe(id.slice(0, 80))
  await setzeFreigabe(id.slice(0, 80), "verworfen")
  const g = await merkeAbsageGrund(id.slice(0, 80), form)
  if (f?.status === "offen") await lerne(f, { entscheidung: "verworfen", ...g })
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
  if (status === "verworfen") await lerne(f, { entscheidung: "verworfen", ...(await merkeAbsageGrund(fid, form)) })

  const titel = form.get("titel")
  const inhalt = form.get("inhalt")
  /* Katman 6: Freigabe zählt erst als Emins Entscheidung, wenn sie auch ausgeführt wurde (Mail raus, Brief raus …) – nicht schon vor einem gescheiterten Versand. */
  let freigabeLernen: Parameters<typeof notiereEntscheidung>[1] | null = null
  if (status === "freigegeben" && typeof titel === "string" && typeof inhalt === "string" && inhalt.trim()) {
    await aendereInhalt(fid, titel.trim() || f.titel, inhalt.trim())
    /* Geändert vor der Freigabe = der Agent lag daneben. Zählt in seine Note (Qualitätssicherung). */
    const umgeschrieben = inhalt.trim() !== f.inhalt.trim() || Boolean(titel.trim() && titel.trim() !== f.titel.trim())
    if (umgeschrieben) await ergaenzeExtra(fid, { bearbeitet: true })
    /* Katman 5: Entwurf und Emins Fassung nebeneinander – daraus lernt der Agent Ton und Inhalt. */
    freigabeLernen = umgeschrieben ? { entscheidung: "bearbeitet", endfassung: inhalt.trim() } : { entscheidung: "freigegeben" }
  } else if (status === "freigegeben") {
    freigabeLernen = { entscheidung: "freigegeben" }
  }

  /* 24.10.2026: Karte „Artikel veröffentlichen“ – Freigeben stellt ihn auf creadig.de, Verwerfen legt das Thema ab. */
  if (f.extra.artikelSlug) {
    if (status === "freigegeben") {
      const { veroeffentlicheArtikel } = await import("@/lib/artikel/veroeffentlichen")
      const r = await veroeffentlicheArtikel(f.extra.artikelSlug)
      if (!r.ok) {
        await ergaenzeExtra(fid, { fehler: "Artikel ist kein Entwurf mehr oder nicht auffindbar." })
        revalidatePath("/admin/assistent")
        return
      }
    } else {
      const { setzeZustand } = await import("@/lib/artikel/store")
      await setzeZustand(f.extra.artikelSlug, "verworfen")
    }
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
    /* Katman 4: Karte „Angebot senden“ – festschreiben und als Angebots-Mail mit Kundenlink versenden. */
    if (f.extra.dokumentId) {
      const { sendeAngebotAusFreigabe } = await import("@/lib/ausfuehrung/angebot-hat")
      const a = await sendeAngebotAusFreigabe(f.extra.dokumentId, istMail(an) ? an : null, f.extra.dokumentMail ?? "versand")
      if (!a.ok) {
        await ergaenzeExtra(fid, { fehler: a.grund })
        revalidatePath("/admin/assistent")
        return
      }
      await ergaenzeExtra(fid, { gesendetAt: new Date().toISOString(), mailId: a.nummer, fehler: undefined })
      revalidatePath("/finanz", "layout")
    } else {
    const r = forderung ? await sendeForderung(forderung) : await sendeFreigabeMail(f, an, betreff, text)
    if (!r.ok) {
      await ergaenzeExtra(fid, { fehler: r.grund })
      revalidatePath("/admin/assistent")
      return
    }
    await ergaenzeExtra(fid, { gesendetAt: new Date().toISOString(), mailId: r.id, fehler: undefined })
    }
    await protokolliereFaden(await assistentDb().catch(() => null), "assistent", "mailstudio", betreff)
  }

  if (status === "freigegeben" && f.art === "brief") {
    const vorher = f.extra.anschrift
    const feld = (k: string, alt = "") => String(form.get(k) ?? alt).trim()
    const anschrift = {
      firma: feld("firma", vorher?.firma),
      zusatz: feld("zusatz", vorher?.zusatz) || undefined,
      strasse: feld("strasse", vorher?.strasse),
      plz: feld("plz", vorher?.plz),
      ort: feld("ort", vorher?.ort),
      land: feld("land", vorher?.land) || undefined,
    }
    const betreff = String(form.get("betreff") ?? f.betreff ?? "").trim() || f.titel
    const text = typeof inhalt === "string" && inhalt.trim() ? inhalt.trim() : f.inhalt
    if (!anschrift.firma || !anschrift.strasse || !anschrift.plz || !anschrift.ort) {
      await ergaenzeExtra(fid, { anschrift, fehler: "Anschrift unvollständig – Firma, Straße, PLZ und Ort sind Pflicht." })
      revalidatePath("/admin/assistent")
      return
    }
    const { erzeugeBriefPdf } = await import("@/lib/brief/pdf")
    const { sendeBrief } = await import("@/lib/brief/letterxpress")
    const pdf = await erzeugeBriefPdf({ an: anschrift, betreff, text })
    const ausland = Boolean(anschrift.land && !/^(de|deutschland|germany)$/i.test(anschrift.land))
    const r = await sendeBrief(pdf, { dateiname: `brief-${fid}.pdf`, ausland, freigabe: { id: fid, durch: rolle } })
    if (!r.ok) {
      await ergaenzeExtra(fid, { anschrift, fehler: r.grund })
      revalidatePath("/admin/assistent")
      return
    }
    await ergaenzeExtra(fid, { anschrift, briefId: r.id, briefPreis: r.preisEur, briefTest: r.test, gesendetAt: new Date().toISOString(), fehler: undefined })
    const db = await assistentDb().catch(() => null)
    if (db && f.extra.orgId)
      await db(`UPDATE organisations SET note = concat_ws(E'\n\n', nullif(note,''), $2::text), updated_at = now() WHERE id = $1`, [
        f.extra.orgId,
        `Brief per Post ${r.test ? "(Testmodus) " : ""}am ${new Date().toLocaleDateString("de-DE", { timeZone: "Europe/Berlin" })}: ${betreff}`,
      ]).catch(() => null)
    await protokolliereFaden(db, "assistent", "vertrieb", `Brief: ${betreff}`)
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

  /* Katman 3: nur die angehakten Agenten pausieren; nichts angehakt = nichts tun, Karte bleibt offen. */
  if (status === "freigegeben" && f.art === "steuerung") {
    const gewaehlt = new Set(form.getAll("agent").map(String))
    const liste = (f.extra.steuerung ?? []).filter((s) => gewaehlt.has(s.agent))
    if (!liste.length) {
      await ergaenzeExtra(fid, { fehler: "Kein Agent angehakt – zum Behalten aller bitte „Alle behalten“." })
      revalidatePath("/admin/assistent")
      return
    }
    const { pausiere } = await import("@/lib/ergebnis/steuerung")
    for (const s of liste) await pausiere(s.agent, { grund: s.grund, uebernimmt: s.uebernimmt, durch: rolle })
    await ergaenzeExtra(fid, { fehler: undefined, steuerung: liste })
    revalidatePath("/admin/leistung")
  }

  if (status === "freigegeben" && f.art === "kapital") {
    await ergaenzeExtra(fid, { antrag: { stufe: "pruefen", seit: new Date().toISOString() } })
    after(() => mitKapital(() => schreibeAntragsskizze(fid)).catch((e) => console.error("[kapital] skizze", e)))
  }

  /* Ohne Auswahl gilt das geplante Ziel – nie stillschweigend das Privatprofil. */
  const zielWert = form.get("ziel") ?? (f.art === "linkedin" ? (f.extra.ziel ?? "firma") : null)
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
  if (freigabeLernen) await lerne(f, freigabeLernen)
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
  if (!f.extra.antrag?.skizze) after(() => mitKapital(() => schreibeAntragsskizze(id)).catch(() => undefined))
  revalidatePath("/admin/assistent")
}

/** Katman 5: Regel im Firmengedächtnis streichen – kommt auch durch das Destillieren nicht zurück. */
export async function lektionStreichen(form: FormData): Promise<void> {
  await pruefe()
  const id = form.get("id")
  if (typeof id !== "string" || !id.startsWith("lek-")) return
  const { streicheLektion } = await import("@/lib/lernen/store")
  await streicheLektion(id.slice(0, 80))
  revalidatePath("/admin/assistent")
}

/** Katman 5: eigene Regel festhalten – gilt ab dem nächsten Entwurf des Agenten (oder aller). */
export async function lektionAnlegen(form: FormData): Promise<void> {
  await pruefe()
  const regel = String(form.get("regel") ?? "").trim()
  const geltung = String(form.get("geltung") ?? "*").trim().slice(0, 40) || "*"
  const art = String(form.get("art") ?? "gebot")
  if (regel.length < 6 || (geltung !== "*" && !(AGENT_KEYS as readonly string[]).includes(geltung) && geltung !== "assistent" && geltung !== "motor")) return
  const { legeLektionAn } = await import("@/lib/lernen/store")
  await legeLektionAn({ geltung, regel, art: art === "verbot" || art === "stil" ? art : "gebot", quelle: "emin" })
  revalidatePath("/admin/assistent")
}

/** Katman 4: Aufgabe im Lieferplan abhaken (oder wieder öffnen). */
export async function lieferAufgabeSetzen(form: FormData): Promise<void> {
  await pruefe()
  const id = form.get("id")
  if (typeof id !== "string" || !id.startsWith("pa-")) return
  const { setzeAufgabeErledigt } = await import("@/lib/ausfuehrung/lieferung-hat")
  await setzeAufgabeErledigt(id, form.get("erledigt") === "1")
  revalidatePath("/admin/assistent")
}

/** Katman 4: Code-Karte von Hand an den PR-Workflow geben (auch erneut nach einem Fehlschlag). */
export async function codePrStarten(form: FormData): Promise<void> {
  await pruefe()
  const id = form.get("id")
  if (typeof id !== "string") return
  const { starteCodeAuftrag } = await import("@/lib/ausfuehrung/code-hat")
  const r = await starteCodeAuftrag(id, true)
  if (!r.ok) {
    const f = await ladeFreigabe(id)
    if (f?.extra.pr) await ergaenzeExtra(id, { pr: { ...f.extra.pr, grund: r.grund } })
    else console.warn("[code-hat] nicht gestartet", id, r.grund)
  }
  revalidatePath("/admin/assistent")
}
