"use client"

import { useActionState, useState } from "react"
import { Check, MessageSquareText, X } from "lucide-react"

import { kundeAntwortet, type KundenErgebnis } from "@/app/(finanz)/dokument/[token]/actions"

type Optional = { index: number; titel: string; betrag: string }
type Wahl = "angenommen" | "aenderung" | "abgelehnt"

const TEXT = {
  de: {
    frage: "Wie möchten Sie fortfahren?",
    annehmen: "Annehmen",
    aendern: "Änderung wünschen",
    ablehnen: "Ablehnen",
    optional: "Optionale Leistungen – wählen Sie, was dazugehören soll",
    name: "Ihr vollständiger Name",
    bestaetigen: "Ich nehme dieses Angebot verbindlich an.",
    aenderungLabel: "Was sollen wir anpassen?",
    grund: "Möchten Sie uns einen Grund nennen? (optional)",
    senden: { angenommen: "Verbindlich annehmen", aenderung: "Änderungswunsch senden", abgelehnt: "Angebot ablehnen" },
    sendet: "Wird gesendet …",
    danke: "Vielen Dank – Ihre Antwort ist bei uns angekommen.",
  },
  en: {
    frage: "How would you like to proceed?",
    annehmen: "Accept",
    aendern: "Request a change",
    ablehnen: "Decline",
    optional: "Optional items – choose what to include",
    name: "Your full name",
    bestaetigen: "I accept this quotation as binding.",
    aenderungLabel: "What should we adjust?",
    grund: "Would you like to tell us why? (optional)",
    senden: { angenommen: "Accept as binding", aenderung: "Send change request", abgelehnt: "Decline quotation" },
    sendet: "Sending …",
    danke: "Thank you – we have received your response.",
  },
}

export function KundenAntwort({ token, sprache, optionale }: { token: string; sprache: "de" | "en"; optionale: Optional[] }) {
  const t = TEXT[sprache]
  const [wahl, setWahl] = useState<Wahl>("angenommen")
  const [ergebnis, aktion, laeuft] = useActionState<KundenErgebnis, FormData>(kundeAntwortet.bind(null, token), null)

  if (ergebnis?.ok) {
    return (
      <div role="status" className="bg-secondary text-secondary-foreground flex items-center gap-3 rounded-3xl px-6 py-5 font-medium">
        <Check className="size-5" aria-hidden />
        {t.danke}
      </div>
    )
  }

  const optionen: { key: Wahl; label: string; Icon: typeof Check }[] = [
    { key: "angenommen", label: t.annehmen, Icon: Check },
    { key: "aenderung", label: t.aendern, Icon: MessageSquareText },
    { key: "abgelehnt", label: t.ablehnen, Icon: X },
  ]

  return (
    <form action={aktion} className="bg-card flex flex-col gap-6 rounded-3xl p-6 shadow-sm md:p-8">
      <input type="hidden" name="antwort" value={wahl} />
      <h2 className="font-display text-xl font-semibold text-balance">{t.frage}</h2>

      <div role="radiogroup" aria-label={t.frage} className="flex flex-wrap gap-2">
        {optionen.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={wahl === key}
            onClick={() => setWahl(key)}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
              wahl === key ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-secondary"
            }`}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      {wahl === "angenommen" && (
        <div className="flex flex-col gap-5">
          {optionale.length > 0 && (
            <fieldset className="flex flex-col gap-2">
              <legend className="text-muted-foreground mb-2 text-sm">{t.optional}</legend>
              {optionale.map((o) => (
                <label key={o.index} className="bg-background flex cursor-pointer items-center justify-between gap-4 rounded-2xl px-4 py-3 text-sm">
                  <span className="flex items-center gap-3">
                    <input type="checkbox" name="optional" value={o.index} className="accent-primary size-4" />
                    {o.titel}
                  </span>
                  <span className="font-mono text-muted-foreground">{o.betrag}</span>
                </label>
              ))}
            </fieldset>
          )}
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">{t.name}</span>
            <input name="name" required minLength={3} autoComplete="name" className="bg-background focus-visible:ring-primary rounded-2xl px-4 py-3 text-base outline-none focus-visible:ring-2" />
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
            <input type="checkbox" name="bestaetigt" required className="accent-primary mt-1 size-4" />
            {t.bestaetigen}
          </label>
        </div>
      )}

      {wahl !== "angenommen" && (
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-muted-foreground">{wahl === "aenderung" ? t.aenderungLabel : t.grund}</span>
          <textarea
            name="text"
            rows={4}
            required={wahl === "aenderung"}
            maxLength={2000}
            className="bg-background focus-visible:ring-primary rounded-2xl px-4 py-3 text-base leading-relaxed outline-none focus-visible:ring-2"
          />
        </label>
      )}

      {ergebnis && !ergebnis.ok && (
        <p role="alert" className="text-destructive text-sm">
          {ergebnis.fehler}
        </p>
      )}

      <button
        type="submit"
        disabled={laeuft}
        className={`self-start rounded-full px-6 py-3 text-sm font-semibold transition-opacity disabled:opacity-60 ${
          wahl === "abgelehnt" ? "bg-background text-foreground" : "bg-primary text-primary-foreground"
        }`}
      >
        {laeuft ? t.sendet : t.senden[wahl]}
      </button>
    </form>
  )
}
