"use client"

import { useActionState } from "react"

import { AdminField, AdminInput, AdminSelect, AdminTextarea, Pill, Surface } from "@/components/admin/primitives"
import {
  ABSCHNITTE,
  ANGEBOT_ZUSTAENDE,
  JA_FORMEN,
  KATALOG_LABEL,
  betragText,
  seiten,
  SEITEN_HINWEIS_AB,
  type Angebot,
  type Befund,
} from "@/lib/angebot"
import { OFFER_KINDS, OFFERS } from "@/lib/offer-readiness"
import type { AngebotAntwort } from "@/app/(admin)/admin/vertrieb/actions"

/**
 * GATE 17 · Die Angebotsmappe an einem Vorgang.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DIESE FLAECHE UEBERHAUPT EXISTIERT
 *
 * Gate 12 hat den teuersten Befund dieses Hauses geliefert: `research_cases`
 * war leer, nicht weil niemand recherchiert hatte, sondern weil das Ergebnis
 * nirgends hin konnte — es gab den Aktenschrank und den Stift, aber keinen
 * Weg, eine Akte anzulegen.
 *
 * Genau der Zustand drohte hier wieder. Das Angebotsschema steht seit dem
 * 29.08. in `docs/sales/proposal-outline.md`, die Regeln stehen jetzt in
 * `lib/angebot.ts`, die Tabelle existiert — und ohne diese Flaeche haette
 * ein Angebot weiterhin in einem Textprogramm daneben entstehen muessen,
 * wo keine dieser Regeln gilt.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DIE BEFUNDE HIER STEHEN UND NICHT IM LOG
 *
 * „Senden" kann fehlschlagen, und zwar aus einem SACHLICHEN Grund: ein
 * Pflichtabschnitt fehlt, die Angebotsreife steht nicht, eine Zahl hat keine
 * Deckung. Ein Formular, das dann einfach nichts tut, wird dreimal gedrueckt
 * und danach fuer kaputt gehalten.
 *
 * Deshalb geben die Aktionen Befunde zurueck, und deshalb ist diese Flaeche
 * eine Client-Komponente: Sie hat keinen eigenen Zustand ausser dem, was die
 * letzte Aktion geantwortet hat.
 */

const LEER: AngebotAntwort = { ok: true, befunde: [] }

function Befunde({ antwort }: { antwort: AngebotAntwort }) {
  if (antwort.ok || antwort.befunde.length === 0) return null
  return (
    <Surface padding="sm" className="mt-4">
      <p className="type-small text-subhead">
        Das geht so nicht hinaus — {antwort.befunde.length} offene{antwort.befunde.length === 1 ? "r" : ""} Punkt
        {antwort.befunde.length === 1 ? "" : "e"}:
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {antwort.befunde.map((b: Befund, i: number) => (
          <li key={i} className="type-small text-muted-foreground text-pretty">
            <span className="text-foreground">{b.abschnitt}: </span>
            {b.satz}
          </li>
        ))}
      </ul>
    </Surface>
  )
}

