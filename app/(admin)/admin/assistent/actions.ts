"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { ADMIN_COOKIE } from "@/lib/admin-session"
import { pruefeZugang } from "@/lib/admin-widerruf"
import { antworte } from "@/lib/assistent/agent"
import { AGENT_KEYS, fuehreAgentAus, type AgentKey } from "@/lib/assistent/truppe"
import {
  fragenHeute,
  ladeVerlauf,
  setzeFreigabe,
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

export async function freigabeEntscheiden(form: FormData): Promise<void> {
  await pruefe()
  const id = form.get("id")
  const status = form.get("status")
  if (typeof id !== "string" || (status !== "freigegeben" && status !== "verworfen")) return
  await setzeFreigabe(id.slice(0, 80), status)
  revalidatePath("/admin/assistent")
}
