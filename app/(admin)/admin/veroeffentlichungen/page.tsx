import Link from "next/link"

import { AdminShell } from "@/components/admin/admin-shell"
import { AdminField, AdminInput, AdminSelect, Pill, SectionHeader, Surface, UnavailableNote } from "@/components/admin/primitives"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { datumAnzeige, geschaeftsTag } from "@/lib/geschaeftszeit"
import { getVertriebStore } from "@/lib/lead-store"
import { PUBLICATION_BEZUG_ARTEN, PUBLICATION_KANAELE, PUBLICATION_REAKTIONEN } from "@/lib/vertrieb"
import { PUBLICATION_QUELLEN, PUBLICATION_ZUSTAENDE, istZustand, kannFreigeben, kannVeroeffentlichen } from "@/lib/veroeffentlichung-zustand"
import { cookies } from "next/headers"
import { ADMIN_COOKIE, verifySession } from "@/lib/admin-session"
import {
  alsVeroeffentlichtEintragen,
  entwurfAnlegen,
  entwurfFreigeben,
  reaktionEintragen,
  veroeffentlichungErfassen,
} from "./actions"

/**
 * B-3 · DAS VERÖFFENTLICHUNGSREGISTER — EINE FLÄCHE, VIER FRAGEN.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WELCHE FRAGE DIESE SEITE BEANTWORTET
 *
 * Nicht „wie viele Menschen haben es gesehen" — das weiss dieses Haus nicht,
 * und die Zahl würde heute nichts entscheiden. Sondern:
 *
 *   Was haben wir veröffentlicht, wo, wann — und hat daraus jemand geantwortet?
 *
 * Eine Antwort, ein Gespräch, eine Empfehlung, eine Anfrage: Das sind die
 * Wirkungen, die bei dieser Grösse zählen. Alles andere wäre eine Kennzahl
 * ohne Entscheidung dahinter.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS HIER BEWUSST FEHLT
 *
 * Kein Redaktionsplan, keine Entwürfe, keine Freigabekette, keine
 * Terminplanung, keine Kampagnen, keine Reichweitenwand, keine Anbindung an
 * LinkedIn oder Meta (MSA-05/MSA-17). Der Engpass beim Veröffentlichen ist
 * das Schreiben und Hinausgehen — nicht die Verwaltung davon. Ein Werkzeug,
 * das den Engpass nicht trifft, kostet Pflege und ändert nichts.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * UND WARUM DAS KEIN ZWEITES CRM IST
 *
 * Wird aus einer Reaktion ein Kontakt mit einem Menschen, schreibt der Store
 * eine Chronikzeile an DIESEM Datensatz (`setPublicationReaktion`). Die
 * Beziehungsgeschichte bleibt dort, wo sie hingehört; hier steht nur, dass
 * eine Veröffentlichung sie ausgelöst hat.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const { t } = await adminSprachKontext()
  return { title: t.veroeffentlichungen.titel }
}

export default async function Veroeffentlichungen({
  searchParams,
}: {
  searchParams: Promise<{ kanal?: string; zustand?: string }>
}) {
  const { t, intl, sprache } = await adminSprachKontext()
  const v = t.veroeffentlichungen
  const params = await searchParams
  const kanal = (PUBLICATION_KANAELE as readonly string[]).includes(params.kanal ?? "")
    ? (params.kanal as (typeof PUBLICATION_KANAELE)[number])
    : undefined

  const zustand = istZustand(params.zustand) ? params.zustand : undefined
  const { rolle } = await verifySession((await cookies()).get(ADMIN_COOKIE)?.value)

  const store = getVertriebStore()
  const alle = store ? await store.listPublications({ kanal, limit: 100 }) : null
  /* §18 — der Zustand wird hier gefiltert, nicht in der Abfrage: Vor
     Migration 021 kennt die Tabelle die Spalte nicht, und jede Zeile ist
     dann `veroeffentlicht`. So bleibt die Seite in beiden Staenden lesbar. */
  const eintraege = alle && zustand ? alle.filter((e) => e.zustand === zustand) : alle

  /* Die eine Zahl, die etwas entscheidet: Hat Veröffentlichen Gespräche ausgelöst? */
  const mitReaktion = (eintraege ?? []).filter((e) => e.reaktion !== "keine")

  return (
    <AdminShell title={v.titel} lead={v.lead}>
      {/* ── §18 · Entwurf mit Quelle ─────────────────────────────────── */}
      <section aria-labelledby="entwurf-titel" className="mb-14">
        <SectionHeader id="entwurf-titel" title={v.entwurfTitel} />
        <p className="type-small text-muted-foreground mt-2 max-w-2xl text-pretty">{v.entwurfHinweis}</p>
        <Surface className="mt-5">
          <form action={entwurfAnlegen} className="flex flex-wrap items-end gap-4">
            <AdminField label={v.was} htmlFor="entwurf-was" className="flex-1 basis-72">
              <AdminInput id="entwurf-was" name="was" required maxLength={200} placeholder={v.wasPlatzhalter} />
            </AdminField>
            <AdminField label={v.kanal} htmlFor="entwurf-kanal">
              <AdminSelect id="entwurf-kanal" name="kanal" defaultValue="linkedin">
                {PUBLICATION_KANAELE.map((k) => (
                  <option key={k} value={k}>{v.kanaele[k]}</option>
                ))}
              </AdminSelect>
            </AdminField>
            <AdminField label={v.quelle} htmlFor="entwurf-quelle">
              <AdminSelect id="entwurf-quelle" name="quelle" defaultValue="build">
                {PUBLICATION_QUELLEN.map((q) => (
                  <option key={q} value={q}>{v.quellen[q]}</option>
                ))}
              </AdminSelect>
            </AdminField>
            <AdminField label={v.quelleId} htmlFor="entwurf-quelleId" className="flex-1 basis-56">
              <AdminInput id="entwurf-quelleId" name="quelleId" maxLength={120} />
            </AdminField>
            <button type="submit" className="cta-outline min-h-11 px-5 py-2.5 text-sm">{v.entwurfAnlegen}</button>
          </form>
        </Surface>
      </section>

      {/* ── Eintragen ─────────────────────────────────────────────────── */}
      <section aria-labelledby="erfassen-titel">
        <SectionHeader id="erfassen-titel" title={v.erfassenTitel} />
        <p className="type-small text-muted-foreground mt-2 max-w-2xl text-pretty">{v.erfassenHinweis}</p>
        <Surface className="mt-5">
          <form action={veroeffentlichungErfassen} className="flex flex-wrap items-end gap-4">
            <AdminField label={v.was} htmlFor="was" className="flex-1 basis-72">
              <AdminInput id="was" name="was" required maxLength={200} placeholder={v.wasPlatzhalter} />
            </AdminField>
            <AdminField label={v.kanal} htmlFor="kanal">
              <AdminSelect id="kanal" name="kanal" defaultValue="linkedin">
                {PUBLICATION_KANAELE.map((k) => (
                  <option key={k} value={k}>{v.kanaele[k]}</option>
                ))}
              </AdminSelect>
            </AdminField>
            <AdminField label={v.am} htmlFor="am">
              <AdminInput id="am" name="am" type="date" defaultValue={geschaeftsTag()} required />
            </AdminField>
            <AdminField label={v.url} htmlFor="url" className="flex-1 basis-56">
              <AdminInput id="url" name="url" type="url" placeholder="https://" />
            </AdminField>
            <button type="submit" className="cta-outline min-h-11 px-5 py-2.5 text-sm">{v.eintragen}</button>
          </form>
        </Surface>
      </section>

      {/* ── Was hinausging ────────────────────────────────────────────── */}
      <section aria-labelledby="liste-titel" className="mt-14">
        <SectionHeader
          id="liste-titel"
          title={v.listeTitel}
          count={eintraege === null ? undefined : v.mitReaktion(mitReaktion.length, eintraege.length)}
        />

        <form method="get" data-wache="aus" className="mt-4 flex flex-wrap items-end gap-4">
          <AdminField label={v.kanal} htmlFor="kanalFilter">
            <AdminSelect id="kanalFilter" name="kanal" defaultValue={kanal ?? ""}>
              <option value="">{v.alleKanaele}</option>
              {PUBLICATION_KANAELE.map((k) => (
                <option key={k} value={k}>{v.kanaele[k]}</option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label={v.zustand} htmlFor="zustandFilter">
            <AdminSelect id="zustandFilter" name="zustand" defaultValue={zustand ?? ""}>
              <option value="">{v.alleZustaende}</option>
              {PUBLICATION_ZUSTAENDE.map((z) => (
                <option key={z} value={z}>{v.zustaende[z]}</option>
              ))}
            </AdminSelect>
          </AdminField>
          <button type="submit" className="cta-quiet min-h-11 px-4 py-2 text-sm">{v.anwenden}</button>
        </form>

        {eintraege === null ? (
          <div className="mt-6">
            <UnavailableNote title={v.nichtEingerichtetTitel}>{v.nichtEingerichtet}</UnavailableNote>
          </div>
        ) : eintraege.length === 0 ? (
          <p className="type-body text-foreground/85 mt-6 max-w-2xl text-pretty">{kanal ? v.leerGefiltert : v.leer}</p>
        ) : (
          <ul className="mt-6 flex flex-col gap-4">
            {eintraege.map((e) => (
              <li key={e.id}>
                <Surface padding="sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="type-body text-foreground text-pretty">{e.was}</p>
                      <p className="type-small text-muted-foreground mt-1">
                        {v.kanaele[e.kanal]} · {e.veroeffentlichtAm ? datumAnzeige(e.veroeffentlichtAm, intl) : v.ohneDatum}
                        {e.quelle ? ` · ${v.quellen[e.quelle.art]}` : null}
                        {e.url ? (
                          <>
                            {" · "}
                            <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-gold-text underline underline-offset-4">
                              {v.oeffnen}
                            </a>
                          </>
                        ) : null}
                      </p>
                    </div>
                    {e.zustand === "veroeffentlicht" ? (
                      <Pill severity={e.reaktion === "keine" ? "neutral" : "attention"}>{v.reaktionen[e.reaktion]}</Pill>
                    ) : (
                      <Pill severity="attention">{v.zustaende[e.zustand]}</Pill>
                    )}
                  </div>

                  {/* §18 — Entwurf: nur der Owner gibt frei. */}
                  {e.zustand === "entwurf" ? (
                    kannFreigeben(e, rolle) ? (
                      <form action={entwurfFreigeben.bind(null, e.id)} className="border-line mt-4 border-t pt-4">
                        <button type="submit" className="cta-outline min-h-11 px-5 py-2.5 text-sm">{v.freigeben}</button>
                      </form>
                    ) : (
                      <p className="type-small text-muted-foreground border-line mt-4 border-t pt-4">{v.nurOwnerGibtFrei}</p>
                    )
                  ) : null}

                  {/* §18 — Freigegeben: erst jetzt darf es als veroeffentlicht eingetragen werden. */}
                  {kannVeroeffentlichen(e) ? (
                    <form action={alsVeroeffentlichtEintragen.bind(null, e.id)} className="border-line mt-4 flex flex-wrap items-end gap-3 border-t pt-4">
                      <AdminField label={v.am} htmlFor={`am-${e.id}`}>
                        <AdminInput id={`am-${e.id}`} name="am" type="date" defaultValue={geschaeftsTag()} required />
                      </AdminField>
                      <AdminField label={v.url} htmlFor={`url-${e.id}`} className="flex-1 basis-56">
                        <AdminInput id={`url-${e.id}`} name="url" type="url" placeholder="https://" />
                      </AdminField>
                      <button type="submit" className="cta-outline min-h-11 px-5 py-2.5 text-sm">{v.alsVeroeffentlicht}</button>
                    </form>
                  ) : null}

                  {e.reaktionNotiz ? (
                    <p className="type-small text-foreground/90 border-line mt-3 border-s-2 py-1 ps-4 text-pretty">
                      {e.reaktionNotiz}
                    </p>
                  ) : null}

                  {e.bezug ? (
                    <p className="type-small text-muted-foreground mt-3">
                      {v.bezugArten[e.bezug.art]}:{" "}
                      <Link
                        href={
                          e.bezug.art === "kontakt" ? `/admin/vertrieb/beziehungen/${e.bezug.id}`
                          : e.bezug.art === "organisation" ? `/admin/kunden/${e.bezug.id}`
                          : e.bezug.art === "anfrage" ? `/admin/vertrieb/anfragen/${e.bezug.id}`
                          : `/admin/vertrieb/pipeline/${e.bezug.id}`
                        }
                        className="text-gold-text underline underline-offset-4"
                      >
                        {e.bezug.titel ?? e.bezug.id}
                      </Link>
                    </p>
                  ) : null}

                  {/* Nachtragen: was daraus wurde — nur, was hinausging. */}
                  {e.zustand === "veroeffentlicht" ? (
                  <form action={reaktionEintragen.bind(null, e.id)} className="border-line mt-4 flex flex-wrap items-end gap-3 border-t pt-4">
                    <AdminField label={v.reaktion} htmlFor={`reaktion-${e.id}`}>
                      <AdminSelect id={`reaktion-${e.id}`} name="reaktion" defaultValue={e.reaktion}>
                        {PUBLICATION_REAKTIONEN.map((r) => (
                          <option key={r} value={r}>{v.reaktionen[r]}</option>
                        ))}
                      </AdminSelect>
                    </AdminField>
                    <AdminField label={v.notiz} htmlFor={`notiz-${e.id}`} className="flex-1 basis-56">
                      <AdminInput id={`notiz-${e.id}`} name="notiz" defaultValue={e.reaktionNotiz ?? ""} maxLength={300} />
                    </AdminField>
                    <AdminField label={v.bezugArt} htmlFor={`bezugArt-${e.id}`}>
                      <AdminSelect id={`bezugArt-${e.id}`} name="bezugArt" defaultValue={e.bezug?.art ?? ""}>
                        <option value="">{v.ohneBezug}</option>
                        {PUBLICATION_BEZUG_ARTEN.map((b) => (
                          <option key={b} value={b}>{v.bezugArten[b]}</option>
                        ))}
                      </AdminSelect>
                    </AdminField>
                    <AdminField label={v.bezugId} htmlFor={`bezugId-${e.id}`} className="flex-1 basis-56">
                      <AdminInput id={`bezugId-${e.id}`} name="bezugId" defaultValue={e.bezug?.id ?? ""} placeholder={v.bezugIdPlatzhalter} />
                    </AdminField>
                    <button type="submit" className="cta-quiet min-h-11 px-4 py-2 text-sm">{v.speichern}</button>
                  </form>
                  ) : null}
                </Surface>
              </li>
            ))}
          </ul>
        )}

        <p className="type-small text-muted-foreground mt-8 max-w-2xl text-pretty" lang={sprache}>
          {v.grenze}
        </p>
      </section>
    </AdminShell>
  )
}
