"use client"

import { useActionState, useEffect } from "react"

import { anfrageErfassen, type ErfassenZustand } from "@/app/(admin)/admin/vertrieb/actions"
import { AdminField, AdminInput, AdminSelect } from "@/components/admin/primitives"
import type { AdminTexte } from "@/lib/admin-i18n"

/**
 * ADM-03 · A03 — eine Anfrage von Hand erfassen.
 *
 * Fehler kommen feldgenau zurück und sind mit dem Feld verbunden
 * (`aria-describedby`, `aria-invalid`); was eingetippt war, bleibt stehen.
 * Der Knopf ist während des Speicherns gesperrt — und selbst ein zweites
 * Absenden legt serverseitig keine zweite Anfrage an (Idempotenzschlüssel).
 */
export type ErfassenTexte = {
  erfassen: AdminTexte["erfassen"]
  anfrage: Pick<AdminTexte["anfrage"], "nichtGespeichert" | "name" | "betrieb" | "email" | "telefon" | "nachricht" | "verantwortlich">
  formular: AdminTexte["formular"]
  niemand: string
}

export function AnfrageErfassenFormular({
  idempotenz,
  quellen,
  rollen,
  sprache,
  t,
}: {
  idempotenz: string
  quellen: { wert: string; name: string }[]
  rollen: { wert: string; name: string }[]
  sprache: string
  /* Nur Zeichenketten: Textfunktionen lassen sich nicht an eine Client-Komponente übergeben. */
  t: ErfassenTexte
}) {
  const [zustand, absenden, laeuft] = useActionState<ErfassenZustand, FormData>(anfrageErfassen, { fehler: [], werte: {} })
  useEffect(() => {
    if (!zustand.angelegt) return
    /*
     * Volle Navigation zur neuen Anfrage. Gemessen 17.09.2026: Solange unter
     * /admin/vertrieb eine `loading.tsx` lag, kam `router.push` nach dieser
     * Action oft nicht an. Die Ursache ist entfernt (Gate check-admin-antwort
     * §5); die volle Navigation bleibt, weil sie auch künftige Lade-Grenzen
     * übersteht und nach dem Anlegen ohnehin eine neue Seite folgt.
     */
    window.location.assign(`/admin/vertrieb/anfragen/${zustand.angelegt}`)
  }, [zustand.angelegt])
  const w = zustand.werte
  const hat = (f: ErfassenZustand["fehler"][number]) => zustand.fehler.includes(f)

  return (
    <form action={absenden} className="flex max-w-2xl flex-col gap-5" noValidate>
      <input type="hidden" name="idempotenz" value={w.idempotenz || idempotenz} />
      <input type="hidden" name="sprache" value={w.sprache || sprache} />

      {zustand.fehler.length > 0 ? (
        <p role="alert" className="border-destructive/40 text-destructive border-s-2 py-1 ps-4 text-sm">
          {t.anfrage.nichtGespeichert}
        </p>
      ) : null}

      <AdminField label={t.erfassen.quelle} htmlFor="quelle">
        <AdminSelect id="quelle" name="quelle" defaultValue={w.quelle || "telefon"}>
          {quellen.map((q) => (
            <option key={q.wert} value={q.wert}>
              {q.name}
            </option>
          ))}
        </AdminSelect>
      </AdminField>

      <AdminField label={`${t.anfrage.name} (${t.formular.pflicht})`} htmlFor="name">
        <AdminInput
          id="name"
          name="name"
          defaultValue={w.name}
          autoComplete="off"
          aria-invalid={hat("name") || undefined}
          aria-describedby={hat("name") ? "name-fehler" : undefined}
        />
        {hat("name") ? <p id="name-fehler" className="text-destructive mt-1 text-sm">{t.erfassen.fehlerName}</p> : null}
      </AdminField>

      <AdminField label={`${t.anfrage.betrieb} (${t.formular.optional})`} htmlFor="betrieb">
        <AdminInput id="betrieb" name="betrieb" defaultValue={w.betrieb} autoComplete="off" />
      </AdminField>

      <fieldset className="flex flex-col gap-4" aria-describedby="kontakt-hinweis">
        <legend className="text-meta text-muted-foreground">{t.erfassen.kontaktHinweis}</legend>
        <p id="kontakt-hinweis" className="sr-only">{t.erfassen.kontaktHinweis}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label={t.anfrage.email} htmlFor="email">
            <AdminInput
              id="email"
              name="email"
              type="email"
              defaultValue={w.email}
              autoComplete="off"
              aria-invalid={hat("mail") || hat("kontakt") || undefined}
              aria-describedby={hat("mail") ? "mail-fehler" : hat("kontakt") ? "kontakt-fehler" : undefined}
            />
          </AdminField>
          <AdminField label={t.anfrage.telefon} htmlFor="telefon">
            <AdminInput
              id="telefon"
              name="telefon"
              type="tel"
              defaultValue={w.telefon}
              autoComplete="off"
              aria-invalid={hat("kontakt") || undefined}
              aria-describedby={hat("kontakt") ? "kontakt-fehler" : undefined}
            />
          </AdminField>
        </div>
        {hat("kontakt") ? <p id="kontakt-fehler" className="text-destructive text-sm">{t.erfassen.fehlerKontakt}</p> : null}
        {hat("mail") ? <p id="mail-fehler" className="text-destructive text-sm">{t.erfassen.fehlerMail}</p> : null}
      </fieldset>

      <AdminField label={t.anfrage.nachricht} htmlFor="nachricht">
        <textarea
          id="nachricht"
          name="nachricht"
          defaultValue={w.nachricht}
          rows={5}
          aria-describedby="nachricht-hinweis"
          className="border-line bg-background focus-visible:ring-gold w-full rounded-sm border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
        />
        <p id="nachricht-hinweis" className="text-muted-foreground mt-1 text-xs">{t.erfassen.nachrichtHinweis}</p>
      </AdminField>

      <AdminField label={t.anfrage.verantwortlich} htmlFor="verantwortlich">
        <AdminSelect id="verantwortlich" name="verantwortlich" defaultValue={w.verantwortlich ?? ""}>
          <option value="">{t.niemand}</option>
          {rollen.map((r) => (
            <option key={r.wert} value={r.wert}>
              {r.name}
            </option>
          ))}
        </AdminSelect>
      </AdminField>

      <button type="submit" disabled={laeuft || Boolean(zustand.angelegt)} aria-busy={laeuft} className="cta-outline min-h-11 self-start px-6 py-2.5 text-sm disabled:opacity-60">
        {laeuft || zustand.angelegt ? t.formular.speichernLaeuft : t.erfassen.anlegen}
      </button>
    </form>
  )
}
