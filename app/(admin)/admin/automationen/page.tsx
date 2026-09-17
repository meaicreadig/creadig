import Link from "next/link"

import { AdminShell } from "@/components/admin/admin-shell"
import { Pill, SectionHeader, Surface, UnavailableNote } from "@/components/admin/primitives"
import { VerbindungKnopf } from "@/components/admin/verbindung-knopf"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { istAktiv } from "@/lib/automation"
import { AUSLOESER } from "@/lib/ereignis"
import { GESCHAEFTS_ZEITZONE } from "@/lib/geschaeftszeit"
import { getVertriebStore } from "@/lib/lead-store"
import { automationSchalten, automationSchliessen } from "./actions"

/**
 * ADM-06 · A29 — DIE AUTOMATIONEN, OFFEN HINGELEGT.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DREI FRAGEN, DREI ABSCHNITTE
 *
 *   Wartet etwas auf mich?   Die offenen Wirkungen, zuoberst.
 *   Was läuft automatisch?   Die Auslöser, mit Schalter.
 *   Was ist gelaufen?        Das Protokoll, mit Zeitpunkt und Ergebnis.
 *
 * Die Reihenfolge ist die Antwort auf „Status ist keine Arbeit": Was auf
 * einen Menschen wartet, steht vor dem, was das System über sich selbst zu
 * sagen hat.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DIESE SEITE ZURÜCKNEHMEN KANN, OHNE ETWAS ZU REPARIEREN
 *
 * Weil eine Automation nie einen Geschäftsdatensatz ändert
 * (`lib/automation.ts`). Ihre Wirkung ist der Eintrag im Protokoll — und der
 * lässt sich abhaken oder zurücknehmen, ohne dass irgendwo eine Zahl
 * zurückgerechnet werden müsste. Umkehrbarkeit ist hier eine Eigenschaft der
 * Bauart, keine Funktion, die jemand schreiben und vergessen kann.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * UND WARUM DIE VERBOTSLISTE MIT AUF DIE SEITE GEHÖRT
 *
 * Wer Automationen sieht, fragt sich als Nächstes, was sie sonst noch tun.
 * Die Antwort steht unten, aus `NIEMALS_AUTOMATISCH` (G26): ansprechen,
 * senden, zusagen, abnehmen, abrechnen — nichts davon geschieht je
 * automatisch. Eine Grenze, die man nicht liest, beruhigt niemanden.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const { t } = await adminSprachKontext()
  return { title: t.automationen.titel }
}

export default async function Automationen() {
  const { t, intl } = await adminSprachKontext()
  const a = t.automationen
  const store = getVertriebStore()

  const [laeufe, schalter] = store
    ? await Promise.all([store.listAutomationRuns({ limit: 100 }), store.listAutomationSwitches()])
    : [null, null]

  const offene = laeufe?.filter((l) => l.zustand === "offen") ?? []
  const aktiveZahl = AUSLOESER.filter((x) => istAktiv(schalter ?? [], x.key)).length
  const zeitformat = new Intl.DateTimeFormat(intl, {
    timeZone: GESCHAEFTS_ZEITZONE,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })

  /** Der Satz zu einem Ergebnis — Maschinenwert plus Werte, wie in H21. */
  const ergebnisSatz = (schluessel: string | null, daten: Record<string, string | number> | null) => {
    if (!schluessel) return null
    const vorlage = a.ergebnis[schluessel as keyof typeof a.ergebnis]
    if (!vorlage) return schluessel
    return vorlage.replace(/\{(\w+)\}/g, (_, k: string) => String(daten?.[k] ?? ""))
  }

  return (
    <AdminShell
      title={a.titel}
      lead={a.lead}
      /*
       * A19 — „0 offen" ist eine MESSUNG. Ohne lesbares Protokoll gibt es
       * keine, und dann steht hier auch keine Zahl: Ein Owner, der „0 offen"
       * liest, waehrend die Tabelle nicht antwortet, hat die beruhigendste
       * aller falschen Auskuenfte bekommen.
       */
      meta={
        laeufe === null ? undefined : (
          <span className="block tabular-nums">{a.meta(offene.length, aktiveZahl, AUSLOESER.length)}</span>
        )
      }
    >
      {!store ? (
        <UnavailableNote title={t.speicher.nichtEingerichtetTitel(a.titel)}>
          {t.speicher.nichtEingerichtetText(a.titel)}
        </UnavailableNote>
      ) : laeufe === null ? (
        <UnavailableNote title={t.speicher.nichtErreichbarTitel(a.titel)}>
          {a.nichtLesbar} {t.speicher.nichtErreichbarText(a.titel)}
        </UnavailableNote>
      ) : (
        <>
          {/* ── WARTET ETWAS AUF MICH? ─────────────────────────────────── */}
          <section aria-labelledby="offen-titel">
            <SectionHeader id="offen-titel" title={a.offeneTitel} count={offene.length} />
            {offene.length === 0 ? (
              <p className="type-small text-muted-foreground mt-3">{a.keineOffenen}</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {offene.map((l) => (
                  <li key={l.id} data-lauf={l.id}>
                    <Surface padding="sm">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                        <span className="text-subhead text-sm">
                          {a.ausloeser[l.ausloeser as keyof typeof a.ausloeser]?.name ?? l.ausloeser}
                        </span>
                        <Pill severity="attention">
                          {a.wirkung[l.wirkung as keyof typeof a.wirkung] ?? l.wirkung}
                        </Pill>
                      </div>
                      <p className="type-small text-foreground/90 mt-2 text-pretty">
                        {ergebnisSatz(l.ergebnis, l.daten)}
                      </p>
                      <p className="text-meta text-muted-foreground mt-2 tabular-nums">
                        {zeitformat.format(new Date(l.createdAt))}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {(
                          [
                            ["erledigt", a.abhaken, "deutlich"],
                            ["zurueckgenommen", a.zuruecknehmen, "leise"],
                          ] as const
                        ).map(([zustand, label, variante]) => (
                          <form key={zustand} action={automationSchliessen} data-schliessen={zustand}>
                            <input type="hidden" name="id" value={l.id} />
                            <input type="hidden" name="zustand" value={zustand} />
                            <VerbindungKnopf label={label} laeuft={a.laeuftGerade} variante={variante} />
                          </form>
                        ))}
                        {l.gegenstandArt === "opportunity" && (
                          <Link
                            prefetch={false}
                            href={`/admin/vertrieb/pipeline/${l.gegenstand}`}
                            className="type-small text-gold-text underline underline-offset-4"
                          >
                            {t.verbindungen.oeffnen}
                          </Link>
                        )}
                      </div>
                    </Surface>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ── WAS LÄUFT AUTOMATISCH? ─────────────────────────────────── */}
          <section aria-labelledby="ausloeser-titel" className="mt-12">
            <SectionHeader id="ausloeser-titel" title={a.ausloeserTitel} count={AUSLOESER.length} />
            <p className="type-small text-muted-foreground mt-3 max-w-3xl text-pretty">{a.keineAenderung}</p>
            <ul className="mt-5 flex flex-col gap-4">
              {AUSLOESER.map((x) => {
                const an = istAktiv(schalter ?? [], x.key)
                const texte = a.ausloeser[x.key as keyof typeof a.ausloeser]
                return (
                  <li key={x.key} data-ausloeser={x.key}>
                    <Surface>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                        <h3 className="text-subhead text-base">{texte?.name ?? x.key}</h3>
                        <div className="flex shrink-0 items-center gap-2">
                          <Pill severity={an ? "neutral" : "attention"}>{an ? a.an : a.aus}</Pill>
                          <Pill>{a.wirkung[x.wirkung]}</Pill>
                        </div>
                      </div>
                      <p className="type-small text-muted-foreground mt-3 max-w-3xl text-pretty">
                        {texte?.was ?? x.was}
                      </p>
                      <p className="text-meta text-muted-foreground mt-3">
                        {a.aufEreignis(x.auf)} · {a.hoechstens(x.versucheMax)}
                      </p>
                      <form action={automationSchalten} className="mt-4" data-schalter={x.key}>
                        <input type="hidden" name="ausloeser" value={x.key} />
                        <input type="hidden" name="aktiv" value={an ? "aus" : "an"} />
                        <VerbindungKnopf
                          label={an ? a.abschalten : a.einschalten}
                          laeuft={a.wechselLaeuft}
                        />
                      </form>
                    </Surface>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* ── WAS IST GELAUFEN? ──────────────────────────────────────── */}
          <section aria-labelledby="lauf-titel" className="mt-12">
            <SectionHeader id="lauf-titel" title={a.laufTitel} count={laeufe.length} />
            {laeufe.length === 0 ? (
              <p className="type-small text-muted-foreground mt-3">{a.keineLaeufe}</p>
            ) : (
              <ol className="mt-4 flex flex-col gap-2">
                {laeufe.map((l) => (
                  <li key={l.id} className="type-small text-muted-foreground text-pretty">
                    <span className="tabular-nums">{zeitformat.format(new Date(l.createdAt))}</span>
                    {" · "}
                    <span className="text-foreground">
                      {a.ausloeser[l.ausloeser as keyof typeof a.ausloeser]?.name ?? l.ausloeser}
                    </span>
                    {" · "}
                    {a.zustand[l.zustand as keyof typeof a.zustand] ?? l.zustand}
                    {l.erledigtVon && l.erledigtAt
                      ? ` · ${a.erledigtVon(l.erledigtVon, zeitformat.format(new Date(l.erledigtAt)))}`
                      : ""}
                    <span className="block">{ergebnisSatz(l.ergebnis, l.daten)}</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}

      {/* ── WAS NIE AUTOMATISCH GESCHIEHT ─────────────────────────────── */}
      <section aria-labelledby="grenze-titel" className="border-line mt-12 border-t pt-8">
        <h2 id="grenze-titel" className="eyebrow text-muted-foreground">
          {a.nichtVerantwortungTitel}
        </h2>
        <p className="type-small text-muted-foreground mt-3 max-w-3xl text-pretty">
          {a.nichtVerantwortung}
        </p>
      </section>
    </AdminShell>
  )
}
