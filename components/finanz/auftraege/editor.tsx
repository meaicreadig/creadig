"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowLeft, ArrowUp, Check, Maximize2, Plus, Send, Trash2, X } from "lucide-react"

import { entwurfSenden, entwurfSpeichern, type Ergebnis } from "@/app/(finanz)/finanz/auftraege/actions"
import { AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/primitives"
import { DokumentBlatt } from "@/components/finanz/auftraege/dokument-blatt"
import {
  berechne,
  DOK_TEXT,
  EINHEITEN,
  formatEuro,
  LAENDER,
  leerePosition,
  positionNetto,
  steuerModus,
  UST_SAETZE,
  type Entwurf,
  type Kunde,
  type Position,
} from "@/lib/finanz/auftraege/rechnen"
import type { Dokument, Firma } from "@/lib/finanz/auftraege/store"

type Leistung = { id: string; titel: string; beschreibung: string; einheit: string; preisCent: number; ustSatz: number }
type Feld = { key: string; label: string }
type Pruefung = { text: string; ok: boolean; wo: "firma" | "dokument" }

const zuEuro = (c: number) => (c / 100).toFixed(2).replace(".", ",")
const ausEuro = (v: string) => {
  const t = v.replace(/\s|€/g, "")
  const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t)
  return Number.isFinite(n) ? Math.round(n * 100) : 0
}

const karte = "bg-card flex flex-col gap-4 rounded-3xl p-5"
const kontrolle = "py-2"

function pruefe(e: Entwurf, f: Firma, istAngebot: boolean): Pruefung[] {
  const k = e.kunde
  return [
    { wo: "firma", text: "Firma und Inhaber", ok: Boolean(f.name && f.inhaber) },
    { wo: "firma", text: "Anschrift von creaDIG Solutions", ok: Boolean(f.strasse && f.plzOrt) },
    { wo: "firma", text: "Steuernummer oder USt-IdNr.", ok: Boolean(f.steuernummer || f.ustId) },
    { wo: "firma", text: "Bankverbindung (IBAN)", ok: Boolean(f.iban) },
    { wo: "dokument", text: "Kunde mit Name oder Firma", ok: Boolean(k.firma || k.name) },
    { wo: "dokument", text: "Anschrift des Kunden", ok: Boolean(k.strasse && k.plzOrt) },
    { wo: "dokument", text: "E-Mail für den Versand", ok: /.+@.+\..+/.test(k.email) },
    ...(istAngebot ? [] : [{ wo: "dokument" as const, text: "Leistungsdatum oder -zeitraum", ok: Boolean(e.leistungszeitraum.trim()) }]),
    { wo: "dokument", text: "Mindestens eine Position mit Titel", ok: e.positionen.some((p) => p.titel.trim()) },
  ]
}

