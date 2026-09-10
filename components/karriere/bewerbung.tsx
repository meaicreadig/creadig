"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowUpRight, Check } from "lucide-react"
import { useLocale } from "@/components/locale-provider"
import { contact } from "@/lib/site-data"
import { cn } from "@/lib/utils"
import {
  ROLLEN,
  TALENT_SPUREN,
  bewerbungAnnahmeAktiv,
  bewerbungFehlt,
  rolleFuer,
  type Bewerbung as BewerbungsDaten,
  type TalentSpur,
} from "@/lib/karriere"
import { bewerben, marken } from "@/lib/karriere-inhalt"

/*
 * ===========================================================================
 * VORSTELLEN — VIER SCHRITTE
 * ===========================================================================
 *
 * Gebaut wie der Termin-Assistent, aus demselben Grund: Ein Formular, das
 * alles auf einmal zeigt, wird ueberflogen; vier kurze Schritte werden
 * ausgefuellt. Der Schrittwechsel setzt den Fokus auf die neue Ueberschrift
 * und sagt sie an — dieselbe Loesung wie in `termin-wizard.tsx`, weil dort
 * derselbe Befund schon einmal behoben wurde.
 *
 * ---------------------------------------------------------------------------
 * DER LETZTE SCHRITT IST DER EIGENTLICHE
 *
 * Es gibt heute keinen Speicher fuer Bewerbungen (`bewerbungAnnahmeAktiv`).
 * Also gibt es hier auch keinen Ladebalken, keine Vorgangsnummer und kein
 * „Vielen Dank, gespeichert“. Stattdessen sammelt der letzte Schritt die
 * Angaben zusammen und uebergibt sie an den Weg, der heute wirklich
 * funktioniert: eine E-Mail, die der Mensch selbst absendet und in seinem
 * Postausgang wiederfindet.
 *
 * Das ist kein Notbehelf, den wir verstecken. Es steht dort als Satz — denn
 * die teuerste Luege dieser Seite waere eine Bestaetigung, hinter der
 * niemand steht.
 *
 * ---------------------------------------------------------------------------
 * WAS NICHT GEFRAGT WIRD
 * Geburtsdatum, Anschrift, Foto, Familienstand, Staatsangehoerigkeit,
 * Gehaltsvorstellung. Nichts davon braucht der erste Schritt, und was man
 * nicht erhebt, kann man auch nicht falsch aufbewahren.
 */

const SCHRITTE = 4

