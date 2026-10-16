import { FinanzShell, OhneSpeicher } from "@/components/finanz/shell"
import { AuftragsListe, aufgabenFuer } from "@/components/finanz/auftraege/liste"
import { finanzBasis } from "@/lib/finanz/basis"
import { finanzDb } from "@/lib/finanz/store"
import { formatEuro, heuteBerlin } from "@/lib/finanz/auftraege/rechnen"
import { bezahltCentBulk, ladeDokumente } from "@/lib/finanz/auftraege/store"

export const dynamic = "force-dynamic"
export const metadata = { title: "Rechnungen" }

export default async function Rechnungen() {
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="rechnungen" titel="Rechnungen"><OhneSpeicher /></FinanzShell>

  const [docs, basis] = await Promise.all([ladeDokumente(db, ["rechnung", "storno"]), finanzBasis()])
  const heute = heuteBerlin()
  const jahr = heute.slice(0, 4)
  const offen = docs.filter((d) => d.art === "rechnung" && (d.status === "versendet" || d.status === "teilbezahlt"))
  const ueber = offen.filter((d) => d.faelligAm && d.faelligAm < heute)
  const bezahlt = docs.filter((d) => d.status === "bezahlt" && d.bezahltAm?.startsWith(jahr))
  const bezahltSummen = await bezahltCentBulk(db, offen.map((d) => d.id))
  const brutto = (l: typeof docs) => l.reduce((s, d) => s + (d.summen?.bruttoCent ?? 0), 0)
  /** Bei `teilbezahlt` zählt nur der noch offene Rest, nicht der volle Rechnungsbetrag. */
  const offenerRest = (l: typeof docs) => l.reduce((s, d) => s + Math.max((d.summen?.bruttoCent ?? 0) - (bezahltSummen[d.id] ?? 0), 0), 0)
  const dauer = bezahlt.filter((d) => d.versendetAt && d.bezahltAm).map((d) => (Date.parse(String(d.bezahltAm)) - Date.parse(String(d.versendetAt))) / 86_400_000)

  return (
    <FinanzShell aktiv="rechnungen" titel="Rechnungen" unterzeile="Jede Rechnung steht sofort im Geldfluss und wird beim Zahlungseingang gebucht. Erinnerungen und Mahnungen schlägt das System selbst vor.">
      <AuftragsListe
        art="rechnung"
        basis={basis}
        docs={docs}
        aufgaben={aufgabenFuer(docs)}
        kennzahlen={[
          { label: "Offen", wert: formatEuro(offenerRest(offen)), zusatz: `${offen.length} Rechnungen · offener Rest` },
          { label: "Überfällig", wert: formatEuro(offenerRest(ueber)), zusatz: `${ueber.length} Rechnungen` },
          { label: `Bezahlt ${jahr}`, wert: formatEuro(brutto(bezahlt)), zusatz: `${bezahlt.length} Rechnungen` },
          { label: "Zahlungsdauer", wert: dauer.length ? `${Math.round(dauer.reduce((a, b) => a + b, 0) / dauer.length)} Tage` : "—", zusatz: "im Schnitt" },
        ]}
      />
    </FinanzShell>
  )
}
