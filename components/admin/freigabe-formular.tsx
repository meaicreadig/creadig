"use client"

import { useActionState, useState } from "react"

import { freigabeErfassen, type FreigabeZustand } from "@/app/(admin)/admin/beleg/actions"
import { AdminField, AdminInput, AdminSelect } from "@/components/admin/primitives"

/**
 * ADM-05 · A13 — eine erteilte Erlaubnis festhalten.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM JEDES FELD PFLICHT IST
 *
 * „Der Kunde hat zugestimmt" ist keine Freigabe. Eine Freigabe hat einen
 * Menschen, eine Form, ein Datum und eine Fundstelle — und wenn eine dieser
 * vier Spalten fehlt, fehlt der Beleg. Das Formular verlangt sie deshalb
 * alle, und es sagt bei jeder einzeln, was fehlt: Ein Formular, das nur
 * „Bitte alle Felder ausfuellen" sagt, laesst den Menschen suchen.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DIE FORM DEN UMFANG BEGRENZT
 *
 * Eine oeffentliche Bewertung deckt ein ZITAT — der Mensch hat es selbst
 * geschrieben, die Adresse ist die Fundstelle. Sie deckt nicht das Logo auf
 * der Startseite. Ohne diese Grenze erzeugte die freundlichste Quelle die
 * weitreichendste Erlaubnis. Die Umfaenge, die eine Form nicht tragen kann,
 * sind deshalb gesperrt und nennen den Grund (`FORM_SCOPES` in `lib/proof.ts`).
 */
export type FreigabeTexte = {
  organisation: string
  organisationWaehlen: string
  name: string
  rolle: string
  firma: string
  form: string
  datum: string
  umfaenge: string
  umfaengeHinweis: string
  fundstelle: string
  fundstelleHinweis: string
  erfassen: string
  erfassenLaeuft: string
  erfasst: string
  schonErfasst: string
  nichtErfasst: string
  fehler: Record<string, string>
  scope: Record<string, string>
  formWert: Record<string, string>
  formTraegtNichtVorlage: string
}

