import type { NummernkreisLuecke } from "@/lib/finanz/auftraege/store"

/**
 * Sollte nie sichtbar werden — die Trigger aus
 * scripts/migrations/030-gobd-festschreibung.sql verhindern genau das, was
 * hier gemeldet wuerde. Diese Anzeige ist die zweite, lesende Sicherung:
 * sichtbar statt still, falls doch etwas an fin_dokumente vorbeigeschrieben hat.
 */
export function NummernkreisWarnung({ luecken }: { luecken: NummernkreisLuecke[] }) {
  if (luecken.length === 0) return null
  return (
    <div role="alert" className="bg-destructive/10 text-destructive flex flex-col gap-2 rounded-[2rem] p-5 text-sm leading-relaxed">
      <p className="font-semibold">Nummernkreis nicht lückenlos — das darf laut GoBD nicht sein.</p>
      {luecken.map((l) => (
        <p key={`${l.praefix}-${l.jahr}`}>
          {l.praefix}-{l.jahr}: höchste vergebene Nummer {l.hoechsteVergeben}
          {l.fehlend.length > 0 ? `, fehlend: ${l.fehlend.map((n) => String(n).padStart(4, "0")).join(", ")}` : ""}
          {l.zaehlerstand > l.hoechsteVergeben
            ? `, Zähler steht bereits bei ${l.zaehlerstand} — eine Nummer wurde gezogen, aber nie auf einem Dokument festgeschrieben`
            : ""}
        </p>
      ))}
      <p>Bitte den Steuerberater informieren, bevor weitere Rechnungen in diesem Zeitraum gestellt werden.</p>
    </div>
  )
}
