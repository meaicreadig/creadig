"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { antworte } from "@/lib/assistent/agent"
import { AGENT_KEYS, fuehreAgentAus, type AgentKey } from "@/lib/assistent/truppe"
import { veroeffentliche } from "@/lib/assistent/linkedin"
import { erkenneLoeschwunsch, loescheFirmen } from "@/lib/assistent/loeschen"
import { istMail, markiereAntwort, sendeFreigabeMail } from "@/lib/assistent/versand"
import {
  aendereInhalt,
  beantworteRat,
  ergaenzeExtra,
  ladeFreigabe,
  ladeLinkedin,
  fragenHeute,
  ladeVerlauf,
  setzeFreigabe,
  setzeMailKopf,
  speichereNachricht,
  TAGESLIMIT,
  type Nachricht,
} from "@/lib/assistent/store"
import { darfBetreten } from "@/lib/rollen"

async function pruefe() {
  const zugang = await pruefeZugang((await cookies()).get(ADMIN_COOKIE)?.value, { aendernd: true })
  if (zugang.verdict !== "ok" || !zugang.rolle || !darfBetreten(zugang.rolle, "/admin/assistent")) {
    throw new Error("Nicht berechtigt")
  }
}

export type FrageErgebnis = { ok: true; antwort: Nachricht } | { ok: false; fehler: string }

export async function frage(eingabe: string): Promise<FrageErgebnis> {
  await pruefe()
  const text = eingabe.trim().slice(0, 4000)
  if (!text) return { ok: false, fehler: "Leere Nachricht" }
  if ((await fragenHeute()) >= TAGESLIMIT) {
    return { ok: false, fehler: `Tageslimit von ${TAGESLIMIT} Fragen erreicht – morgen geht es weiter.` }
  }
  await speichereNachricht("user", text)
  try {
    const verlauf = await ladeVerlauf(16)
    const antwort = await antworte(verlauf)
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
  await beantworteRat(id.slice(0, 80), antwort.trim().slice(0, 2000))
  await erkenneLoeschwunsch(antwort, id.slice(0, 80)).catch((e) => console.error("[loeschen] erkennen", e))
  revalidatePath("/admin/assistent")
}

export async function antwortErhalten(form: FormData): Promise<void> {
  await pruefe()
  const id = form.get("id")
  if (typeof id !== "string") return
  await markiereAntwort(id.slice(0, 80))
  revalidatePath("/admin/assistent")
}

export async function freigabeEntscheiden(form: FormData): Promise<void> {
  await pruefe()
  const id = form.get("id")
  const status = form.get("status")
  if (typeof id !== "string" || (status !== "freigegeben" && status !== "verworfen")) return
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
    const r = await sendeFreigabeMail(f, an, betreff, text)
    if (!r.ok) {
      await ergaenzeExtra(fid, { fehler: r.grund })
      revalidatePath("/admin/assistent")
      return
    }
    await ergaenzeExtra(fid, { gesendetAt: new Date().toISOString(), mailId: r.id, fehler: undefined })
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

  const kanal = form.get("ziel") === "firma" ? "firma" : "inhaber"
  if (status === "freigegeben" && f.art === "linkedin" && (await ladeLinkedin(kanal))) {
    const text = typeof inhalt === "string" && inhalt.trim() ? inhalt.trim() : f.inhalt
    try {
      const postUrn = await veroeffentliche({ text, bildPfad: f.bildPfad, alt: f.extra.alt, kanal })
      await ergaenzeExtra(fid, { postUrn, fehler: undefined })
    } catch (e) {
      console.error("[linkedin] post", e)
      await ergaenzeExtra(fid, { fehler: e instanceof Error ? e.message.slice(0, 200) : "Veröffentlichung fehlgeschlagen" })
      revalidatePath("/admin/assistent")
      return
    }
  }
  await setzeFreigabe(fid, status)
  revalidatePath("/admin/assistent")
}
