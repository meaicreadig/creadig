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
import { adminTexte } from "@/lib/admin-i18n"
import type { AdminSprache } from "@/lib/admin-i18n/sprache"
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
 * ADM-01: Beschriftungen aus `adminTexte(sprache)`.
 */

const LEER: LieferAntwort = { ok: true, maengel: [] }

export function LieferungMappe({
  opportunityId,
  angenommeneAngebote,
  projekte,
  sprache,
  starten,
  material,
  abnahme,
  uebergabe,
}: {
  opportunityId: string
  angenommeneAngebote: { id: string; referenz: string }[]
  projekte: Projekt[]
  sprache: AdminSprache
  starten: (opportunityId: string, form: FormData) => Promise<LieferAntwort>
  material: (opportunityId: string, form: FormData) => Promise<LieferAntwort>
  abnahme: (opportunityId: string, form: FormData) => Promise<LieferAntwort>
  uebergabe: (opportunityId: string, form: FormData) => Promise<LieferAntwort>
}) {
  const t = adminTexte(sprache).lieferungMappe
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
          {t.keinAngebot}
        </p>
      )}

      {offen.length > 0 && (
        <form action={startAction} className="flex flex-wrap items-end gap-4">
          <AdminField label={t.projektAus} htmlFor="offerId">
            <AdminSelect id="offerId" name="offerId" defaultValue={offen[0].id}>
              {offen.map((a) => (
                <option key={a.id} value={a.id}>{a.referenz}</option>
              ))}
            </AdminSelect>
          </AdminField>
          <button type="submit" className="cta-quiet px-4 py-2 text-sm">{t.aufsetzen}</button>
        </form>
      )}
      <Speicherstand
        wartet={startW}
        ok={startA === LEER ? null : startA.ok}
        punkte={startA.maengel.map((x) => ({ wo: x.bereich, satz: x.satz }))}
        erfolgssatz={t.projektAufgesetzt}
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
                      {t.livetermin(termin, p.materialEingang ?? "")}
                      {basis && termin !== basis ? t.verschoben(basis) : ""}.
                    </>
                  ) : (
                    <>{t.keinTermin}</>
                  )}
                </p>

                {p.zustand === "aufgesetzt" && (
                  <form action={matAction} className="mt-4 flex flex-wrap items-end gap-3">
                    <input type="hidden" name="id" value={p.id} />
                    <AdminField label={t.materialAm} htmlFor={`am-${p.id}`}>
                      <AdminInput id={`am-${p.id}`} name="am" type="date" />
                    </AdminField>
                    <button type="submit" className="cta-quiet px-4 py-2 text-sm">{t.fristStarten}</button>
                  </form>
                )}

                {p.zustand === "laeuft" && (
                  <form action={abnAction} className="mt-4 flex flex-wrap items-end gap-3">
                    <input type="hidden" name="id" value={p.id} />
                    <AdminField label={t.abnahmeDurch} htmlFor={`avon-${p.id}`}>
                      <AdminInput id={`avon-${p.id}`} name="von" placeholder={t.namePlatzhalter} />
                    </AdminField>
                    <AdminField label={t.rolle} htmlFor={`arolle-${p.id}`}>
                      <AdminInput id={`arolle-${p.id}`} name="rolle" placeholder={t.rollePlatzhalter} />
                    </AdminField>
                    <AdminField label={t.wie} htmlFor={`aform-${p.id}`}>
                      <AdminSelect id={`aform-${p.id}`} name="form" defaultValue="e-mail">
                        {JA_FORMEN.map((f) => <option key={f} value={f}>{f}</option>)}
                      </AdminSelect>
                    </AdminField>
                    <AdminField label={t.wann} htmlFor={`aam-${p.id}`}>
                      <AdminInput id={`aam-${p.id}`} name="am" type="date" />
                    </AdminField>
                    <AdminField label={t.woStehtEs} htmlFor={`afund-${p.id}`} className="flex-1 basis-64">
                      <AdminInput id={`afund-${p.id}`} name="fundstelle" placeholder={t.fundstellePlatzhalter} />
                    </AdminField>
                    <button type="submit" className="cta-quiet px-4 py-2 text-sm">{t.abnahmeEintragen}</button>
                  </form>
                )}

                {p.abnahme && (
                  <p className="type-small text-muted-foreground mt-3 text-pretty">
                    {t.abgenommenVon(p.abnahme.von, p.abnahme.rolle, p.abnahme.form, p.abnahme.am, p.abnahme.fundstelle)}
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
                      {t.uebergabeVersprechen}
                    </p>
                    <div className="mt-4 flex flex-col gap-4">
                      {UEBERGABE_STUECKE.map((s) => (
                        <div key={s.key} className="flex flex-wrap items-end gap-3">
                          <AdminField label={t.stueckAm(s.label)} htmlFor={`am_${s.key}_${p.id}`}>
                            <AdminInput id={`am_${s.key}_${p.id}`} name={`am_${s.key}`} type="date" />
                          </AdminField>
                          <AdminField label={t.wieKlein} htmlFor={`wie_${s.key}_${p.id}`} className="flex-1 basis-64">
                            <AdminInput id={`wie_${s.key}_${p.id}`} name={`wie_${s.key}`} placeholder={s.was} />
                          </AdminField>
                        </div>
                      ))}
                    </div>
                    <button type="submit" className="cta-quiet mt-5 px-4 py-2 text-sm">{t.uebergabeEintragen}</button>
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
        erfolgssatz={t.gespeichert}
      />
      <Speicherstand
        wartet={abnW}
        ok={abnA === LEER ? null : abnA.ok}
        punkte={abnA.maengel.map((x) => ({ wo: x.bereich, satz: x.satz }))}
        erfolgssatz={t.abnahmeFestgehalten}
      />
      <Speicherstand
        wartet={uebW}
        ok={uebA === LEER ? null : uebA.ok}
        punkte={uebA.maengel.map((x) => ({ wo: x.bereich, satz: x.satz }))}
        erfolgssatz={t.uebergabeFestgehalten}
      />
    </div>
  )
}
