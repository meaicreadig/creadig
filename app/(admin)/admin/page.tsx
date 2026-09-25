import Link from "next/link"

import { AdminShell } from "@/components/admin/admin-shell"
import { Pill, SectionHeader, Surface, UnavailableNote } from "@/components/admin/primitives"
import { type AttentionItem, type AttentionRank, type Kennzahlen, collectAttention } from "@/lib/attention"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { datumAnzeige, GESCHAEFTS_ZEITZONE } from "@/lib/geschaeftszeit"
import { getVertriebStore, leadStoreConfigured } from "@/lib/lead-store"
import { SystemErledigt } from "@/components/admin/system-erledigt"

/**
 * ÜBERSICHT — die Startseite des Admin (ADM-01, 17.09.2026).
 *
 * ---------------------------------------------------------------------------
 * WAS SIE ERSETZT
 * „Heute“ (Aufmerksamkeitsliste + Material-Nebenspalte) und „Cockpit“
 * (Lage-Register + Vorschläge). Zwei Owner-Startflächen mit überlappender
 * Frage sind eine zu viel. Die Lage-Register stehen jetzt unter System
 * (`/admin/material#lage`), `/admin/cockpit` leitet dorthin um.
 *
 * ---------------------------------------------------------------------------
 * DIE ORDNUNG — INFORMATION → ENTSCHEIDUNG → HANDLUNG
 *   1 Kennzahlen      exakte Zahlen (count(*)), jede ein Weg in die gefilterte Liste
 *   2 Heute zu tun    operative Punkte, jeder ein Weg auf seinen Datensatz
 *   3 Systemzustand   gestörter Betrieb — ohne ihn kommen keine Anfragen an
 *   4 Entscheidungen  was nur der Owner kann
 * Material für die Website ist ein Vorrat, keine Fälligkeit: eine Zeile mit Weg.
 *
 * ---------------------------------------------------------------------------
 * WAS NICHT ÜBERSETZT WERDEN KANN
 * Beschriftungen von Betriebs- und Entscheidungspunkten kommen aus
 * `lib/material-status.ts` (G18-gesperrt) und erscheinen in TR deutsch.
 * Freitext aus Datensätzen (nächster Schritt, Namen) bleibt, wie ein Mensch
 * ihn geschrieben hat.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const { t } = await adminSprachKontext()
  return { title: t.uebersicht.titel }
}

const OPERATIV: readonly AttentionRank[] = [
  "ueberfaellig",
  "heute-faellig",
  "neue-anfrage",
  "schritt-ohne-termin",
  "ohne-schritt",
  "beziehung-faellig",
]

const SCHWERE: Record<AttentionRank, "neutral" | "attention" | "critical"> = {
  betriebsblocker: "critical",
  ueberfaellig: "critical",
  "heute-faellig": "attention",
  "neue-anfrage": "attention",
  "schritt-ohne-termin": "neutral",
  "ohne-schritt": "neutral",
  "beziehung-faellig": "neutral",
  entscheidung: "neutral",
}

type KennzahlSchluessel = Exclude<keyof Kennzahlen, "aufteilung">

/*
 * ADM-06 · A25 — JEDE ZAHL FÜHRT ZU DEN ZEILEN, DIE SIE ZÄHLT.
 *
 * Bis 22.09.2026 führten „Überfällig“ und „Heute fällig“ auf `#heute-titel`:
 * eine Liste mit höchstens zwölf Einträgen je Art. Bei 30 überfälligen
 * Vorgängen erklärte sie die Zahl nicht — sie widersprach ihr. Beide Zahlen
 * zählen Chancen UND Anfragen; eine vollständige Liste gibt es je Art. Die
 * Kachel zeigt deshalb die Summe und darunter beide Wege, jeder mit seinem
 * Anteil — gefiltert mit derselben Bedingung, mit der `summary()` zählt.
 */
const KENNZAHL_WEG: Record<KennzahlSchluessel, string | { chancen: string; anfragen: string }> = {
  ueberfaellig: {
    chancen: "/admin/vertrieb/pipeline?bucket=ueberfaellig",
    anfragen: "/admin/vertrieb/anfragen?faellig=ueberfaellig",
  },
  heuteFaellig: {
    chancen: "/admin/vertrieb/pipeline?bucket=faellig",
    anfragen: "/admin/vertrieb/anfragen?faellig=heute",
  },
  neueAnfragen: "/admin/vertrieb/anfragen?status=neu",
  ohneSchritt: "/admin/vertrieb/pipeline?bucket=ohne-schritt",
}

const ENTSCHEIDUNGEN_SICHTBAR = 5

