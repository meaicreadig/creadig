"use client"

import { useActionState } from "react"

import {
  AdminField,
  AdminInput,
  AdminSelect,
  Pill,
  Speicherstand,
  Surface,
} from "@/components/admin/primitives"
import { JA_FORMEN } from "@/lib/angebot"
import {
  BELEG_FRAGE,
  PROJEKT_ZUSTAENDE,
  UEBERGABE_STUECKE,
  belegMoment,
  livetermin,
  terminMitAenderungen,
  type Projekt,
} from "@/lib/lieferung"
import type { LieferAntwort } from "@/app/(admin)/admin/vertrieb/actions"

/**
 * GATE 19 · Die Lieferung an einem Vorgang.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS DIESE FLAECHE ANDERS MACHT ALS EIN PROJEKTPLAN
 *
 * Sie zeigt KEIN eingetragenes Livedatum. Der Termin steht hier als
 * gerechneter Wert oder gar nicht — „vier Wochen ab Materialeingang" ist
 * eine oeffentliche Zusage, und ein Feld daneben waere eine zweite Wahrheit
 * gegen sie.
 *
 * Und sie zeigt die vier Uebergabestuecke als das, was sie sind: Zusagen aus
 * dem FAQ, nicht Punkte einer internen Liste.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DER SATZ NACH DER ABNAHME
 *
 * Sobald die Abnahme steht, erscheint die Frage nach der schriftlichen
 * Freigabe. Sie ist der Grund, warum drei Kundennamen heute nirgends stehen
 * — und der Moment, sie zu stellen, ist genau hier, weil der Kunde gerade
 * bestaetigt hat, dass es funktioniert.
 *
 * Es gibt dafuer ausdruecklich KEINEN Knopf. Eine Freigabe entsteht in
 * `lib/proof.ts`, aus einem Dokument, das ein Mensch unterschrieben hat.
 */

/*
 * DER ANFANGSZUSTAND — und warum er an seiner IDENTITAET erkannt wird.
 *
 * `LEER` traegt `ok: true`, weil der Typ nur zwei Zustaende kennt. „Noch
 * nichts abgeschickt" sieht darin aus wie „hat geklappt" — und die
 * Speicheranzeige haette beim blossen Oeffnen der Seite „Gespeichert."
 * gemeldet.
 *
 * `useActionState` gibt genau dieses Objekt zurueck, bis eine Aktion
 * gelaufen ist. Der Vergleich auf Referenzgleichheit unterscheidet die
 * beiden Faelle deshalb sicher, ohne den Antworttyp der Server-Aktion um
 * einen dritten Zustand zu erweitern.
 */
const LEER: LieferAntwort = { ok: true, maengel: [] }

/*
 * `Maengel` ist durch `Speicherstand` ersetzt — dieselbe Luecke wie in der
 * Angebots-Mappe: nur der Fehler wurde gemeldet, Erfolg und Wartezeit nicht.
 */

