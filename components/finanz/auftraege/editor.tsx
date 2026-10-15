"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, Plus, Send, Trash2 } from "lucide-react"

import { entwurfSenden, entwurfSpeichern, type Ergebnis } from "@/app/(finanz)/finanz/auftraege/actions"
import { AdminField, AdminInput, AdminSelect, AdminTextarea } from "@/components/admin/primitives"
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

type Leistung = { id: string; titel: string; beschreibung: string; einheit: string; preisCent: number; ustSatz: number }
type Feld = { key: string; label: string }

const zuEuro = (c: number) => (c / 100).toFixed(2).replace(".", ",")
const ausEuro = (v: string) => {
  const t = v.replace(/\s|€/g, "")
  const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t)
  return Number.isFinite(n) ? Math.round(n * 100) : 0
}

export function DokumentEditor({
  id,
  art,
  start,
  leistungen,
  kunden,
  felder,
  ustPflichtig,
}: {
  id: string
  art: "angebot" | "rechnung"
  start: Entwurf
  leistungen: Leistung[]
  kunden: Kunde[]
  felder: Feld[]
  ustPflichtig: boolean
}) {
  const router = useRouter()
  const [e, setE] = useState<Entwurf>(start)
  const [preise, setPreise] = useState<string[]>(start.positionen.map((p) => zuEuro(p.preisCent)))
  const [ergebnis, setErgebnis] = useState<Ergebnis | null>(null)
  const [laeuft, starte] = useTransition()
  const istAngebot = art === "angebot"

  const modus = steuerModus(e.kunde, ustPflichtig)
  const summen = useMemo(() => berechne(e.positionen, e.rabattProzent, modus), [e.positionen, e.rabattProzent, modus])
  const hinweis = DOK_TEXT[e.sprache].hinweis[modus]

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
    const was = istAngebot ? "Angebot" : "Rechnung"
    if (window.confirm(`${was} jetzt festschreiben und an ${e.kunde.email || "den Kunden"} senden? Danach ist es nicht mehr änderbar.`)) ausfuehren(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="ed-kunde" className="bg-card flex flex-col gap-5 rounded-[2rem] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="ed-kunde" className="text-lg font-semibold">Kunde</h2>
          {kunden.length > 0 && (
            <AdminSelect
              aria-label="Bestehenden Kunden übernehmen"
              className="w-auto"
              defaultValue=""
              onChange={(ev) => {
                const k = kunden[Number(ev.target.value)]
                if (k) setE((x) => ({ ...x, kunde: { ...k } }))
              }}
            >
              <option value="">Bestehenden Kunden übernehmen …</option>
              {kunden.map((k, i) => (
                <option key={i} value={i}>
                  {k.firma || k.name} {k.email ? `· ${k.email}` : ""}
                </option>
              ))}
            </AdminSelect>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminField label="Firma" htmlFor="k-firma">
            <AdminInput id="k-firma" value={e.kunde.firma} onChange={(v) => setK({ firma: v.target.value })} />
          </AdminField>
          <AdminField label="Ansprechpartner" htmlFor="k-name">
            <AdminInput id="k-name" value={e.kunde.name} onChange={(v) => setK({ name: v.target.value })} />
          </AdminField>
          <AdminField label="Straße und Hausnummer" htmlFor="k-str">
            <AdminInput id="k-str" value={e.kunde.strasse} onChange={(v) => setK({ strasse: v.target.value })} />
          </AdminField>
          <AdminField label="PLZ und Ort" htmlFor="k-ort">
            <AdminInput id="k-ort" value={e.kunde.plzOrt} onChange={(v) => setK({ plzOrt: v.target.value })} />
          </AdminField>
          <AdminField label="Land" htmlFor="k-land">
            <AdminSelect id="k-land" value={e.kunde.land} onChange={(v) => setK({ land: v.target.value })}>
              {LAENDER.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label="USt-IdNr. des Kunden (optional)" htmlFor="k-ust">
            <AdminInput id="k-ust" value={e.kunde.ustId} onChange={(v) => setK({ ustId: v.target.value })} placeholder="z. B. ATU12345678" />
          </AdminField>
          <AdminField label="E-Mail (Versand)" htmlFor="k-mail">
            <AdminInput id="k-mail" type="email" required value={e.kunde.email} onChange={(v) => setK({ email: v.target.value })} />
          </AdminField>
          <AdminField label="Sprache des Dokuments" htmlFor="k-spr">
            <AdminSelect id="k-spr" value={e.sprache} onChange={(v) => setE((x) => ({ ...x, sprache: v.target.value === "en" ? "en" : "de" }))}>
              <option value="de">Deutsch</option>
              <option value="en">Englisch</option>
            </AdminSelect>
          </AdminField>
        </div>
        {hinweis && <p className="bg-secondary text-secondary-foreground rounded-2xl px-4 py-3 text-sm">Steuer: {hinweis}</p>}
      </section>

      <section aria-labelledby="ed-eck" className="bg-card flex flex-col gap-5 rounded-[2rem] p-6">
        <h2 id="ed-eck" className="text-lg font-semibold">Eckdaten</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <AdminField label="Betreff / Projekt" htmlFor="e-titel">
            <AdminInput id="e-titel" value={e.titel} onChange={(v) => setE((x) => ({ ...x, titel: v.target.value }))} placeholder="z. B. Neue Website & Buchungssystem" />
          </AdminField>
          <AdminField label="Datum" htmlFor="e-datum">
            <AdminInput id="e-datum" type="date" value={e.datum} onChange={(v) => setE((x) => ({ ...x, datum: v.target.value }))} />
          </AdminField>
          {istAngebot ? (
            <AdminField label="Gültig bis" htmlFor="e-gueltig">
              <AdminInput id="e-gueltig" type="date" value={e.gueltigBis ?? ""} onChange={(v) => setE((x) => ({ ...x, gueltigBis: v.target.value || null }))} />
            </AdminField>
          ) : (
            <AdminField label="Zahlungsziel (Tage)" htmlFor="e-ziel">
              <AdminInput id="e-ziel" type="number" min={0} max={120} value={e.zahlungszielTage} onChange={(v) => setE((x) => ({ ...x, zahlungszielTage: Number(v.target.value) }))} />
            </AdminField>
          )}
          <AdminField label={istAngebot ? "Leistungszeitraum (optional)" : "Leistungsdatum / -zeitraum"} htmlFor="e-zeit">
            <AdminInput id="e-zeit" value={e.leistungszeitraum} onChange={(v) => setE((x) => ({ ...x, leistungszeitraum: v.target.value }))} placeholder="z. B. Oktober 2026" />
          </AdminField>
          <AdminField label="Geschäftsfeld" htmlFor="e-feld">
            <AdminSelect id="e-feld" value={e.geschaeftsfeld} onChange={(v) => setE((x) => ({ ...x, geschaeftsfeld: v.target.value }))}>
              {felder.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </AdminSelect>
          </AdminField>
          <AdminField label="Rabatt (%)" htmlFor="e-rabatt">
            <AdminInput id="e-rabatt" type="number" min={0} max={100} step="0.5" value={e.rabattProzent} onChange={(v) => setE((x) => ({ ...x, rabattProzent: Number(v.target.value) }))} />
          </AdminField>
        </div>
        <AdminField label="Einleitung" htmlFor="e-ein">
          <AdminTextarea id="e-ein" rows={3} value={e.einleitung} onChange={(v) => setE((x) => ({ ...x, einleitung: v.target.value }))} />
        </AdminField>
      </section>

      <section aria-labelledby="ed-pos" className="bg-card flex flex-col gap-5 rounded-[2rem] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="ed-pos" className="text-lg font-semibold">Positionen</h2>
          <div className="flex flex-wrap gap-2">
            {leistungen.length > 0 && (
              <AdminSelect
                aria-label="Leistung aus Katalog hinzufügen"
                className="w-auto"
                value=""
                onChange={(ev) => {
                  const l = leistungen.find((x) => x.id === ev.target.value)
                  if (l) hinzu({ ...leerePosition(), titel: l.titel, beschreibung: l.beschreibung, einheit: l.einheit, preisCent: l.preisCent, ustSatz: l.ustSatz })
                }}
              >
                <option value="">Aus Katalog …</option>
                {leistungen.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.titel} · {formatEuro(l.preisCent)}
                  </option>
                ))}
              </AdminSelect>
            )}
            <button type="button" onClick={() => hinzu(leerePosition())} className="bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors">
              <Plus aria-hidden className="size-4" /> Freie Position
            </button>
          </div>
        </div>

        {e.positionen.length === 0 && <p className="text-muted-foreground bg-background rounded-2xl p-5 text-sm">Noch keine Position. Wähle eine Leistung aus dem Katalog oder lege eine freie Position an.</p>}

        <ol className="flex flex-col gap-3">
          {e.positionen.map((p, i) => (
            <li key={i} className="bg-background flex flex-col gap-4 rounded-3xl p-4">
              <div className="flex items-start gap-3">
                <span className="bg-card text-muted-foreground mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums">{i + 1}</span>
                <div className="grid flex-1 gap-3">
                  <AdminInput aria-label={`Position ${i + 1}: Titel`} value={p.titel} placeholder="Leistung" onChange={(v) => setP(i, { titel: v.target.value })} />
                  <AdminTextarea aria-label={`Position ${i + 1}: Beschreibung`} rows={2} value={p.beschreibung} placeholder="Beschreibung (optional)" onChange={(v) => setP(i, { beschreibung: v.target.value })} />
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <IconKnopf label="Nach oben" onClick={() => schiebe(i, -1)}><ArrowUp className="size-4" /></IconKnopf>
                  <IconKnopf label="Nach unten" onClick={() => schiebe(i, 1)}><ArrowDown className="size-4" /></IconKnopf>
                  <IconKnopf label="Entfernen" onClick={() => weg(i)}><Trash2 className="size-4" /></IconKnopf>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:ps-11 md:grid-cols-5 md:items-end">
                <AdminField label="Menge" htmlFor={`p-m-${i}`}>
                  <AdminInput id={`p-m-${i}`} type="number" min={0} step="0.25" value={p.menge} onChange={(v) => setP(i, { menge: Number(v.target.value) })} />
                </AdminField>
                <AdminField label="Einheit" htmlFor={`p-e-${i}`}>
                  <AdminSelect id={`p-e-${i}`} value={p.einheit} onChange={(v) => setP(i, { einheit: v.target.value })}>
                    {EINHEITEN.map((x) => <option key={x}>{x}</option>)}
                  </AdminSelect>
                </AdminField>
                <AdminField label="Einzelpreis netto (€)" htmlFor={`p-p-${i}`}>
                  <AdminInput
                    id={`p-p-${i}`}
                    inputMode="decimal"
                    value={preise[i] ?? ""}
                    onChange={(v) => {
                      const t = v.target.value
                      setPreise((x) => x.map((q, n) => (n === i ? t : q)))
                      setP(i, { preisCent: ausEuro(t) })
                    }}
                  />
                </AdminField>
                <AdminField label="USt" htmlFor={`p-u-${i}`}>
                  <AdminSelect id={`p-u-${i}`} value={p.ustSatz} onChange={(v) => setP(i, { ustSatz: Number(v.target.value) })}>
                    {UST_SAETZE.map((x) => <option key={x} value={x}>{x} %</option>)}
                  </AdminSelect>
                </AdminField>
                <div className="col-span-2 flex items-center justify-between gap-3 md:col-span-1 md:flex-col md:items-end">
                  {istAngebot && (
                    <label className="text-muted-foreground flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={p.optional} onChange={(v) => setP(i, { optional: v.target.checked })} className="accent-primary size-4" />
                      optional
                    </label>
                  )}
                  <span className="font-semibold tabular-nums">{formatEuro(positionNetto(p))}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <dl className="flex flex-col gap-1.5 self-end text-sm sm:w-80">
          {summen.rabattCent !== 0 && <Summe k="Rabatt" v={`− ${formatEuro(summen.rabattCent)}`} />}
          <Summe k="Netto" v={formatEuro(summen.nettoCent)} />
          {summen.gruppen.filter((g) => g.satz > 0).map((g) => <Summe key={g.satz} k={`USt ${g.satz} %`} v={formatEuro(g.ustCent)} />)}
          <div className="bg-primary text-primary-foreground mt-1 flex justify-between rounded-2xl px-5 py-3">
            <dt className="font-medium">Gesamt</dt>
            <dd className="font-semibold tabular-nums">{formatEuro(summen.bruttoCent)}</dd>
          </div>
          {summen.optionalCent > 0 && <p className="text-muted-foreground px-5 pt-1 text-xs">+ optional bis {formatEuro(summen.optionalCent)} netto</p>}
        </dl>
      </section>

      <section aria-labelledby="ed-schluss" className="bg-card flex flex-col gap-4 rounded-[2rem] p-6">
        <h2 id="ed-schluss" className="text-lg font-semibold">Schlusstext</h2>
        <AdminTextarea aria-labelledby="ed-schluss" rows={3} value={e.schluss} onChange={(v) => setE((x) => ({ ...x, schluss: v.target.value }))} placeholder={istAngebot ? "z. B. Zahlungsbedingungen, Ablauf, Ansprechpartner" : "z. B. Vielen Dank für die Zusammenarbeit."} />
      </section>

      <div className="bg-card sticky bottom-24 z-10 flex flex-col gap-3 rounded-[2rem] p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between lg:bottom-6">
        <div aria-live="polite" className="min-h-5 text-sm">
          {ergebnis?.ok && <span className="text-primary font-medium">{ergebnis.hinweis}</span>}
          {ergebnis && !ergebnis.ok && (
            <ul className="text-destructive flex flex-col gap-0.5">
              {ergebnis.fehler.map((f) => <li key={f}>{f}</li>)}
            </ul>
          )}
          {!ergebnis && <span className="text-muted-foreground">Entwurf · {formatEuro(summen.bruttoCent)} brutto</span>}
        </div>
        <div className="flex gap-2">
          <button type="button" disabled={laeuft} onClick={() => ausfuehren(false)} className="bg-secondary text-secondary-foreground hover:bg-background rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-60">
            Speichern
          </button>
          <button type="button" disabled={laeuft} onClick={senden} className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60">
            <Send aria-hidden className="size-4" />
            {laeuft ? "Läuft …" : istAngebot ? "Angebot senden" : "Rechnung senden"}
          </button>
        </div>
      </div>
    </div>
  )
}

function IconKnopf({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} title={label} className="text-muted-foreground hover:text-primary hover:bg-card inline-flex size-8 items-center justify-center rounded-full transition-colors">
      {children}
      <span className="sr-only">{label}</span>
    </button>
  )
}

function Summe({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between px-5">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="tabular-nums">{v}</dd>
    </div>
  )
}
