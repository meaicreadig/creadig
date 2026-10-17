import Link from "next/link"
import { notFound } from "next/navigation"

import { FinanzShell, OhneSpeicher } from "@/components/finanz/shell"
import { tag } from "@/components/finanz/format"
import { AdminInput } from "@/components/admin/primitives"
import { DokumentBlatt } from "@/components/finanz/auftraege/dokument-blatt"
import { DokumentEditor } from "@/components/finanz/auftraege/editor"
import { StatusPille } from "@/components/finanz/auftraege/status-pille"
import { DruckKnopf, LinkKopieren, NachfassKnopf } from "@/components/finanz/auftraege/knoepfe"
import { TeilzahlungForm } from "@/components/finanz/auftraege/teilzahlung"
import { MahnEntwurf } from "@/components/finanz/auftraege/mahn-entwurf"
import {
  bezahltMarkieren,
  entwurfVerwerfen,
  inhaberAntwort,
  rechnungErstellen,
  stornieren,
  versionAnlegen,
} from "@/app/(finanz)/finanz/auftraege/actions"
import { finanzBasis } from "@/lib/finanz/basis"
import { finanzDb } from "@/lib/finanz/store"
import { GESCHAEFTSFELDER } from "@/lib/finanz/belege"
import { ART_LABEL, formatEuro, heuteBerlin, naechsteMahnstufe, steuerModus, tageZwischen } from "@/lib/finanz/auftraege/rechnen"
import { anzeigeStatus, ladeDokument, ladeFirma, ladeKunden, ladeLeistungen, ladeVerlauf, ladeVerwandte, ladeZahlungen } from "@/lib/finanz/auftraege/store"
import { dokumentUrl } from "@/lib/finanz/auftraege/mail"
import { fehltFuerERechnung } from "@/lib/finanz/auftraege/erechnung"
import { finanzOwnerSeite } from "@/lib/finanz/zugang"

export const dynamic = "force-dynamic"
export const metadata = { title: "Vorgang" }

const VERLAUF: Record<string, string> = {
  angelegt: "Entwurf angelegt",
  festgeschrieben: "Festgeschrieben und versendet",
  geoeffnet: "Vom Kunden geöffnet",
  angenommen: "Angenommen",
  abgelehnt: "Abgelehnt",
  aenderung: "Änderung gewünscht",
  ersetzt: "Durch neue Version ersetzt",
  verworfen: "Entwurf verworfen",
  bezahlt: "Zahlung eingegangen",
  storniert: "Storniert",
  nachgefasst: "Nachfrage gesendet",
  mahnung_1: "Zahlungserinnerung gesendet",
  mahnung_2: "1. Mahnung gesendet",
  mahnung_3: "2. Mahnung gesendet",
}

const ZEIT = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin" })

