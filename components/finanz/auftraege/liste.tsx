import Link from "next/link"
import { Plus } from "lucide-react"

import { neuerEntwurf } from "@/app/(finanz)/finanz/auftraege/actions"
import { StatusPille } from "@/components/finanz/auftraege/status-pille"
import { NachfassKnopf } from "@/components/finanz/auftraege/knoepfe"
import { formatDatum, formatEuro, heuteBerlin, naechsteMahnstufe, tageZwischen } from "@/lib/finanz/auftraege/rechnen"
import { anzeigeStatus, type Dokument } from "@/lib/finanz/auftraege/store"

export type Kennzahl = { label: string; wert: string; zusatz?: string }
export type Aufgabe = { dok: Dokument; text: string; knopf?: string }

/** Was heute zu tun ist — gleiche Regeln wie die Mail-Aktionen. */
export function aufgabenFuer(docs: Dokument[]): Aufgabe[] {
  const heute = heuteBerlin()
  const liste: Aufgabe[] = []
  for (const d of docs) {
    if (d.status === "aenderung") liste.push({ dok: d, text: "wünscht eine Änderung – neue Version erstellen" })
    if (d.art === "angebot" && d.status === "versendet") {
      const seit = d.versendetAt ? tageZwischen(d.versendetAt.slice(0, 10), heute) : 0
      const nachgefasst = Boolean(d.nachgefasstAt)
      if (d.gueltigBis && d.gueltigBis < heute) liste.push({ dok: d, text: "ist abgelaufen – neue Version anbieten?" })
      else if (d.gueltigBis && tageZwischen(heute, d.gueltigBis) <= 3) liste.push({ dok: d, text: `läuft am ${formatDatum(d.gueltigBis)} ab`, knopf: nachgefasst ? undefined : "Nachfrage senden" })
      else if (!d.geoeffnetAt && seit >= 3 && !nachgefasst) liste.push({ dok: d, text: `seit ${seit} Tagen ungeöffnet`, knopf: "Nachfrage senden" })
      else if (d.geoeffnetAt && seit >= 5 && !nachgefasst) liste.push({ dok: d, text: "geöffnet, aber noch keine Antwort – kurz anrufen?", knopf: "Nachfrage senden" })
    }
    if (d.art === "rechnung" && (d.status === "versendet" || d.status === "teilbezahlt") && d.faelligAm) {
      const tage = tageZwischen(d.faelligAm, heute)
      const n = naechsteMahnstufe(tage, d.mahnstufe)
      if (n) liste.push({ dok: d, text: `seit ${tage} Tagen überfällig`, knopf: ["", "Zahlungserinnerung", "1. Mahnung", "2. Mahnung"][n] })
      else if (tage > 0) liste.push({ dok: d, text: `seit ${tage} Tagen überfällig – nächste Stufe folgt automatisch vorgeschlagen` })
    }
  }
  return liste
}

export function AuftragsListe({
  art,
  basis,
  kennzahlen,
  docs,
  aufgaben,
}: {
  art: "angebot" | "rechnung"
  basis: string
  kennzahlen: Kennzahl[]
  docs: Dokument[]
  aufgaben: Aufgabe[]
}) {
  const leer = docs.length === 0
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <dl className="grid flex-1 grid-cols-2 gap-3 md:grid-cols-4">
          {kennzahlen.map((k) => (
            <div key={k.label} className="bg-card flex flex-col gap-1 rounded-3xl p-5">
              <dt className="text-muted-foreground text-xs font-medium">{k.label}</dt>
              <dd className="text-primary font-sans text-2xl font-semibold tabular-nums">{k.wert}</dd>
              {k.zusatz && <dd className="text-muted-foreground text-xs">{k.zusatz}</dd>}
            </div>
          ))}
        </dl>
      </div>

      <form action={neuerEntwurf}>
        <input type="hidden" name="art" value={art} />
        <button className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90">
          <Plus aria-hidden className="size-4" />
          {art === "angebot" ? "Neues Angebot" : "Neue Rechnung"}
        </button>
      </form>

      {aufgaben.length > 0 && (
        <section aria-labelledby="l-heute" className="bg-card flex flex-col gap-3 rounded-[2rem] p-6">
          <h2 id="l-heute" className="text-lg font-semibold">Heute dranbleiben</h2>
          <ul className="flex flex-col gap-2">
            {aufgaben.map((a, i) => (
              <li key={`${a.dok.id}-${i}`} className="bg-background flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm">
                <Link href={`${basis}/vorgang/${a.dok.id}`} className="hover:text-primary">
                  <span className="font-medium">{a.dok.kunde.firma || a.dok.kunde.name}</span>
                  <span className="text-muted-foreground"> · {a.dok.nummer} {a.text}</span>
                </Link>
                {a.knopf && <NachfassKnopf id={a.dok.id} label={a.knopf} />}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="l-alle" className="bg-card flex flex-col gap-3 rounded-[2rem] p-6">
        <h2 id="l-alle" className="text-lg font-semibold">{art === "angebot" ? "Alle Angebote" : "Alle Rechnungen"}</h2>
        {leer ? (
          <p className="text-muted-foreground bg-background rounded-2xl p-5 text-sm leading-relaxed">
            {art === "angebot"
              ? "Noch kein Angebot. Lege zuerst deine Leistungen im Katalog an – dann ist jedes Angebot in einer Minute fertig."
              : "Noch keine Rechnung. Am schnellsten: Angebot annehmen lassen und daraus mit einem Klick die Rechnung erstellen."}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {docs.map((d) => (
              <li key={d.id}>
                <Link href={`${basis}/vorgang/${d.id}`} className="bg-background hover:bg-secondary grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 rounded-2xl px-4 py-3 text-sm transition-colors md:grid-cols-[9rem_1fr_7rem_8rem_auto]">
                  <span className="font-mono text-xs tabular-nums">
                    {d.nummer ?? "Entwurf"}
                    {d.version > 1 ? ` · V${d.version}` : ""}
                  </span>
                  <span className="min-w-0 truncate font-medium md:order-none">
                    {d.kunde.firma || d.kunde.name || "Ohne Kunde"}
                    {d.titel && <span className="text-muted-foreground font-normal"> · {d.titel}</span>}
                  </span>
                  <span className="text-muted-foreground tabular-nums">{formatDatum(d.datum)}</span>
                  <span className="text-right font-semibold tabular-nums">{d.summen ? formatEuro(d.summen.bruttoCent) : "—"}</span>
                  <span className="justify-self-end">
                    <StatusPille status={anzeigeStatus(d)} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