export function FreigabeFormular({
  organisationen,
  formen,
  umfaenge,
  formDeckt,
  t,
}: {
  organisationen: { id: string; name: string }[]
  formen: string[]
  umfaenge: string[]
  /** Welche Umfaenge jede Form tragen kann — aus `lib/proof.ts`, nicht erfunden. */
  formDeckt: Record<string, string[]>
  /* Nur Zeichenketten: Textfunktionen lassen sich nicht an eine Client-Komponente übergeben. */
  t: FreigabeTexte
}) {
  const [zustand, absenden, laeuft] = useActionState<FreigabeZustand, FormData>(freigabeErfassen, {
    fehler: [],
    werte: {},
  })
  const hat = (feld: string) => zustand.fehler.includes(feld as never)
  const w = zustand.werte
  /*
   * Die gewaehlte Form steuert sofort, welche Umfaenge waehlbar sind — ohne
   * Absenden. Ein Haken, der erst nach dem Absenden verschwindet, hat den
   * Menschen schon glauben lassen, er habe ihn.
   *
   * Die Sperre hier ist Hoeflichkeit, keine Sicherung: `FORM_SCOPES` gilt
   * serverseitig noch einmal (`gedeckteScopes`), und dort ist sie bindend.
   */
  const [gewaehlteForm, setGewaehlteForm] = useState(w.form ?? "")
  const deckt = formDeckt[gewaehlteForm] ?? umfaenge

  return (
    <form action={absenden} className="mt-5 flex max-w-2xl flex-col gap-5" noValidate>
      {zustand.erfasst && (
        <p role="status" className="type-small text-gold-text">
          {zustand.erfasst === "neu" ? t.erfasst : t.schonErfasst}
        </p>
      )}

      <div className="flex flex-wrap gap-4">
        <AdminField label={t.organisation} htmlFor="organisation" className="flex-1 basis-64">
          <AdminSelect
            id="organisation"
            name="organisation"
            defaultValue={w.organisation ?? ""}
            aria-invalid={hat("organisation") || undefined}
            aria-describedby={hat("organisation") ? "fehler-organisation" : undefined}
          >
            <option value="">{t.organisationWaehlen}</option>
            {organisationen.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </AdminSelect>
          {hat("organisation") && (
            <p id="fehler-organisation" className="text-destructive mt-1.5 text-xs">
              {t.fehler.organisation}
            </p>
          )}
        </AdminField>

        <AdminField label={t.form} htmlFor="form" className="flex-1 basis-64">
          <AdminSelect
            id="form"
            name="form"
            value={gewaehlteForm}
            onChange={(e) => setGewaehlteForm(e.target.value)}
            aria-invalid={hat("form") || undefined}
            aria-describedby={hat("form") ? "fehler-form" : undefined}
          >
            <option value="">{t.organisationWaehlen}</option>
            {formen.map((f) => (
              <option key={f} value={f}>
                {t.formWert[f] ?? f}
              </option>
            ))}
          </AdminSelect>
          {hat("form") && (
            <p id="fehler-form" className="text-destructive mt-1.5 text-xs">
              {t.fehler.form}
            </p>
          )}
        </AdminField>
      </div>

      <div className="flex flex-wrap gap-4">
        {(
          [
            ["name", t.name, w.name],
            ["rolle", t.rolle, w.rolle],
            ["firma", t.firma, w.firma],
          ] as const
        ).map(([feld, label, wert]) => (
          <AdminField key={feld} label={label} htmlFor={feld} className="flex-1 basis-48">
            <AdminInput
              id={feld}
              name={feld}
              defaultValue={wert ?? ""}
              aria-invalid={hat(feld) || undefined}
              aria-describedby={hat(feld) ? `fehler-${feld}` : undefined}
            />
            {hat(feld) && (
              <p id={`fehler-${feld}`} className="text-destructive mt-1.5 text-xs">
                {t.fehler[feld]}
              </p>
            )}
          </AdminField>
        ))}
      </div>

      <AdminField label={t.datum} htmlFor="datum" className="max-w-56">
        <AdminInput
          id="datum"
          name="datum"
          type="date"
          defaultValue={w.datum ?? ""}
          aria-invalid={hat("datum") || undefined}
          aria-describedby={hat("datum") ? "fehler-datum" : undefined}
        />
        {hat("datum") && (
          <p id="fehler-datum" className="text-destructive mt-1.5 text-xs">
            {t.fehler.datum}
          </p>
        )}
      </AdminField>

      <fieldset aria-describedby="umfaenge-hinweis">
        <legend className="text-meta text-muted-foreground">{t.umfaenge}</legend>
        <p id="umfaenge-hinweis" className="type-small text-muted-foreground mt-1">
          {t.umfaengeHinweis}
        </p>
        <div className="mt-2 flex flex-col gap-2">
          {umfaenge.map((u) => {
            const gesperrt = Boolean(gewaehlteForm) && !deckt.includes(u)
            return (
              <label key={u} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  name="umfaenge"
                  value={u}
                  disabled={gesperrt}
                  defaultChecked={zustand.umfaenge?.includes(u) ?? false}
                  className="accent-gold mt-0.5 size-4 disabled:opacity-50"
                />
                <span className={gesperrt ? "text-muted-foreground" : undefined}>
                  {t.scope[u] ?? u}
                  {gesperrt && (
                    <span className="text-muted-foreground block text-xs">
                      {t.formTraegtNichtVorlage
                        .replace("{form}", t.formWert[gewaehlteForm] ?? gewaehlteForm)
                        .replace("{umfang}", t.scope[u] ?? u)}
                    </span>
                  )}
                </span>
              </label>
            )
          })}
        </div>
        {hat("umfaenge") && (
          <p className="text-destructive mt-1.5 text-xs">{t.fehler.umfaenge}</p>
        )}
      </fieldset>

      <AdminField label={t.fundstelle} htmlFor="fundstelle">
        <AdminInput
          id="fundstelle"
          name="fundstelle"
          defaultValue={w.fundstelle ?? ""}
          aria-invalid={hat("fundstelle") || undefined}
          aria-describedby={hat("fundstelle") ? "fehler-fundstelle" : "hinweis-fundstelle"}
        />
        <p id="hinweis-fundstelle" className="type-small text-muted-foreground mt-1.5">
          {t.fundstelleHinweis}
        </p>
        {hat("fundstelle") && (
          <p id="fehler-fundstelle" className="text-destructive mt-1.5 text-xs">
            {t.fehler.fundstelle}
          </p>
        )}
      </AdminField>

      <button
        type="submit"
        disabled={laeuft}
        aria-busy={laeuft || undefined}
        className="cta-outline min-h-11 self-start px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
      >
        {laeuft ? t.erfassenLaeuft : t.erfassen}
      </button>
    </form>
  )
}
