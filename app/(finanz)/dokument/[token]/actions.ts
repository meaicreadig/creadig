"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

import { finanzDb } from "@/lib/finanz/store"
import { beantworteAngebot, ladeDokument, ladeDokumentPerToken } from "@/lib/finanz/auftraege/store"
import { meldeInhaber, sendeDokumentMail } from "@/lib/finanz/auftraege/mail"
import type { Sprache } from "@/lib/finanz/auftraege/rechnen"
import { callerAdresse, pruefeRateLimit } from "@/lib/finanz/rate-limit"

const ZU_VIEL_TEXT: Record<Sprache, string> = {
  de: "Zu viele Versuche. Bitte in einer Stunde erneut versuchen oder uns direkt antworten.",
  en: "Too many attempts. Please try again in an hour, or reply to us directly.",
  tr: "Çok fazla deneme. Lütfen bir saat sonra tekrar deneyin veya doğrudan bize yazın.",
}

export type KundenErgebnis = { ok: true } | { ok: false; fehler: string } | null

/** Öffentlich über den Kundenlink. Token = Berechtigung; Status-Prüfung im Store. */
export async function kundeAntwortet(token: string, _prev: KundenErgebnis, form: FormData): Promise<KundenErgebnis> {
  const db = await finanzDb().catch(() => null)
  if (!db) return { ok: false, fehler: "Gerade nicht erreichbar. Bitte später erneut versuchen." }
  const d = await ladeDokumentPerToken(db, token)
  if (!d || d.art !== "angebot") return { ok: false, fehler: "Dokument nicht gefunden." }

  const ip = callerAdresse(await headers())
  const erlaubt = await pruefeRateLimit(db, `dokument:${token}:${ip}`, 10, 60)
  if (!erlaubt) return { ok: false, fehler: ZU_VIEL_TEXT[d.sprache] }

  const antwortRoh = form.get("antwort")
  const antwort = antwortRoh === "abgelehnt" ? "abgelehnt" : antwortRoh === "aenderung" ? "aenderung" : "angenommen"
  const name = String(form.get("name") ?? "").trim().slice(0, 120)
  const text = String(form.get("text") ?? "").trim().slice(0, 2000)
  const FEHLER_TEXT: Record<Sprache, { name: string; bestaetigt: string; aenderung: string; nichtMehr: string }> = {
    de: {
      name: "Bitte geben Sie Ihren vollständigen Namen ein.",
      bestaetigt: "Bitte bestätigen Sie die verbindliche Annahme.",
      aenderung: "Bitte beschreiben Sie kurz Ihren Änderungswunsch.",
      nichtMehr: "Dieses Angebot kann nicht mehr beantwortet werden.",
    },
    en: {
      name: "Please enter your full name.",
      bestaetigt: "Please confirm the acceptance.",
      aenderung: "Please describe the requested change.",
      nichtMehr: "This quotation can no longer be answered.",
    },
    tr: {
      name: "Lütfen tam adınızı girin.",
      bestaetigt: "Lütfen bağlayıcı kabulü onaylayın.",
      aenderung: "Lütfen değişiklik talebinizi kısaca açıklayın.",
      nichtMehr: "Bu teklif artık yanıtlanamaz.",
    },
  }
  const f = FEHLER_TEXT[d.sprache]

  if (antwort === "angenommen") {
    if (name.length < 3) return { ok: false, fehler: f.name }
    if (form.get("bestaetigt") !== "on") return { ok: false, fehler: f.bestaetigt }
  }
  if (antwort === "aenderung" && text.length < 5) return { ok: false, fehler: f.aenderung }

  const gewaehlt = form
    .getAll("optional")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n >= 0 && n < d.positionen.length && d.positionen[n].optional)

  const ua = (await headers()).get("user-agent") ?? ""
  const ok = await beantworteAngebot(db, d.id, { antwort, name, text, gewaehlt, quelle: "kunde", client: ua })
  if (!ok) return { ok: false, fehler: f.nichtMehr }

  const neu = await ladeDokument(db, d.id)
  if (neu) {
    if (antwort === "angenommen") await sendeDokumentMail(neu, "bestaetigung")
    await meldeInhaber(neu, antwort === "angenommen" ? "Angebot angenommen" : antwort === "aenderung" ? "Änderung gewünscht" : "Angebot abgelehnt")
  }
  revalidatePath(`/dokument/${token}`)
  revalidatePath("/finanz", "layout")
  return { ok: true }
}