export function Bewerbung() {
  const { locale } = useLocale()
  const params = useSearchParams()

  const [schritt, setSchritt] = useState(1)
  const [daten, setDaten] = useState<BewerbungsDaten>({
    absicht: "" as TalentSpur,
    disziplinen: [],
    name: "",
    email: "",
    ort: "",
    nachweise: [""],
    warumCreadig: "",
    gebaut: "",
    verfuegbarAb: "",
    sprachen: "",
  })
  const [gepruefte, setGepruefte] = useState<Set<keyof BewerbungsDaten>>(new Set())
  const [kopiert, setKopiert] = useState(false)

  /* Vorauswahl aus dem Link — /karriere/bewerben?spur=founding-talent */
  useEffect(() => {
    const spur = params.get("spur")
    if (spur && (TALENT_SPUREN as readonly string[]).includes(spur)) {
      setDaten((d) => ({ ...d, absicht: spur as TalentSpur }))
    }
  }, [params])

  const kopfRef = useRef<HTMLHeadingElement>(null)
  const [ansage, setAnsage] = useState("")
  const ersterLauf = useRef(true)

  useEffect(() => {
    if (ersterLauf.current) {
      ersterLauf.current = false
      return
    }
    kopfRef.current?.focus()
    /*
      Der Abschluss ist KEIN fuenfter Schritt und hat deshalb auch keinen
      Eintrag in `bewerben.schritte`. Ohne diese Fallunterscheidung griff die
      Ansage auf `schritte[4]` zu — der Zugriff warf, React fing ihn ab, und
      statt der Zusammenfassung stand die 404-Seite da. Gefunden im Browser,
      nicht im Typ: Ein Index ausserhalb des Arrays ist in TypeScript
      standardmaessig kein Fehler.
    */
    const titel =
      schritt > SCHRITTE
        ? bewerben.abschlussTitel[locale]
        : `${schritt} / ${SCHRITTE} — ${bewerben.schritte[schritt - 1][locale]}`
    setAnsage(titel)
  }, [schritt, locale])

  const fehlend = bewerbungFehlt(daten)
  const zeigt = (feld: keyof BewerbungsDaten) => gepruefte.has(feld) && fehlend.includes(feld)

  /** Welche Felder dieser Schritt verantwortet. */
  const felderIm = (s: number): (keyof BewerbungsDaten)[] =>
    s === 1 ? ["absicht"] : s === 2 ? ["name", "email"] : s === 3 ? ["nachweise"] : ["warumCreadig"]

  function weiter() {
    const meine = felderIm(schritt)
    const offen = meine.filter((f) => fehlend.includes(f))
    if (offen.length > 0) {
      setGepruefte((g) => new Set([...g, ...meine]))
      return
    }
    setSchritt((s) => Math.min(s + 1, SCHRITTE + 1))
  }

  const eingabe =
    "w-full rounded-none border-0 border-b border-line-strong bg-transparent px-0 py-3 text-base text-foreground outline-none transition-colors duration-[var(--dur-1)] placeholder:text-muted-foreground focus:border-gold"
  const falsch = "border-destructive focus:border-destructive"

  /* ── Die Zusammenfassung, die der Mensch selbst verschickt ─────────────── */
  const zusammenfassung = () => {
    const rolle = daten.absicht ? rolleFuer(daten.absicht) : null
    const zeilen = [
      `${bewerben.schritte[0][locale]}: ${rolle ? rolle.titel[locale] : "—"}`,
      daten.disziplinen.length ? `${marken.disziplinen[locale]}: ${daten.disziplinen.join(", ")}` : null,
      `${bewerben.felder.name[locale]}: ${daten.name}`,
      `${bewerben.felder.email[locale]}: ${daten.email}`,
      daten.ort ? `${bewerben.felder.ort[locale]}: ${daten.ort}` : null,
      "",
      `${bewerben.felder.nachweise[locale]}:`,
      ...daten.nachweise.filter((n) => n.trim()).map((n) => `  - ${n}`),
      "",
      `${bewerben.felder.warum[locale]}:`,
      daten.warumCreadig,
      daten.gebaut ? `\n${bewerben.felder.gebaut[locale]}:\n${daten.gebaut}` : null,
      daten.sprachen ? `\n${bewerben.felder.sprachen[locale]}: ${daten.sprachen}` : null,
      daten.verfuegbarAb ? `${bewerben.felder.verfuegbar[locale]}: ${daten.verfuegbarAb}` : null,
    ]
    return zeilen.filter((z) => z !== null).join("\n")
  }

  const mailto = () =>
    `mailto:${contact.email}?subject=${encodeURIComponent(
      `${kopfBetreff[locale]} — ${daten.name}`,
    )}&body=${encodeURIComponent(zusammenfassung())}`

  return (
    <div className="mt-14">
      {/* Fortschritt — dieselbe Anlage wie im Termin-Assistenten. */}
      <div className="border-line flex items-center justify-between border-b pb-4">
        <p className="text-meta text-muted-foreground">
          {schritt > SCHRITTE ? SCHRITTE : schritt} / {SCHRITTE}
        </p>
        <ol className="flex gap-2">
          {bewerben.schritte.map((s, i) => (
            <li key={s.de} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  "h-px w-8 transition-colors duration-[var(--dur-2)] motion-reduce:transition-none",
                  i < schritt ? "bg-gold" : "bg-line-strong",
                )}
              />
              <span className="sr-only">{s[locale]}</span>
            </li>
          ))}
        </ol>
      </div>

      <p aria-live="polite" className="sr-only">
        {ansage}
      </p>

      <h2
        ref={kopfRef}
        tabIndex={-1}
        className="type-h3 mt-10 scroll-mt-28 text-balance outline-none"
      >
        {schritt > SCHRITTE
          ? bewerben.abschlussTitel[locale]
          : bewerben.schritte[schritt - 1][locale]}
      </h2>

      {/* ── 1 · Spur ──────────────────────────────────────────────────── */}
      {schritt === 1 && (
        <fieldset className="mt-10">
          <legend className="sr-only">{bewerben.schritte[0][locale]}</legend>
          <div className="grid gap-px sm:grid-cols-2">
            {ROLLEN.map((rolle) => {
              const gewaehlt = daten.absicht === rolle.spur
              return (
                <button
                  key={rolle.id}
                  type="button"
                  aria-pressed={gewaehlt}
                  onClick={() => setDaten((d) => ({ ...d, absicht: rolle.spur }))}
                  className={cn(
                    "border-line flex flex-col items-start gap-3 border p-7 text-start transition-colors duration-[var(--dur-2)] motion-reduce:transition-none",
                    gewaehlt ? "border-gold surface-raised" : "hover:bg-muted",
                  )}
                >
                  <span className="flex w-full items-start justify-between gap-4">
                    <span className="text-subhead text-lg">{rolle.titel[locale]}</span>
                    {gewaehlt && (
                      <Check className="text-gold-text mt-1 size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                    )}
                  </span>
                  <span className="type-small text-muted-foreground text-pretty">
                    {rolle.unterschied[locale]}
                  </span>
                </button>
              )
            })}
          </div>
          {zeigt("absicht") && (
            <p className="text-destructive type-small mt-4">{bewerben.pflichtFehlt[locale]}</p>
          )}

          {/* Handwerke nur bei „Produkt & Systeme“ — sonst waere es eine Frage ohne Zweck. */}
          {daten.absicht === "founding-talent" && (
            <div className="mt-10">
              <p className="eyebrow text-gold-text">{bewerben.felder.disziplinen[locale]}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {rolleFuer("founding-talent").disziplinen.map((disziplin) => {
                  const wert = disziplin.de
                  const an = daten.disziplinen.includes(wert)
                  return (
                    <button
                      key={wert}
                      type="button"
                      aria-pressed={an}
                      onClick={() =>
                        setDaten((d) => ({
                          ...d,
                          disziplinen: an
                            ? d.disziplinen.filter((x) => x !== wert)
                            : [...d.disziplinen, wert],
                        }))
                      }
                      className={cn(
                        "border-line rounded-full border px-5 py-2.5 text-sm transition-colors duration-[var(--dur-2)] motion-reduce:transition-none",
                        an ? "border-gold text-foreground" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {disziplin[locale]}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </fieldset>
      )}

      {/* ── 2 · Kontakt ───────────────────────────────────────────────── */}
      {schritt === 2 && (
        <div className="mt-10 grid max-w-2xl gap-8">
          <Feld label={bewerben.felder.name[locale]} pflicht>
            <input
              type="text"
              autoComplete="name"
              value={daten.name}
              onChange={(e) => setDaten((d) => ({ ...d, name: e.target.value }))}
              onBlur={() => setGepruefte((g) => new Set([...g, "name"]))}
              aria-invalid={zeigt("name") || undefined}
              className={cn(eingabe, zeigt("name") && falsch)}
            />
            {zeigt("name") && <Hinweis>{bewerben.pflichtFehlt[locale]}</Hinweis>}
          </Feld>
          <Feld label={bewerben.felder.email[locale]} pflicht>
            <input
              type="email"
              autoComplete="email"
              dir="ltr"
              value={daten.email}
              onChange={(e) => setDaten((d) => ({ ...d, email: e.target.value }))}
              onBlur={() => setGepruefte((g) => new Set([...g, "email"]))}
              aria-invalid={zeigt("email") || undefined}
              className={cn(eingabe, zeigt("email") && falsch)}
            />
            {zeigt("email") && <Hinweis>{bewerben.emailUngueltig[locale]}</Hinweis>}
          </Feld>
          <Feld label={bewerben.felder.ort[locale]}>
            <input
              type="text"
              value={daten.ort}
              onChange={(e) => setDaten((d) => ({ ...d, ort: e.target.value }))}
              className={eingabe}
            />
          </Feld>
        </div>
      )}

      {/* ── 3 · Arbeit ────────────────────────────────────────────────── */}
      {schritt === 3 && (
        <div className="mt-10 max-w-2xl">
          <p className="type-body text-muted-foreground text-pretty">
            {bewerben.felder.nachweisHinweis[locale]}
          </p>
          <div className="mt-8 flex flex-col gap-6">
            {daten.nachweise.map((wert, i) => (
              <Feld key={i} label={`${bewerben.felder.nachweise[locale]} ${i + 1}`} pflicht={i === 0}>
                <input
                  type="url"
                  inputMode="url"
                  /* Eine URL laeuft immer von links nach rechts, auch im
                     arabischen Satz. */
                  dir="ltr"
                  placeholder="https://"
                  value={wert}
                  onChange={(e) =>
                    setDaten((d) => {
                      const n = [...d.nachweise]
                      n[i] = e.target.value
                      return { ...d, nachweise: n }
                    })
                  }
                  onBlur={() => setGepruefte((g) => new Set([...g, "nachweise"]))}
                  aria-invalid={(i === 0 && zeigt("nachweise")) || undefined}
                  className={cn(eingabe, i === 0 && zeigt("nachweise") && falsch)}
                />
              </Feld>
            ))}
          </div>
          {zeigt("nachweise") && <Hinweis>{bewerben.pflichtFehlt[locale]}</Hinweis>}
          {daten.nachweise.length < 4 && (
            <button
              type="button"
              onClick={() => setDaten((d) => ({ ...d, nachweise: [...d.nachweise, ""] }))}
              className="text-gold-text hover:text-foreground mt-6 inline-flex items-center gap-2 text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
            >
              + {bewerben.felder.nachweise[locale]}
            </button>
          )}
        </div>
      )}

      {/* ── 4 · Kontext ───────────────────────────────────────────────── */}
      {schritt === 4 && (
        <div className="mt-10 grid max-w-2xl gap-8">
          <Feld label={bewerben.felder.warum[locale]} pflicht>
            <textarea
              rows={4}
              value={daten.warumCreadig}
              onChange={(e) => setDaten((d) => ({ ...d, warumCreadig: e.target.value }))}
              onBlur={() => setGepruefte((g) => new Set([...g, "warumCreadig"]))}
              aria-invalid={zeigt("warumCreadig") || undefined}
              className={cn(eingabe, "resize-y", zeigt("warumCreadig") && falsch)}
            />
            {zeigt("warumCreadig") && <Hinweis>{bewerben.pflichtFehlt[locale]}</Hinweis>}
          </Feld>
          <Feld label={bewerben.felder.gebaut[locale]}>
            <textarea
              rows={3}
              value={daten.gebaut}
              onChange={(e) => setDaten((d) => ({ ...d, gebaut: e.target.value }))}
              className={cn(eingabe, "resize-y")}
            />
          </Feld>
          <Feld label={bewerben.felder.sprachen[locale]}>
            <input
              type="text"
              value={daten.sprachen}
              onChange={(e) => setDaten((d) => ({ ...d, sprachen: e.target.value }))}
              className={eingabe}
            />
          </Feld>
          <Feld label={bewerben.felder.verfuegbar[locale]}>
            <input
              type="text"
              value={daten.verfuegbarAb}
              onChange={(e) => setDaten((d) => ({ ...d, verfuegbarAb: e.target.value }))}
              className={eingabe}
            />
          </Feld>
        </div>
      )}

      {/* ── 5 · Der ehrliche Schluss ──────────────────────────────────── */}
      {schritt > SCHRITTE && (
        <div className="mt-8 max-w-2xl">
          <p className="type-body text-foreground/85 text-pretty">
            {bewerbungAnnahmeAktiv ? "" : bewerben.abschlussText[locale]}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={mailto()}
              className="cta-outline inline-flex items-center gap-2.5 px-7 py-4 text-sm tracking-wide"
            >
              {bewerben.abschlussCta[locale]}
              <ArrowUpRight className="size-4 rtl:-scale-x-100" strokeWidth={1.5} />
            </a>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(zusammenfassung()).then(
                  () => setKopiert(true),
                  () => setKopiert(false),
                )
              }}
              className="text-muted-foreground hover:text-foreground text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
            >
              {kopiert ? bewerben.kopiert[locale] : bewerben.abschlussKopieren[locale]}
            </button>
          </div>

          {/* Was der Mensch gleich verschickt — sichtbar, bevor er es tut. */}
          <pre className="border-line bg-muted type-small text-foreground/80 mt-10 overflow-x-auto whitespace-pre-wrap border p-6">
            {zusammenfassung()}
          </pre>
        </div>
      )}

      {/* ── Steuerung ─────────────────────────────────────────────────── */}
      {schritt <= SCHRITTE && (
        <div className="border-line mt-12 flex items-center gap-6 border-t pt-8">
          {schritt > 1 && (
            <button
              type="button"
              onClick={() => setSchritt((s) => s - 1)}
              className="text-muted-foreground hover:text-foreground text-sm tracking-wide transition-colors duration-[var(--dur-2)]"
            >
              {bewerben.zurueck[locale]}
            </button>
          )}
          <button
            type="button"
            onClick={weiter}
            className="cta-outline inline-flex items-center gap-2.5 px-7 py-4 text-sm tracking-wide"
          >
            {schritt === SCHRITTE ? bewerben.abschliessen[locale] : bewerben.weiter[locale]}
          </button>
        </div>
      )}
    </div>
  )
}

/* Der Betreff nennt weder Ort noch Jahr — beides waere eine Behauptung. */
const kopfBetreff = {
  de: "Vorstellung — creaDIG",
  tr: "Tanışma — creaDIG",
  en: "Introduction — creaDIG",
  ar: "تعريف — creaDIG",
}

function Feld({
  label,
  pflicht,
  children,
}: {
  label: string
  pflicht?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="eyebrow text-muted-foreground">
        {label}
        {pflicht && <span className="text-gold-text"> *</span>}
      </span>
      {children}
    </label>
  )
}

function Hinweis({ children }: { children: React.ReactNode }) {
  return <span className="text-destructive type-small mt-2 block">{children}</span>
}