export function AngebotMappe({
  opportunityId,
  referenz,
  offerKind,
  angebote,
  speichern,
  senden,
  annehmen,
}: {
  opportunityId: string
  /** Die Lead-Referenz — dieselbe Nummer wie in der Eingangsbestaetigung. */
  referenz: string
  offerKind: string | null
  angebote: Angebot[]
  speichern: (opportunityId: string, form: FormData) => Promise<AngebotAntwort>
  senden: (opportunityId: string, form: FormData) => Promise<AngebotAntwort>
  annehmen: (opportunityId: string, form: FormData) => Promise<AngebotAntwort>
}) {
  const [neuAntwort, neuAction] = useActionState(
    async (_: AngebotAntwort, form: FormData) => speichern(opportunityId, form),
    LEER,
  )
  const [sendenAntwort, sendenAction] = useActionState(
    async (_: AngebotAntwort, form: FormData) => senden(opportunityId, form),
    LEER,
  )
  const [jaAntwort, jaAction] = useActionState(
    async (_: AngebotAntwort, form: FormData) => annehmen(opportunityId, form),
    LEER,
  )

  const entwurf = angebote.find((a) => a.zustand === "entwurf") ?? null
  const offen = angebote.filter((a) => a.zustand !== "entwurf")

  return (
    <div>
      {offen.length > 0 && (
        <ul className="mb-8 flex flex-col gap-3">
          {offen.map((a) => (
            <li key={a.id}>
              <Surface padding="sm">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-subhead">{a.referenz}</span>
                  <Pill severity={a.zustand === "angenommen" ? "attention" : "neutral"}>
                    {ANGEBOT_ZUSTAENDE[a.zustand].label}
                  </Pill>
                  <span className="type-small text-muted-foreground">
                    {OFFERS[a.kind].label} · gültig bis {a.gueltigBis}
                  </span>
                </div>
                {a.annahme && (
                  <p className="type-small text-muted-foreground mt-2 text-pretty">
                    Ja von {a.annahme.von} ({a.annahme.rolle}), {a.annahme.form}, {a.annahme.am} —{" "}
                    {a.annahme.fundstelle}
                  </p>
                )}
                {a.zustand === "gesendet" && (
                  /*
                    Das Ja verlangt dieselben vier Angaben wie eine Freigabe in
                    Gate 13: Person, Form, Datum, Fundstelle. Ein muendliches
                    Ja ist ein Ja — dann steht das da, mit dem Namen dessen,
                    der es gesagt hat.
                  */
                  <form action={jaAction} className="mt-4 flex flex-wrap items-end gap-3">
                    <input type="hidden" name="id" value={a.id} />
                    <AdminField label="Wer hat zugesagt" htmlFor={`von-${a.id}`}>
                      <AdminInput id={`von-${a.id}`} name="von" placeholder="Name" />
                    </AdminField>
                    <AdminField label="Rolle" htmlFor={`rolle-${a.id}`}>
                      <AdminInput id={`rolle-${a.id}`} name="rolle" placeholder="Geschäftsführung" />
                    </AdminField>
                    <AdminField label="Wie" htmlFor={`form-${a.id}`}>
                      <AdminSelect id={`form-${a.id}`} name="form" defaultValue="muendlich">
                        {JA_FORMEN.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </AdminSelect>
                    </AdminField>
                    <AdminField label="Wann" htmlFor={`am-${a.id}`}>
                      <AdminInput id={`am-${a.id}`} name="am" type="date" />
                    </AdminField>
                    <AdminField label="Wo steht es" htmlFor={`fund-${a.id}`} className="flex-1 basis-64">
                      <AdminInput
                        id={`fund-${a.id}`}
                        name="fundstelle"
                        placeholder="Gesprächsnotiz vom …, Postfach, unterschriebenes PDF"
                      />
                    </AdminField>
                    <button type="submit" className="cta-quiet px-4 py-2 text-sm">Als angenommen eintragen</button>
                  </form>
                )}
              </Surface>
            </li>
          ))}
        </ul>
      )}
      <Befunde antwort={jaAntwort} />

      <form action={neuAction} className="mt-2">
        {entwurf && <input type="hidden" name="id" value={entwurf.id} />}
        <div className="flex flex-wrap gap-4">
          <AdminField label="Referenz" htmlFor="a-referenz">
            {/*
              Vorbelegt mit der Lead-Referenz: Das Schema verlangt DIESELBE
              Nummer wie in der Eingangsbestaetigung, damit der Kunde nicht
              zwei hat. Aenderbar bleibt sie trotzdem — ein Angebot kann aus
              einem Vorgang ohne Anfrage entstehen.
            */}
            <AdminInput id="a-referenz" name="referenz" defaultValue={entwurf?.referenz ?? referenz} />
          </AdminField>
          <AdminField label="Angebotsart" htmlFor="a-kind">
            <AdminSelect id="a-kind" name="kind" defaultValue={entwurf?.kind ?? offerKind ?? "website"}>
              {OFFER_KINDS.map((k) => (
                <option key={k} value={k}>{OFFERS[k].label}</option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label="Sprache" htmlFor="a-sprache">
            <AdminSelect id="a-sprache" name="sprache" defaultValue={entwurf?.sprache ?? "de"}>
              {["de", "tr", "en", "ar"].map((l) => (
                <option key={l} value={l}>{l.toUpperCase()}</option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label="Gültig bis" htmlFor="a-gueltig">
            <AdminInput id="a-gueltig" name="gueltigBis" type="date" defaultValue={entwurf?.gueltigBis ?? ""} />
          </AdminField>
        </div>

        <fieldset className="mt-6">
          <legend className="type-small text-muted-foreground">
            Positionen — jede Zahl kommt aus dem Katalog. Ein eigener Betrag verlangt eine Owner-Freigabe
            mit Fundstelle; die entsteht in einem Postfach, nicht in einem Auswahlfeld.
          </legend>
          <div className="mt-4 flex flex-col gap-3">
            {(Object.keys(KATALOG_LABEL) as (keyof typeof KATALOG_LABEL)[]).map((k) => {
              const gewaehlt = entwurf?.positionen.some((p) => p.art === "katalog" && p.quelle === k) ?? false
              const betrag = betragText({ art: "katalog", was: KATALOG_LABEL[k], quelle: k })
              return (
                <label key={k} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="position"
                    value={k}
                    defaultChecked={gewaehlt}
                    className="accent-gold mt-1 size-4 shrink-0"
                  />
                  <span className="type-small text-foreground">
                    {KATALOG_LABEL[k]}
                    <span className="text-muted-foreground"> — {betrag ?? "keine Zahl hinterlegt"}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className="mt-6 flex flex-col gap-5">
          {ABSCHNITTE.map((a) => (
            <AdminField
              key={a.key}
              label={`${a.nummer} · ${a.titel}${a.pflicht ? "" : " (darf fehlen)"}`}
              htmlFor={`abschnitt_${a.key}`}
            >
              <AdminTextarea
                id={`abschnitt_${a.key}`}
                name={`abschnitt_${a.key}`}
                rows={3}
                defaultValue={entwurf?.abschnitte[a.key] ?? ""}
                placeholder={a.regel}
              />
            </AdminField>
          ))}
        </div>

        <button type="submit" className="cta-quiet mt-6 px-4 py-2 text-sm">
          {entwurf ? "Entwurf speichern" : "Entwurf anlegen"}
        </button>
      </form>
      <Befunde antwort={neuAntwort} />

      {entwurf && (
        <>
          <form action={sendenAction} className="mt-6">
            <input type="hidden" name="id" value={entwurf.id} />
            <button type="submit" className="cta-outline px-5 py-2.5 text-sm">Angebot senden</button>
            <span className="type-small text-muted-foreground ms-4">
              {seiten(entwurf)} Seite(n)
              {seiten(entwurf) > SEITEN_HINWEIS_AB
                ? " — länger als sechs. Das ist kein Fehler, sondern ein Verdacht: meistens fehlt eine Entscheidung, nicht eine Seite."
                : ""}
            </span>
          </form>
          <Befunde antwort={sendenAntwort} />
        </>
      )}
    </div>
  )
}