export default async function Vorgang({ params }: { params: Promise<{ id: string }> }) {
  await finanzOwnerSeite()
  const { id } = await params
  const db = await finanzDb().catch(() => null)
  if (!db) return <FinanzShell aktiv="angebote" titel="Vorgang"><OhneSpeicher /></FinanzShell>

  const d = await ladeDokument(db, id)
  if (!d || d.status === "verworfen") notFound()
  const basis = await finanzBasis()
  const { firma, ustPflichtig } = await ladeFirma(db)
  const eFehlt = fehltFuerERechnung(d, d.absender ?? firma)
  const modus = steuerModus(d.kunde, ustPflichtig)
  const bereich = d.art === "angebot" ? "angebote" : "rechnungen"
  const status = anzeigeStatus(d)
  const kunde = d.kunde.firma || d.kunde.name || "Ohne Kunde"
  const titel = d.nummer ? `${ART_LABEL[d.art]} ${d.nummer}${d.version > 1 ? ` · V${d.version}` : ""}` : `Neues ${ART_LABEL[d.art] === "Rechnung" ? "Rechnung" : "Angebot"}`

  if (d.status === "entwurf") {
    const [leistungen, kunden] = await Promise.all([ladeLeistungen(db, true), ladeKunden(db)])
    return (
      <FinanzShell aktiv={bereich} titel={d.art === "rechnung" ? "Neue Rechnung" : d.version > 1 ? `Angebot · Version ${d.version}` : "Neues Angebot"}>
        <DokumentEditor
          id={d.id}
          art={d.art === "rechnung" ? "rechnung" : "angebot"}
          start={d}
          firma={firma}
          zurueck={`${basis}/${bereich}`}
          grundlagen={`${basis}/grundlagen`}
          leistungen={leistungen}
          kunden={kunden}
          felder={GESCHAEFTSFELDER.filter((g) => g.key !== "privat").map((g) => ({ key: g.key, label: g.label }))}
          ustPflichtig={ustPflichtig}
        />
        <form action={entwurfVerwerfen}>
          <input type="hidden" name="id" value={d.id} />
          <button type="submit" className="text-muted-foreground hover:text-destructive text-sm">Entwurf verwerfen</button>
        </form>
      </FinanzShell>
    )
  }

  const [verlauf, verwandte, zahlungen] = await Promise.all([
    ladeVerlauf(db, d.id),
    ladeVerwandte(db, d),
    d.art === "rechnung" ? ladeZahlungen(db, d.id) : Promise.resolve([]),
  ])
  const bezahltSchonCent = zahlungen.reduce((s, z) => s + z.cent, 0)
  const offenCent = (d.summen?.bruttoCent ?? 0) - bezahltSchonCent
  const url = d.token ? dokumentUrl(d.token) : null
  const heute = heuteBerlin()
  const mahn = d.art === "rechnung" && d.status === "versendet" && d.faelligAm ? naechsteMahnstufe(tageZwischen(d.faelligAm, heute), d.mahnstufe) : null
  const anzahlungOffen = verwandte.some((v) => v.art === "rechnung" && v.angebotId === d.id && v.anzahlungProzent === null && v.status !== "storniert")

  return (
    <FinanzShell aktiv={bereich} titel={titel} unterzeile={`${kunde}${d.titel ? ` · ${d.titel}` : ""}`}>
      <Zurueck href={`${basis}/${bereich}`} />

      <section aria-label="Aktionen" className="bg-card flex flex-col gap-5 rounded-[2rem] p-6 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          <StatusPille status={status} />
          <span className="font-sans text-2xl font-semibold tabular-nums">{formatEuro(d.summen?.bruttoCent ?? 0)}</span>
          {d.antwortName && <span className="text-muted-foreground text-sm">von {d.antwortName}</span>}
        </div>
        {d.antwortText && <p className="bg-secondary text-secondary-foreground rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line">{d.antwortText}</p>}

        <div className="flex flex-wrap gap-2">
          {url && <LinkKopieren url={url} />}
          {url && <a href={url} target="_blank" rel="noreferrer" className="bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors">Kundenansicht</a>}
          <DruckKnopf />
          {d.art === "rechnung" && d.nummer && (
            eFehlt.length === 0 ? (
              <a href={`/api/finanz/erechnung/${d.id}`} download className="bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors">
                E-Rechnung (XRechnung)
              </a>
            ) : (
              <span title={eFehlt.join(" · ")} className="text-muted-foreground bg-secondary/60 inline-flex cursor-help items-center rounded-full px-4 py-2 text-sm">
                E-Rechnung: {eFehlt.length} Angabe{eFehlt.length === 1 ? "" : "n"} fehlt
              </span>
            )
          )}
          {d.status === "versendet" && <NachfassKnopf id={d.id} label="Erneut senden" erneut />}
          {d.art === "angebot" && d.status === "versendet" && <NachfassKnopf id={d.id} label="Nachfrage senden" />}
          {mahn && <NachfassKnopf id={d.id} label={["", "Zahlungserinnerung", "1. Mahnung", "2. Mahnung"][mahn]} />}
        </div>

        {d.art === "rechnung" && (d.status === "versendet" || d.status === "teilbezahlt") && <MahnEntwurf id={d.id} />}

        {d.art === "angebot" && ["versendet", "aenderung", "abgelehnt"].includes(d.status) && (
          <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
            <form action={versionAnlegen}>
              <input type="hidden" name="id" value={d.id} />
              <button className="bg-primary text-primary-foreground rounded-full px-5 py-2.5 text-sm font-semibold">Neue Version erstellen</button>
            </form>
            {d.status === "versendet" && (
              <form action={inhaberAntwort} className="bg-background flex flex-wrap items-end gap-2 rounded-3xl p-3">
                <input type="hidden" name="id" value={d.id} />
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-muted-foreground">Mündlich / telefonisch beantwortet von</span>
                  <AdminInput name="name" placeholder="Name" className="w-48" />
                </label>
                <button name="antwort" value="angenommen" className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-medium">Angenommen</button>
                <button name="antwort" value="abgelehnt" className="bg-secondary text-secondary-foreground rounded-full px-4 py-2 text-sm font-medium">Abgelehnt</button>
              </form>
            )}
          </div>
        )}

        {d.art === "angebot" && d.status === "angenommen" && !anzahlungOffen && (
          <div className="flex flex-wrap items-end gap-3">
            <form action={rechnungErstellen}>
              <input type="hidden" name="id" value={d.id} />
              <button className="bg-primary text-primary-foreground rounded-full px-5 py-2.5 text-sm font-semibold">Rechnung erstellen</button>
            </form>
            <form action={rechnungErstellen} className="bg-background flex items-end gap-2 rounded-full p-1.5 ps-4">
              <input type="hidden" name="id" value={d.id} />
              <label className="text-muted-foreground flex items-center gap-2 text-sm">
                Anzahlung
                <AdminInput name="anzahlung" type="number" min={1} max={99} defaultValue={50} className="w-20" aria-label="Anzahlung in Prozent" />%
              </label>
              <button className="bg-secondary text-secondary-foreground rounded-full px-4 py-2 text-sm font-medium">Anzahlungsrechnung</button>
            </form>
          </div>
        )}

        {d.art === "rechnung" && (d.status === "versendet" || d.status === "teilbezahlt") && (
          <div className="flex flex-col gap-3">
            {d.status === "teilbezahlt" && (
              <p className="text-muted-foreground text-sm">
                Bisher eingegangen: <span className="text-foreground font-semibold tabular-nums">{formatEuro(bezahltSchonCent)}</span> · offen:{" "}
                <span className="text-foreground font-semibold tabular-nums">{formatEuro(offenCent)}</span>
              </p>
            )}
            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
              <form action={bezahltMarkieren} className="bg-background flex items-end gap-2 rounded-full p-1.5 ps-4">
                <input type="hidden" name="id" value={d.id} />
                <label className="text-muted-foreground flex items-center gap-2 text-sm">
                  Zahlung am
                  <AdminInput name="am" type="date" defaultValue={heute} className="w-40" aria-label="Zahlungsdatum" />
                </label>
                <button className="bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-semibold">
                  {d.status === "teilbezahlt" ? "Rest als bezahlt buchen" : "Als bezahlt buchen"}
                </button>
              </form>
              <TeilzahlungForm id={d.id} heute={heute} />
              <details className="bg-background rounded-3xl px-4 py-2">
                <summary className="text-muted-foreground cursor-pointer py-1 text-sm">Stornieren …</summary>
                <form action={stornieren} className="flex flex-wrap items-end gap-2 py-2">
                  <input type="hidden" name="id" value={d.id} />
                  <AdminInput name="grund" placeholder="Grund (optional)" className="w-64" aria-label="Storno-Grund" />
                  <button className="bg-destructive text-primary-foreground rounded-full px-4 py-2 text-sm font-medium">Stornorechnung erstellen</button>
                </form>
              </details>
            </div>
            {zahlungen.length > 0 && (
              <ul className="text-muted-foreground flex flex-col gap-1 text-xs">
                {zahlungen.map((z) => (
                  <li key={z.id}>
                    {tag(z.datum)} · {formatEuro(z.cent)} · {z.quelle === "bank" ? "aus Bank-Import" : "von Hand"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {d.art === "rechnung" && d.status === "bezahlt" && (
          <details className="bg-background w-fit rounded-3xl px-4 py-2">
            <summary className="text-muted-foreground cursor-pointer py-1 text-sm">Bezahlte Rechnung stornieren …</summary>
            <p className="text-muted-foreground max-w-prose py-1 text-xs leading-relaxed">
              Die Zahlung bleibt erhalten und wird als Guthaben des Kunden geführt, bis du sie erstattest oder auf eine neue Rechnung anrechnest.
            </p>
            <form action={stornieren} className="flex flex-wrap items-end gap-2 py-2">
              <input type="hidden" name="id" value={d.id} />
              <AdminInput name="grund" placeholder="Grund (optional)" className="w-64" aria-label="Storno-Grund" />
              <button className="bg-destructive text-primary-foreground rounded-full px-4 py-2 text-sm font-medium">Stornorechnung erstellen</button>
            </form>
          </details>
        )}

        {d.art === "rechnung" && d.status === "storniert" && bezahltSchonCent > 0 && (
          <p className="bg-background w-fit rounded-3xl px-4 py-3 text-sm">
            Guthaben des Kunden aus dieser Rechnung:{" "}
            <span className="text-primary font-semibold tabular-nums">{formatEuro(bezahltSchonCent)}</span>
            <span className="text-muted-foreground"> · erstatten oder auf die nächste Rechnung anrechnen</span>
          </p>
        )}
      </section>

      {verwandte.length > 0 && (
        <section aria-labelledby="v-verwandt" className="bg-card flex flex-col gap-3 rounded-[2rem] p-6 print:hidden">
          <h2 id="v-verwandt" className="text-lg font-semibold">Zum selben Auftrag</h2>
          <ul className="flex flex-col gap-2">
            {verwandte.map((v) => (
              <li key={v.id}>
                <Link href={`${basis}/vorgang/${v.id}`} className="bg-background hover:bg-secondary flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm transition-colors">
                  <span className="font-medium">
                    {ART_LABEL[v.art]} {v.nummer ?? "Entwurf"}
                    {v.version > 1 ? ` · V${v.version}` : ""}
                    {v.anzahlungProzent ? ` · Anzahlung ${v.anzahlungProzent} %` : ""}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="tabular-nums">{formatEuro(v.summen?.bruttoCent ?? 0)}</span>
                    <StatusPille status={anzeigeStatus(v)} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <DokumentBlatt d={d} firma={firma} modus={modus} />

      <section aria-labelledby="v-verlauf" className="bg-card flex flex-col gap-3 rounded-[2rem] p-6 print:hidden">
        <h2 id="v-verlauf" className="text-lg font-semibold">Verlauf</h2>
        <ol className="flex flex-col gap-2">
          {verlauf.map((v, i) => (
            <li key={i} className="bg-background flex flex-wrap items-baseline justify-between gap-2 rounded-2xl px-4 py-3 text-sm">
              <span className="font-medium">
                {VERLAUF[v.aktion] ?? v.aktion}
                {v.daten.quelle === "inhaber" ? " (von dir eingetragen)" : ""}
              </span>
              <time className="text-muted-foreground tabular-nums" dateTime={v.at}>{ZEIT.format(new Date(v.at))}</time>
            </li>
          ))}
        </ol>
        {d.pruefsumme && <p className="text-muted-foreground font-mono text-xs break-all">Prüfsumme {d.pruefsumme}</p>}
      </section>
    </FinanzShell>
  )
}

function Zurueck({ href }: { href: string }) {
  return (
    <Link href={href} className="text-muted-foreground hover:text-primary -mt-4 self-start text-sm print:hidden">
      ← Zur Übersicht
    </Link>
  )
}