export function LieferungMappe({
  opportunityId,
  angenommeneAngebote,
  projekte,
  starten,
  material,
  abnahme,
  uebergabe,
}: {
  opportunityId: string
  angenommeneAngebote: { id: string; referenz: string }[]
  projekte: Projekt[]
  starten: (opportunityId: string, form: FormData) => Promise<LieferAntwort>
  material: (opportunityId: string, form: FormData) => Promise<LieferAntwort>
  abnahme: (opportunityId: string, form: FormData) => Promise<LieferAntwort>
  uebergabe: (opportunityId: string, form: FormData) => Promise<LieferAntwort>
}) {
  const [startA, startAction, startW] = useActionState(
    async (_: LieferAntwort, f: FormData) => starten(opportunityId, f), LEER)
  const [matA, matAction, matW] = useActionState(
    async (_: LieferAntwort, f: FormData) => material(opportunityId, f), LEER)
  const [abnA, abnAction, abnW] = useActionState(
    async (_: LieferAntwort, f: FormData) => abnahme(opportunityId, f), LEER)
  const [uebA, uebAction, uebW] = useActionState(
    async (_: LieferAntwort, f: FormData) => uebergabe(opportunityId, f), LEER)

  const offen = angenommeneAngebote.filter((a) => !projekte.some((p) => p.offerId === a.id))

  return (
    <div>
      {projekte.length === 0 && offen.length === 0 && (
        <p className="type-small text-muted-foreground text-pretty">
          Kein angenommenes Angebot. Ein Projekt entsteht aus einem Ja — ohne das wäre sein Umfang
          das, was zuletzt jemand gesagt hat.
        </p>
      )}

      {offen.length > 0 && (
        <form action={startAction} className="flex flex-wrap items-end gap-4">
          <AdminField label="Projekt aufsetzen aus" htmlFor="offerId">
            <AdminSelect id="offerId" name="offerId" defaultValue={offen[0].id}>
              {offen.map((a) => (
                <option key={a.id} value={a.id}>{a.referenz}</option>
              ))}
            </AdminSelect>
          </AdminField>
          <button type="submit" className="cta-quiet px-4 py-2 text-sm">Aufsetzen</button>
        </form>
      )}
      <Speicherstand
        wartet={startW}
        ok={startA === LEER ? null : startA.ok}
        punkte={startA.maengel.map((x) => ({ wo: x.bereich, satz: x.satz }))}
        erfolgssatz="Projekt aufgesetzt."
      />

      <ul className="mt-6 flex flex-col gap-4">
        {projekte.map((p) => {
          const basis = livetermin(p.materialEingang)
          const termin = terminMitAenderungen(p.materialEingang, p.aenderungen)
          return (
            <li key={p.id}>
              <Surface padding="sm">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-subhead">{PROJEKT_ZUSTAENDE[p.zustand].label}</span>
                  <Pill severity={p.zustand === "uebergeben" ? "attention" : "neutral"}>
                    {PROJEKT_ZUSTAENDE[p.zustand].was}
                  </Pill>
                </div>

                <p className="type-small text-muted-foreground mt-3 text-pretty">
                  {termin ? (
                    <>
                      Livetermin <span className="text-foreground">{termin}</span> — gerechnet aus dem
                      Materialeingang {p.materialEingang}
                      {basis && termin !== basis ? `, verschoben von ${basis} durch zugestimmte Änderungen` : ""}.
                    </>
                  ) : (
                    <>
                      Kein Termin: Das Material ist nicht da. Die Zusage lautet „vier Wochen ab
                      Materialeingang&ldquo; — ohne ihn läuft keine Frist.
                    </>
                  )}
                </p>

                {p.zustand === "aufgesetzt" && (
                  <form action={matAction} className="mt-4 flex flex-wrap items-end gap-3">
                    <input type="hidden" name="id" value={p.id} />
                    <AdminField label="Material eingetroffen am" htmlFor={`am-${p.id}`}>
                      <AdminInput id={`am-${p.id}`} name="am" type="date" />
                    </AdminField>
                    <button type="submit" className="cta-quiet px-4 py-2 text-sm">Frist starten</button>
                  </form>
                )}

                {p.zustand === "laeuft" && (
                  <form action={abnAction} className="mt-4 flex flex-wrap items-end gap-3">
                    <input type="hidden" name="id" value={p.id} />
                    <AdminField label="Abnahme durch" htmlFor={`avon-${p.id}`}>
                      <AdminInput id={`avon-${p.id}`} name="von" placeholder="Name" />
                    </AdminField>
                    <AdminField label="Rolle" htmlFor={`arolle-${p.id}`}>
                      <AdminInput id={`arolle-${p.id}`} name="rolle" placeholder="Geschäftsführung" />
                    </AdminField>
                    <AdminField label="Wie" htmlFor={`aform-${p.id}`}>
                      <AdminSelect id={`aform-${p.id}`} name="form" defaultValue="e-mail">
                        {JA_FORMEN.map((f) => <option key={f} value={f}>{f}</option>)}
                      </AdminSelect>
                    </AdminField>
                    <AdminField label="Wann" htmlFor={`aam-${p.id}`}>
                      <AdminInput id={`aam-${p.id}`} name="am" type="date" />
                    </AdminField>
                    <AdminField label="Wo steht es" htmlFor={`afund-${p.id}`} className="flex-1 basis-64">
                      <AdminInput id={`afund-${p.id}`} name="fundstelle" placeholder="Postfach, Protokoll, unterschriebenes PDF" />
                    </AdminField>
                    <button type="submit" className="cta-quiet px-4 py-2 text-sm">Abnahme eintragen</button>
                  </form>
                )}

                {p.abnahme && (
                  <p className="type-small text-muted-foreground mt-3 text-pretty">
                    Abgenommen von {p.abnahme.von} ({p.abnahme.rolle}), {p.abnahme.form}, {p.abnahme.am} —{" "}
                    {p.abnahme.fundstelle}
                  </p>
                )}

                {belegMoment(p) && (
                  <Surface padding="sm" className="mt-4">
                    <p className="type-small text-foreground/90 text-pretty">{BELEG_FRAGE}</p>
                  </Surface>
                )}

                {p.zustand === "abgenommen" && (
                  <form action={uebAction} className="mt-5">
                    <input type="hidden" name="id" value={p.id} />
                    <p className="type-small text-muted-foreground text-pretty">
                      Was die Seite verspricht: &bdquo;Code, Inhalte, Zugänge und Domain — wir händigen aus,
                      was wir haben.&ldquo;
                    </p>
                    <div className="mt-4 flex flex-col gap-4">
                      {UEBERGABE_STUECKE.map((s) => (
                        <div key={s.key} className="flex flex-wrap items-end gap-3">
                          <AdminField label={`${s.label} — am`} htmlFor={`am_${s.key}_${p.id}`}>
                            <AdminInput id={`am_${s.key}_${p.id}`} name={`am_${s.key}`} type="date" />
                          </AdminField>
                          <AdminField label="wie" htmlFor={`wie_${s.key}_${p.id}`} className="flex-1 basis-64">
                            <AdminInput id={`wie_${s.key}_${p.id}`} name={`wie_${s.key}`} placeholder={s.was} />
                          </AdminField>
                        </div>
                      ))}
                    </div>
                    <button type="submit" className="cta-quiet mt-5 px-4 py-2 text-sm">Übergabe eintragen</button>
                  </form>
                )}

                {p.zustand === "uebergeben" && (
                  <ul className="mt-3 flex flex-col gap-1">
                    {UEBERGABE_STUECKE.map((s) => {
                      const e = p.uebergabe[s.key]
                      return (
                        <li key={s.key} className="type-small text-muted-foreground">
                          {s.label}: {e ? `${e.am} — ${e.wie}` : "—"}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </Surface>
            </li>
          )
        })}
      </ul>
      <Speicherstand
        wartet={matW}
        ok={matA === LEER ? null : matA.ok}
        punkte={matA.maengel.map((x) => ({ wo: x.bereich, satz: x.satz }))}
        erfolgssatz="Gespeichert."
      />
      <Speicherstand
        wartet={abnW}
        ok={abnA === LEER ? null : abnA.ok}
        punkte={abnA.maengel.map((x) => ({ wo: x.bereich, satz: x.satz }))}
        erfolgssatz="Abnahme festgehalten."
      />
      <Speicherstand
        wartet={uebW}
        ok={uebA === LEER ? null : uebA.ok}
        punkte={uebA.maengel.map((x) => ({ wo: x.bereich, satz: x.satz }))}
        erfolgssatz="Übergabe festgehalten."
      />
    </div>
  )
}