export default async function Uebersicht() {
  const { t, intl } = await adminSprachKontext()
  const hasStore = leadStoreConfigured()
  const board = await collectAttention(getVertriebStore())

  const operativ = board.items.filter((i) => OPERATIV.includes(i.rank))
  const betrieb = board.items.filter((i) => i.rank === "betriebsblocker")
  const entscheidungen = board.items.filter((i) => i.rank === "entscheidung")
  const k = board.kennzahlen
  const gezaehlt = k ? k.ueberfaellig + k.heuteFaellig + k.neueAnfragen + k.ohneSchritt : 0
  const abgeschnitten = k !== null && gezaehlt > operativ.filter((i) => i.rank !== "beziehung-faellig" && i.rank !== "schritt-ohne-termin").length

  const stand = new Date().toLocaleString(intl, {
    timeZone: GESCHAEFTS_ZEITZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <AdminShell title={t.uebersicht.titel} lead={t.uebersicht.lead} meta={<span className="block">{t.uebersicht.stand(stand)}</span>}>
      {/* ── 1 · Kennzahlen ── */}
      <section aria-label={t.uebersicht.kennzahlenLabel}>
        <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
          {(Object.keys(KENNZAHL_WEG) as KennzahlSchluessel[]).map((schluessel) => {
            const weg = KENNZAHL_WEG[schluessel]
            const zahl = k ? (
              <span
                className={`mt-1 block text-2xl font-semibold tabular-nums ${typeof weg === "string" ? "group-hover:underline group-hover:underline-offset-4" : ""} ${
                  schluessel === "ueberfaellig" && k[schluessel] > 0 ? "text-destructive" : ""
                }`}
                data-kennzahl={schluessel}
              >
                {k[schluessel]}
              </span>
            ) : null
            return (
              <li key={schluessel}>
                {k && typeof weg === "string" ? (
                  <Link href={weg} className="group block h-full">
                    <Surface padding="sm" className="h-full">
                      <span className="type-small text-muted-foreground block">{t.uebersicht.kennzahl[schluessel]}</span>
                      {zahl}
                    </Surface>
                  </Link>
                ) : k && typeof weg !== "string" ? (
                  <Surface padding="sm" className="h-full">
                    <span className="type-small text-muted-foreground block">{t.uebersicht.kennzahl[schluessel]}</span>
                    {zahl}
                    {/* Zwei Wege statt einer Kachel-Verknüpfung: ein Link im Link wäre keiner. */}
                    <span className="mt-1 flex flex-wrap gap-x-3 text-xs">
                      {(["chancen", "anfragen"] as const).map((art) => (
                        <Link
                          key={art}
                          href={weg[art]}
                          className="text-gold-text underline underline-offset-4"
                          data-teil={`${schluessel}-${art}`}
                        >
                          {t.uebersicht.teil[art](k.aufteilung[schluessel as "ueberfaellig" | "heuteFaellig"][art])}
                        </Link>
                      ))}
                    </span>
                  </Surface>
                ) : (
                  <Surface padding="sm" className="h-full">
                    <span className="type-small text-muted-foreground block">{t.uebersicht.kennzahl[schluessel]}</span>
                    <span className="mt-1 block text-2xl font-semibold" aria-hidden="true">—</span>
                    <span className="text-muted-foreground block text-xs">{t.uebersicht.nichtGemessen}</span>
                  </Surface>
                )}
              </li>
            )
          })}
        </ul>
        {!hasStore ? (
          <div className="mt-4">
            <UnavailableNote title={t.uebersicht.vertriebNichtEingerichtetTitel}>{t.uebersicht.vertriebNichtEingerichtet}</UnavailableNote>
          </div>
        ) : !board.salesMeasured ? (
          <div className="mt-4">
            <UnavailableNote title={t.uebersicht.vertriebNichtErreichbarTitel}>{t.uebersicht.vertriebNichtErreichbar}</UnavailableNote>
          </div>
        ) : null}
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-12">
        {/* ── 2 · Heute zu tun ── */}
        <section aria-labelledby="heute-titel" className="min-w-0">
          {/* Ohne Messung keine Zahl — „0 Punkte“ wäre eine Behauptung über das Geschäft. */}
          <SectionHeader
            id="heute-titel"
            title={t.uebersicht.heuteTitel}
            count={board.salesMeasured ? t.uebersicht.punkte(operativ.length) : t.uebersicht.nichtGemessen}
          />
          {board.salesMeasured && operativ.length === 0 ? (
            <Surface padding="sm" className="mt-5">
              <p className="type-body text-foreground/85 text-pretty">{t.uebersicht.heuteLeer}</p>
              <p className="type-small text-muted-foreground mt-2 text-pretty">{t.uebersicht.heuteLeerNaechstes}</p>
              <div className="mt-3 flex flex-wrap gap-5">
                <Link href="/admin/vertrieb/anfragen" className="text-gold-text text-sm underline underline-offset-4">
                  {t.uebersicht.zuDenAnfragen}
                </Link>
                <Link href="/admin/vertrieb/pipeline" className="text-gold-text text-sm underline underline-offset-4">
                  {t.uebersicht.zurPipeline}
                </Link>
              </div>
            </Surface>
          ) : operativ.length > 0 ? (
            <>
              <Punktliste items={operativ} t={t} intl={intl} />
              {abgeschnitten ? <p className="type-small text-muted-foreground mt-3">{t.uebersicht.weitere(gezaehlt)}</p> : null}
            </>
          ) : null}
        </section>

        <aside className="flex min-w-0 flex-col gap-10">
          {/* ── 3 · Systemzustand ── */}
          <section aria-labelledby="system-titel">
            <SectionHeader id="system-titel" title={t.uebersicht.systemTitel} count={betrieb.length ? t.uebersicht.punkte(betrieb.length) : undefined} />
            {betrieb.length === 0 ? (
              <p className="type-small text-muted-foreground mt-4">{t.uebersicht.systemOk}</p>
            ) : (
              <Punktliste items={betrieb} t={t} intl={intl} />
            )}
            <p className="type-small text-muted-foreground mt-4">{t.uebersicht.materialZeile(board.materialRest)}</p>
            <Link href="/admin/material" className="text-gold-text mt-2 inline-block text-sm underline underline-offset-4">
              {t.uebersicht.zumSystem}
            </Link>
          </section>

          {/* ── 3b · W6 · A4 — was das System selbst erledigt hat ── */}
          <SystemErledigt />

          {/* ── 4 · Entscheidungen ── */}
          <section aria-labelledby="entscheidungen-titel">
            <SectionHeader id="entscheidungen-titel" title={t.uebersicht.entscheidungenTitel} count={entscheidungen.length ? t.uebersicht.punkte(entscheidungen.length) : undefined} />
            {entscheidungen.length === 0 ? (
              <p className="type-small text-muted-foreground mt-4">{t.uebersicht.entscheidungenLeer}</p>
            ) : (
              <>
                <Punktliste items={entscheidungen.slice(0, ENTSCHEIDUNGEN_SICHTBAR)} t={t} intl={intl} ohneRang />
                {entscheidungen.length > ENTSCHEIDUNGEN_SICHTBAR ? (
                  <Link href="/admin/material#gruppe-entscheidungen" className="text-gold-text mt-3 inline-block text-sm underline underline-offset-4">
                    {t.uebersicht.alleEntscheidungen(entscheidungen.length)}
                  </Link>
                ) : null}
              </>
            )}
          </section>
        </aside>
      </div>
    </AdminShell>
  )
}

/**
 * Interne Kennungen am Ende eines Titels („(§10.6)“, „(BF-8)“, „(MP10-2.10)“)
 * sind Arbeitsnotizen, keine Geschäftssprache. Sie stammen aus
 * `lib/material-status.ts` (G18-gesperrt) — geändert wird dort nichts, nur
 * hier nicht angezeigt. Im Materialstand unter System bleiben sie sichtbar.
 */
function ohneKennung(titel: string): string {
  return titel.replace(/\s*\((?:§\s*[\d.]+|[A-Z]{1,5}\d*(?:[-.][\w.]+)+)\)\s*$/u, "").trim()
}

function Punktliste({
  items,
  t,
  intl,
  ohneRang = false,
}: {
  items: AttentionItem[]
  t: Awaited<ReturnType<typeof adminSprachKontext>>["t"]
  intl: string
  ohneRang?: boolean
}) {
  return (
    <ul className="mt-5 flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.id}>
          <Link href={item.href} className="group block">
            <Surface padding="sm" className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <span className="min-w-0">
                <span className="text-subhead block text-sm group-hover:underline group-hover:underline-offset-4">{ohneKennung(item.title)}</span>
                {item.anfrage ? (
                  <span className="type-small text-muted-foreground mt-1 block">{t.uebersicht.anfrageMeta(item.anfrage.quelle, item.anfrage.referenz)}</span>
                ) : item.detail ? (
                  <span className="type-small text-muted-foreground mt-1 block text-pretty">{item.detail}</span>
                ) : null}
              </span>
              <span className="flex shrink-0 items-baseline gap-2">
                {item.due ? (
                  <span className="text-meta text-muted-foreground tabular-nums">{t.uebersicht.faelligAm(datumAnzeige(item.due, intl))}</span>
                ) : null}
                {ohneRang ? null : <Pill severity={SCHWERE[item.rank]}>{t.rang[item.rank]}</Pill>}
              </span>
            </Surface>
          </Link>
        </li>
      ))}
    </ul>
  )
}