export function DokumentEditor({
  id,
  art,
  start,
  firma,
  zurueck,
  grundlagen,
  leistungen,
  kunden,
  felder,
  ustPflichtig,
}: {
  id: string
  art: "angebot" | "rechnung"
  start: Dokument
  firma: Firma
  zurueck: string
  grundlagen: string
  leistungen: Leistung[]
  kunden: Kunde[]
  felder: Feld[]
  ustPflichtig: boolean
}) {
  const router = useRouter()
  const [e, setE] = useState<Entwurf>(start)
  const [preise, setPreise] = useState<string[]>(start.positionen.map((p) => zuEuro(p.preisCent)))
  const [ergebnis, setErgebnis] = useState<Ergebnis | null>(null)
  const [gross, setGross] = useState(false)
  const [laeuft, starte] = useTransition()
  const istAngebot = art === "angebot"
  const was = istAngebot ? "Angebot" : "Rechnung"

  const modus = steuerModus(e.kunde, ustPflichtig)
  const summen = useMemo(() => berechne(e.positionen, e.rabattProzent, modus), [e.positionen, e.rabattProzent, modus])
  const hinweis = DOK_TEXT[e.sprache].hinweis[modus]
  const vorschau: Dokument = useMemo(() => ({ ...start, ...e, summen: null, steuerModus: null, absender: null }), [start, e])
  const pruefungen = pruefe(e, firma, istAngebot)
  const offen = pruefungen.filter((p) => !p.ok).length

  useEffect(() => {
    if (!gross) return
    const zu = (ev: KeyboardEvent) => ev.key === "Escape" && setGross(false)
    window.addEventListener("keydown", zu)
    return () => window.removeEventListener("keydown", zu)
  }, [gross])

  const setK = (k: Partial<Kunde>) => setE((x) => ({ ...x, kunde: { ...x.kunde, ...k } }))
  const setP = (i: number, p: Partial<Position>) => setE((x) => ({ ...x, positionen: x.positionen.map((q, n) => (n === i ? { ...q, ...p } : q)) }))
  const hinzu = (p: Position) => {
    setE((x) => ({ ...x, positionen: [...x.positionen, p] }))
    setPreise((x) => [...x, zuEuro(p.preisCent)])
  }
  const weg = (i: number) => {
    setE((x) => ({ ...x, positionen: x.positionen.filter((_, n) => n !== i) }))
    setPreise((x) => x.filter((_, n) => n !== i))
  }
  const schiebe = (i: number, r: -1 | 1) => {
    const j = i + r
    if (j < 0 || j >= e.positionen.length) return
    const tausch = <T,>(a: T[]) => {
      const b = [...a]
      ;[b[i], b[j]] = [b[j], b[i]]
      return b
    }
    setE((x) => ({ ...x, positionen: tausch(x.positionen) }))
    setPreise(tausch)
  }

  const ausfuehren = (senden: boolean) =>
    starte(async () => {
      setErgebnis(null)
      const r = await (senden ? entwurfSenden(id, e) : entwurfSpeichern(id, e))
      setErgebnis(r)
      if (r.ok) router.refresh()
    })

  const senden = () => {
    if (window.confirm(`${was} jetzt festschreiben und an ${e.kunde.email || "den Kunden"} senden? Danach ist es nicht mehr änderbar.`)) ausfuehren(true)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-card sticky top-3 z-20 flex flex-wrap items-center gap-3 rounded-full py-2 ps-2 pe-2 shadow-sm">
        <Link href={zurueck} className="text-muted-foreground hover:text-primary hover:bg-background inline-flex size-9 items-center justify-center rounded-full transition-colors">
          <ArrowLeft aria-hidden className="size-4" />
          <span className="sr-only">Zur Übersicht</span>
        </Link>
        <div aria-live="polite" className="min-w-0 flex-1 text-sm">
          {ergebnis?.ok && <span className="text-primary font-medium">{ergebnis.hinweis}</span>}
          {ergebnis && !ergebnis.ok && <span className="text-destructive">{ergebnis.fehler.join(" · ")}</span>}
          {!ergebnis && (
            <span className="text-muted-foreground">
              Entwurf · <span className="text-foreground font-semibold tabular-nums">{formatEuro(summen.bruttoCent)}</span>
            </span>
          )}
        </div>
        <button type="button" disabled={laeuft} onClick={() => ausfuehren(false)} className="bg-background text-foreground hover:bg-secondary rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60">
          Entwurf speichern
        </button>
        <button type="button" disabled={laeuft} onClick={senden} className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60">
          <Send aria-hidden className="size-4" />
          {laeuft ? "Läuft …" : `${was} senden`}
        </button>
      </div>

      <div className="grid items-start gap-5 min-[1100px]:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="@container flex min-w-0 flex-col gap-4">
          <section aria-labelledby="ed-kunde" className={karte}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="ed-kunde" className="text-base font-semibold">Empfänger</h2>
              {kunden.length > 0 && (
                <AdminSelect
                  aria-label="Bestehenden Kunden übernehmen"
                  className={`w-auto ${kontrolle}`}
                  defaultValue=""
                  onChange={(ev) => {
                    const k = kunden[Number(ev.target.value)]
                    if (k) setE((x) => ({ ...x, kunde: { ...k } }))
                  }}
                >
                  <option value="">Kontakt übernehmen …</option>
                  {kunden.map((k, i) => (
                    <option key={i} value={i}>
                      {k.firma || k.name} {k.email ? `· ${k.email}` : ""}
                    </option>
                  ))}
                </AdminSelect>
              )}
            </div>
            <div className="grid gap-3 @lg:grid-cols-2">
              <Eingabe label="Firma" id="k-firma" value={e.kunde.firma} onChange={(v) => setK({ firma: v })} />
              <Eingabe label="Ansprechpartner" id="k-name" value={e.kunde.name} onChange={(v) => setK({ name: v })} />
              <Eingabe label="Straße und Hausnummer" id="k-str" value={e.kunde.strasse} onChange={(v) => setK({ strasse: v })} />
              <Eingabe label="PLZ und Ort" id="k-ort" value={e.kunde.plzOrt} onChange={(v) => setK({ plzOrt: v })} />
              <Feldrahmen label="Land" id="k-land">
                <AdminSelect id="k-land" className={kontrolle} value={e.kunde.land} onChange={(v) => setK({ land: v.target.value })}>
                  {LAENDER.map((l) => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </AdminSelect>
              </Feldrahmen>
              <Eingabe label="USt-IdNr. (optional)" id="k-ust" value={e.kunde.ustId} onChange={(v) => setK({ ustId: v })} placeholder="z. B. ATU12345678" />
              <Eingabe label="E-Mail für den Versand" id="k-mail" type="email" value={e.kunde.email} onChange={(v) => setK({ email: v })} />
              <Feldrahmen label="Sprache" id="k-spr">
                <AdminSelect id="k-spr" className={kontrolle} value={e.sprache} onChange={(v) => setE((x) => ({ ...x, sprache: v.target.value === "en" ? "en" : "de" }))}>
                  <option value="de">Deutsch</option>
                  <option value="en">Englisch</option>
                </AdminSelect>
              </Feldrahmen>
            </div>
            {hinweis && <p className="bg-secondary text-secondary-foreground rounded-2xl px-4 py-2.5 text-sm">Steuer: {hinweis}</p>}
          </section>

          <section aria-labelledby="ed-eck" className={karte}>
            <h2 id="ed-eck" className="text-base font-semibold">{istAngebot ? "Angebotsdaten" : "Rechnungsdaten"}</h2>
            <div className="grid gap-3 @lg:grid-cols-2 @3xl:grid-cols-3">
              <Eingabe label="Betreff / Projekt" id="e-titel" value={e.titel} onChange={(v) => setE((x) => ({ ...x, titel: v }))} placeholder="z. B. Website & Buchungssystem" />
              <Eingabe label={istAngebot ? "Angebotsdatum" : "Rechnungsdatum"} id="e-datum" type="date" value={e.datum} onChange={(v) => setE((x) => ({ ...x, datum: v }))} />
              {istAngebot ? (
                <Eingabe label="Gültig bis" id="e-gueltig" type="date" value={e.gueltigBis ?? ""} onChange={(v) => setE((x) => ({ ...x, gueltigBis: v || null }))} />
              ) : (
                <Eingabe label="Zahlungsziel (Tage)" id="e-ziel" type="number" value={String(e.zahlungszielTage)} onChange={(v) => setE((x) => ({ ...x, zahlungszielTage: Number(v) }))} />
              )}
              <Eingabe label={istAngebot ? "Leistungszeitraum (optional)" : "Leistungsdatum / -zeitraum"} id="e-zeit" value={e.leistungszeitraum} onChange={(v) => setE((x) => ({ ...x, leistungszeitraum: v }))} placeholder="z. B. Oktober 2026" />
              <Feldrahmen label="Geschäftsfeld" id="e-feld">
                <AdminSelect id="e-feld" className={kontrolle} value={e.geschaeftsfeld} onChange={(v) => setE((x) => ({ ...x, geschaeftsfeld: v.target.value }))}>
                  {felder.map((f) => (
                    <option key={f.key} value={f.key}>{f.label}</option>
                  ))}
                </AdminSelect>
              </Feldrahmen>
              <Eingabe label="Rabatt (%)" id="e-rabatt" type="number" value={String(e.rabattProzent)} onChange={(v) => setE((x) => ({ ...x, rabattProzent: Number(v) }))} />
            </div>
            <Feldrahmen label="Einleitung" id="e-ein">
              <AdminTextarea id="e-ein" rows={3} value={e.einleitung} onChange={(v) => setE((x) => ({ ...x, einleitung: v.target.value }))} />
            </Feldrahmen>
          </section>

          <section aria-labelledby="ed-pos" className={karte}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="ed-pos" className="text-base font-semibold">Positionen</h2>
              <div className="flex flex-wrap gap-2">
                {leistungen.length > 0 && (
                  <AdminSelect
                    aria-label="Leistung aus Katalog hinzufügen"
                    className={`w-auto ${kontrolle}`}
                    value=""
                    onChange={(ev) => {
                      const l = leistungen.find((x) => x.id === ev.target.value)
                      if (l) hinzu({ ...leerePosition(), titel: l.titel, beschreibung: l.beschreibung, einheit: l.einheit, preisCent: l.preisCent, ustSatz: l.ustSatz })
                    }}
                  >
                    <option value="">Aus Katalog …</option>
                    {leistungen.map((l) => (
                      <option key={l.id} value={l.id}>{l.titel} · {formatEuro(l.preisCent)}</option>
                    ))}
                  </AdminSelect>
                )}
                <button type="button" onClick={() => hinzu(leerePosition())} className="bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors">
                  <Plus aria-hidden className="size-4" /> Position
                </button>
              </div>
            </div>

            {e.positionen.length === 0 && <p className="text-muted-foreground bg-background rounded-2xl p-4 text-sm">Noch keine Position. Wähle eine Leistung aus dem Katalog oder lege eine freie Position an.</p>}

            <ol className="flex flex-col gap-2">
              {e.positionen.map((p, i) => (
                <li key={i} className="bg-background flex flex-col gap-3 rounded-2xl p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-2 w-6 shrink-0 text-center text-xs font-semibold tabular-nums">{i + 1}</span>
                    <div className="grid flex-1 gap-2">
                      <AdminInput aria-label={`Position ${i + 1}: Titel`} className={`bg-card ${kontrolle}`} value={p.titel} placeholder="Leistung" onChange={(v) => setP(i, { titel: v.target.value })} />
                      <AdminTextarea aria-label={`Position ${i + 1}: Beschreibung`} className="bg-card" rows={2} value={p.beschreibung} placeholder="Beschreibung (optional)" onChange={(v) => setP(i, { beschreibung: v.target.value })} />
                    </div>
                    <div className="flex shrink-0 flex-col">
                      <IconKnopf label="Nach oben" onClick={() => schiebe(i, -1)}><ArrowUp className="size-3.5" /></IconKnopf>
                      <IconKnopf label="Nach unten" onClick={() => schiebe(i, 1)}><ArrowDown className="size-3.5" /></IconKnopf>
                      <IconKnopf label="Entfernen" onClick={() => weg(i)}><Trash2 className="size-3.5" /></IconKnopf>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 items-end gap-2 ps-8 @xl:grid-cols-[5rem_6.5rem_minmax(0,1fr)_5.5rem_auto]">
                    <Feldrahmen label="Menge" id={`p-m-${i}`}>
                      <AdminInput id={`p-m-${i}`} className={`bg-card ${kontrolle}`} type="number" min={0} step="0.25" value={p.menge} onChange={(v) => setP(i, { menge: Number(v.target.value) })} />
                    </Feldrahmen>
                    <Feldrahmen label="Einheit" id={`p-e-${i}`}>
                      <AdminSelect id={`p-e-${i}`} className={`bg-card ${kontrolle}`} value={p.einheit} onChange={(v) => setP(i, { einheit: v.target.value })}>
                        {EINHEITEN.map((x) => <option key={x}>{x}</option>)}
                      </AdminSelect>
                    </Feldrahmen>
                    <Feldrahmen label="Preis netto (€)" id={`p-p-${i}`}>
                      <AdminInput
                        id={`p-p-${i}`}
                        className={`bg-card text-right tabular-nums ${kontrolle}`}
                        inputMode="decimal"
                        value={preise[i] ?? ""}
                        onChange={(v) => {
                          const t = v.target.value
                          setPreise((x) => x.map((q, n) => (n === i ? t : q)))
                          setP(i, { preisCent: ausEuro(t) })
                        }}
                      />
                    </Feldrahmen>
                    <Feldrahmen label="USt" id={`p-u-${i}`}>
                      <AdminSelect id={`p-u-${i}`} className={`bg-card ${kontrolle}`} value={p.ustSatz} onChange={(v) => setP(i, { ustSatz: Number(v.target.value) })}>
                        {UST_SAETZE.map((x) => <option key={x} value={x}>{x} %</option>)}
                      </AdminSelect>
                    </Feldrahmen>
                    <div className="col-span-2 flex items-center justify-between gap-3 pb-2 @xl:col-span-1 @xl:flex-col @xl:items-end @xl:gap-0.5">
                      {istAngebot && (
                        <label className="text-muted-foreground flex items-center gap-1.5 text-xs">
                          <input type="checkbox" checked={p.optional} onChange={(v) => setP(i, { optional: v.target.checked })} className="accent-primary size-3.5" />
                          optional
                        </label>
                      )}
                      <span className="text-sm font-semibold tabular-nums">{formatEuro(positionNetto(p))}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="ed-schluss" className={karte}>
            <h2 id="ed-schluss" className="text-base font-semibold">Schlusstext</h2>
            <AdminTextarea aria-labelledby="ed-schluss" rows={3} value={e.schluss} onChange={(v) => setE((x) => ({ ...x, schluss: v.target.value }))} placeholder={istAngebot ? "z. B. Ablauf, Zahlungsbedingungen, Ansprechpartner" : "z. B. Vielen Dank für die Zusammenarbeit."} />
          </section>
        </div>

        <aside aria-label="Überblick" className="flex flex-col gap-4 min-[1100px]:sticky min-[1100px]:top-20">
          <section aria-labelledby="ed-vorschau" className="bg-card flex flex-col gap-3 rounded-3xl p-3">
            <div className="flex items-center justify-between px-2 pt-1">
              <h2 id="ed-vorschau" className="text-sm font-semibold">Live-Vorschau</h2>
              <button type="button" onClick={() => setGross(true)} className="text-muted-foreground hover:text-primary hover:bg-background inline-flex size-8 items-center justify-center rounded-full transition-colors">
                <Maximize2 aria-hidden className="size-3.5" />
                <span className="sr-only">Vorschau vergrößern</span>
              </button>
            </div>
            <button type="button" onClick={() => setGross(true)} className="bg-background group relative block aspect-[1/1.414] w-full overflow-hidden rounded-2xl text-left" aria-label="Vorschau vergrößern">
              <div aria-hidden className="pointer-events-none absolute inset-x-3 top-3 w-[800px] origin-top-left scale-[0.335] transition-transform group-hover:scale-[0.34]">
                <DokumentBlatt d={vorschau} firma={firma} modus={modus} />
              </div>
            </button>
          </section>

          <section aria-labelledby="ed-summe" className="bg-card flex flex-col gap-2 rounded-3xl p-5">
            <h2 id="ed-summe" className="sr-only">Summe</h2>
            <dl className="flex flex-col gap-1.5 text-sm">
              {summen.rabattCent !== 0 && <Summe k="Rabatt" v={`− ${formatEuro(summen.rabattCent)}`} />}
              <Summe k="Netto" v={formatEuro(summen.nettoCent)} />
              {summen.gruppen.filter((g) => g.satz > 0).map((g) => <Summe key={g.satz} k={`USt ${g.satz} %`} v={formatEuro(g.ustCent)} />)}
              <div className="flex items-baseline justify-between pt-2">
                <dt className="font-medium">Gesamt</dt>
                <dd className="text-primary text-2xl font-semibold tabular-nums">{formatEuro(summen.bruttoCent)}</dd>
              </div>
            </dl>
            {summen.optionalCent > 0 && <p className="text-muted-foreground text-xs">+ optional bis {formatEuro(summen.optionalCent)} netto</p>}
          </section>

          <section aria-labelledby="ed-pruef" className="bg-card flex flex-col gap-3 rounded-3xl p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 id="ed-pruef" className="text-sm font-semibold">Pflichtangaben</h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${offen === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                {offen === 0 ? "vollständig" : `${offen} offen`}
              </span>
            </div>
            <ul className="flex flex-col gap-1.5 text-sm">
              {pruefungen.map((p) => (
                <li key={p.text} className={`flex items-start gap-2 ${p.ok ? "text-muted-foreground" : "text-foreground"}`}>
                  <span aria-hidden className={`mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full ${p.ok ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                    {p.ok ? <Check className="size-2.5" strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-current" />}
                  </span>
                  <span>
                    {p.text}
                    <span className="sr-only">{p.ok ? " – erfüllt" : " – fehlt"}</span>
                  </span>
                </li>
              ))}
            </ul>
            {pruefungen.some((p) => !p.ok && p.wo === "firma") && (
              <Link href={grundlagen} className="text-primary text-sm font-medium hover:underline">Firmendaten ergänzen</Link>
            )}
          </section>
        </aside>
      </div>

      {gross && (
        <div role="dialog" aria-modal="true" aria-label="Vorschau" className="bg-foreground/40 fixed inset-0 z-50 overflow-y-auto p-4 backdrop-blur-sm sm:p-10" onClick={() => setGross(false)}>
          <div className="mx-auto w-full max-w-[800px]" onClick={(ev) => ev.stopPropagation()}>
            <div className="mb-3 flex justify-end">
              <button type="button" autoFocus onClick={() => setGross(false)} className="bg-card text-foreground inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium shadow-sm">
                <X aria-hidden className="size-4" /> Schließen
              </button>
            </div>
            <DokumentBlatt d={vorschau} firma={firma} modus={modus} />
          </div>
        </div>
      )}
    </div>
  )
}

function Feldrahmen({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-muted-foreground text-xs font-medium">{label}</label>
      {children}
    </div>
  )
}

function Eingabe({ label, id, value, onChange, type = "text", placeholder }: { label: string; id: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <Feldrahmen label={label} id={id}>
      <AdminInput id={id} type={type} className={kontrolle} value={value} placeholder={placeholder} onChange={(v) => onChange(v.target.value)} />
    </Feldrahmen>
  )
}

function IconKnopf({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} title={label} className="text-muted-foreground hover:text-primary hover:bg-card inline-flex size-7 items-center justify-center rounded-full transition-colors">
      {children}
      <span className="sr-only">{label}</span>
    </button>
  )
}

function Summe({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="tabular-nums">{v}</dd>
    </div>
  )
}
