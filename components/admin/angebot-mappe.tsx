"use client"

import { useActionState } from "react"

import {
  AdminField,
  AdminInput,
  AdminSelect,
  AdminTextarea,
  Pill,
  Speicherstand,
  Surface,
} from "@/components/admin/primitives"
import {
  ABSCHNITTE,
  ANGEBOT_ZUSTAENDE,
  JA_FORMEN,
  KATALOG_LABEL,
  betragText,
  seiten,
  SEITEN_HINWEIS_AB,
  type Angebot,
} from "@/lib/angebot"
import { adminTexte } from "@/lib/admin-i18n"
import { befundZeilen } from "@/lib/admin-i18n/befund"
import type { AdminSprache } from "@/lib/admin-i18n/sprache"
import { OFFER_KINDS, OFFERS } from "@/lib/offer-readiness"
import type { AngebotAntwort } from "@/app/(admin)/admin/vertrieb/actions"

/**
 * GATE 17 · Die Angebotsmappe an einem Vorgang.
 *
 * ADM-01: Beschriftungen aus `adminTexte(sprache)` — Client darf Server-Props
 * mit Funktionen nicht entgegennehmen, deshalb die Sprache und das Wörterbuch hier.
 */

const LEER: AngebotAntwort = { ok: true, befunde: [] }

