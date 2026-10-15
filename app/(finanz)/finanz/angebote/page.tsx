import { FinanzShell, OhneSpeicher } from "@/components/finanz/shell"
import { AuftragsListe, aufgabenFuer } from "@/components/finanz/auftraege/liste"
import { finanzBasis } from "@/lib/finanz/basis"
import { finanzDb } from "@/lib/finanz/store"
import { formatEuro, heuteBerlin } from "@/lib/finanz/auftraege/rechnen"
import { ladeDokumente } from "@/lib/finanz/auftraege/store"

export const dynamic = "force-dynamic"
export const metadata = { title: "Angebote" }

export default async function Angebote() {
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="angebote" titel="Angebote"><OhneSpeicher /></FinanzShell>

  const [docs, basis] = await Promise.all([ladeDokumente(db, ["angebot"]), finanzBasis()])
  const heute = heuteBerlin()
  const jahr = heute.slice(0, 4)
  const sichtbar = docs.filter((d) => d.status !== "ersetzt" || d.version === 0)
  const offen = sichtbar.filter((d) => d.status === "versendet" && (!d.gueltigBis || d.gueltigBis >= heute))
  const imJahr = sichtbar.filter((d) => d.datum.startsWith(jahr) && d.status !== "entwurf")
  const angenommen = imJahr.filter((d) => d.status === "angenommen")
  const entschieden = imJahr.filter((d) => ["angenommen", "abgelehnt"].includes(d.status))
  const summe = (l: typeof docs) => l.reduce((s, d) => s + (d.summen?.nettoCent ?? 0), 0)

  return (
    <FinanzShell aktiv="angebote" titel="Angebote" unterzeile="Angebot schreiben, per Mail senden, online annehmen lassen – und daraus mit einem Klick die Rechnung.">
      <AuftragsListe
        art="angebot"
        basis={basis}
        docs={sichtbar}
        aufgaben={aufgabenFuer(sichtbar)}
        kennzahlen={[
          { label: "Offen", wert: formatEuro(summe(offen)), zusatz: `${offen.length} Angebote · netto` },
          { label: `Angenommen ${jahr}`, wert: formatEuro(summe(angenommen)), zusatz: `${angenommen.length} Aufträge · netto` },
          { label: "Annahmequote", wert: entschieden.length ? `${Math.round((angenommen.length / entschieden.length) * 100)} %` : "—", zusatz: `${entschieden.length} entschieden` },
          { label: "Geöffnet", wert: offen.length ? `${offen.filter((d) => d.geoeffnetAt).length}/${offen.length}` : "—", zusatz: "der offenen Angebote" },
        ]}
      />
    </FinanzShell>
  )
}