export function AngebotMappe({
  opportunityId,
  referenz,
  offerKind,
  angebote,
  sprache,
  speichern,
  senden,
  annehmen,
}: {
  opportunityId: string
  referenz: string
  offerKind: string | null
  angebote: Angebot[]
  sprache: AdminSprache
  speichern: (opportunityId: string, form: FormData) => Promise<AngebotAntwort>
  senden: (opportunityId: string, form: FormData) => Promise<AngebotAntwort>
  annehmen: (opportunityId: string, form: FormData) => Promise<AngebotAntwort>
}) {
  const texte = adminTexte(sprache)
  const t = texte.angebotMappe
  const [neuAntwort, neuAction, neuWartet] = useActionState(
    async (_: AngebotAntwort, form: FormData) => speichern(opportunityId, form),
    LEER,
  )
  const [sendenAntwort, sendenAction, sendenWartet] = useActionState(
    async (_: AngebotAntwort, form: FormData) => senden(opportunityId, form),
    LEER,
  )
  const [jaAntwort, jaAction, jaWartet] = useActionState(
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
                    {OFFERS[a.kind].label} · {t.gueltigBis} {a.gueltigBis}
                  </span>
                </div>
                {a.annahme && (
                  <p className="type-small text-muted-foreground mt-2 text-pretty">
                    {t.jaVon(a.annahme.von, a.annahme.rolle, a.annahme.form, a.annahme.am, a.annahme.fundstelle)}
                  </p>
                )}
                {a.zustand === "gesendet" && (
                  <form action={jaAction} className="mt-4 flex flex-wrap items-end gap-3">
                    <input type="hidden" name="id" value={a.id} />
                    <AdminField label={t.werHatZugesagt} htmlFor={`von-${a.id}`}>
                      <AdminInput id={`von-${a.id}`} name="von" placeholder={t.namePlatzhalter} />
                    </AdminField>
                    <AdminField label={t.rolle} htmlFor={`rolle-${a.id}`}>
                      <AdminInput id={`rolle-${a.id}`} name="rolle" placeholder={t.rollePlatzhalter} />
                    </AdminField>
                    <AdminField label={t.wie} htmlFor={`form-${a.id}`}>
                      <AdminSelect id={`form-${a.id}`} name="form" defaultValue="muendlich">
                        {JA_FORMEN.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </AdminSelect>
                    </AdminField>
                    <AdminField label={t.wann} htmlFor={`am-${a.id}`}>
                      <AdminInput id={`am-${a.id}`} name="am" type="date" />
                    </AdminField>
                    <AdminField label={t.woStehtEs} htmlFor={`fund-${a.id}`} className="flex-1 basis-64">
                      <AdminInput
                        id={`fund-${a.id}`}
                        name="fundstelle"
                        placeholder={t.fundstellePlatzhalter}
                      />
                    </AdminField>
                    <button type="submit" className="cta-quiet px-4 py-2 text-sm">{t.alsAngenommen}</button>
                  </form>
                )}
              </Surface>
            </li>
          ))}
        </ul>
      )}
      <Speicherstand
        wartet={jaWartet}
        ok={jaAntwort === LEER ? null : jaAntwort.ok}
        punkte={befundZeilen(jaAntwort.befunde, texte)}
        erfolgssatz={t.annahmeFestgehalten}
      />

      <form action={neuAction} className="mt-2">
        {entwurf && <input type="hidden" name="id" value={entwurf.id} />}
        <div className="flex flex-wrap gap-4">
          <AdminField label={t.referenz} htmlFor="a-referenz">
            <AdminInput id="a-referenz" name="referenz" defaultValue={entwurf?.referenz ?? referenz} />
          </AdminField>
          <AdminField label={t.angebotsart} htmlFor="a-kind">
            <AdminSelect id="a-kind" name="kind" defaultValue={entwurf?.kind ?? offerKind ?? "website"}>
              {OFFER_KINDS.map((k) => (
                <option key={k} value={k}>{OFFERS[k].label}</option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label={t.sprache} htmlFor="a-sprache">
            <AdminSelect id="a-sprache" name="sprache" defaultValue={entwurf?.sprache ?? "de"}>
              {["de", "tr", "en", "ar"].map((l) => (
                <option key={l} value={l}>{l.toUpperCase()}</option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label={t.gueltigBis} htmlFor="a-gueltig">
            <AdminInput id="a-gueltig" name="gueltigBis" type="date" defaultValue={entwurf?.gueltigBis ?? ""} />
          </AdminField>
        </div>

        <fieldset className="mt-6">
          <legend className="type-small text-muted-foreground">
            {t.positionenLegende}
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
                    <span className="text-muted-foreground"> — {betrag ?? t.keineZahl}</span>
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
              label={`${a.nummer} · ${a.titel}${a.pflicht ? "" : t.darfFehlen}`}
              htmlFor={`abschnitt_${a.key}`}
            >
              <AdminTextarea
                id={`abschnitt_${a.key}`}
                name={`abschnitt_${a.key}`}
                rows={3}
                defaultValue={entwurf?.abschnitte[a.key] ?? ""}
                /* Die Regel ist eine Anweisung dieses Hauses — übersetzt. Die Überschrift daneben nicht. */
                placeholder={texte.befunde.abschnittRegel[a.key as keyof typeof texte.befunde.abschnittRegel] ?? a.regel}
              />
            </AdminField>
          ))}
        </div>

        <button type="submit" className="cta-quiet mt-6 px-4 py-2 text-sm">
          {entwurf ? t.entwurfSpeichern : t.entwurfAnlegen}
        </button>
      </form>
      <Speicherstand
        wartet={neuWartet}
        ok={neuAntwort === LEER ? null : neuAntwort.ok}
        punkte={befundZeilen(neuAntwort.befunde, texte)}
        erfolgssatz={t.entwurfGespeichert}
      />

      {entwurf && (
        <>
          <form action={sendenAction} className="mt-6">
            <input type="hidden" name="id" value={entwurf.id} />
            <button type="submit" className="cta-outline px-5 py-2.5 text-sm">{t.angebotSenden}</button>
            <span className="type-small text-muted-foreground ms-4">
              {t.seiten(seiten(entwurf))}
              {seiten(entwurf) > SEITEN_HINWEIS_AB ? t.seitenHinweis : ""}
            </span>
          </form>
          <Speicherstand
            wartet={sendenWartet}
            ok={sendenAntwort === LEER ? null : sendenAntwort.ok}
            punkte={befundZeilen(sendenAntwort.befunde, texte)}
            erfolgssatz={t.angebotGesendet}
          />
        </>
      )}
    </div>
  )
}
