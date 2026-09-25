"use client"

import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { SystemRail } from "@/components/creative/system"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"
import { useSeenOnce } from "@/lib/use-seen-once"

/**
 * DAS SYSTEMBILD — der Signature-Moment des Creative-Systems.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM ES DIESE SEKTION GIBT
 *
 * Der Buyer-Audit nennt die zentrale visuelle Luecke beim Namen: Das
 * Design-System ist stark (Palette, Typo, Haarlinien), das Creative-System
 * fehlt — „kein visuelles Leitmotiv, keine Systemdarstellung, keinen
 * Signature-Moment; das System wird erzaehlt, nicht gezeigt."
 *
 * Zwei Abschnitte weiter oben steht der Satz, der die ganze Firma traegt:
 *
 *     „Die Arbeit ist da. Das System dahinter fehlt."
 *
 * Darunter erklaeren ihn rund 130 Woerter. Genau das ist das Problem: Der
 * Satz beschreibt eine UNTERBROCHENE LINIE — und eine unterbrochene Linie
 * muss man nicht beschreiben. Man kann sie zeigen.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DIE HAARLINIE UND NICHTS NEUES
 *
 * Die Seite besitzt die Haarlinie bereits; sie trennt heute Abschnitte und
 * Tabellenzeilen, also dekorativ. Hier bekommt dasselbe Element eine
 * Bedeutung: Sie ist der WEG, den die Arbeit durch den Betrieb nimmt.
 *
 * Damit wird kein fremdes Formvokabular importiert (kein Netzwerkgraph,
 * keine Partikel, kein 3D). Das Bild ist aus dem gebaut, was die Marke
 * ohnehin hat — deshalb sieht es nach creaDIG aus und nicht nach einem
 * Template mit Diagramm.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM DIE SECHS STATIONEN KEINE NEUE BEHAUPTUNG SIND
 *
 * Sie stehen wortgleich schon in `lib/branchen.ts`:
 *
 *     „Anfrage, Angebot, Termin, Auftrag, Dokumentation, Rechnung —
 *      sechs Schritte, meist sechs Werkzeuge."
 *
 * Das Bild sagt also nichts, was die Firma nicht sagt. Es sagt es in zwei
 * Sekunden statt in einem Absatz.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS DAS BILD AUSDRUECKLICH NICHT IST
 *
 * Es ist KEIN Vorher/Nachher eines Kunden. Es gibt keine gemessene
 * Ersparnis, und es wird keine behauptet — `modelNote` steht deshalb AM
 * BILD und nicht im Kleingedruckten. Ein unbeschriftetes Vorher/Nachher
 * wuerde als Messung gelesen, und das waere nach der Beleg-Ordnung eine
 * erfundene Kennzahl.
 *
 * Die leere Beweisflaeche auf `/arbeiten` ersetzt dieses Bild nicht. Ein
 * Modell ist kein Kundenbeleg, und es tut auch nicht so.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * EIN DOM, ZWEI RICHTUNGEN
 *
 * Auf dem Telefon steht die Spur SENKRECHT, auf dem Schreibtisch WAAGERECHT
 * — nicht als gestapeltes Desktop, sondern als dieselbe These um 90 Grad
 * gedreht. Senkrecht ist auf einem Telefon ohnehin die natuerliche
 * Leserichtung.
 *
 * Beides rendert aus demselben Markup: Die `li` wechselt von Zeile
 * (`flex-row`) auf Spalte (`md:flex-col`), und die Verbinder wechseln
 * mit ihr von `w-px` auf `h-px`. Zwei getrennte Implementierungen wuerden
 * auseinanderlaufen, sobald jemand eine Station aendert.
 *
 * Richtungsangaben sind logisch (`start`/`end`), nicht links/rechts —
 * im Arabischen laeuft die Spur von rechts nach links, ohne Sonderfall.
 */

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * V2 — WAS DAS BILD JETZT ZUSAETZLICH SAGT (W3)
 *
 * Abstrakte Knoten zeigt jeder iPaaS. Zwei Dinge machen es zu diesem Haus:
 *
 *   · Unter der getrennten Spur stehen die ECHTEN Werkzeuge — WhatsApp,
 *     Excel, Kalender, Zettel, E-Mail, Rechnungsprogramm. Ein Handwerker
 *     erkennt seinen Tag, keine Infografik.
 *   · Die Gold-Spur endet in einer Marke: „Gehoert Ihnen: Code und Daten".
 *     Das ist das Alleinstellungsmerkmal, das bisher nur als Fliesstext stand.
 *
 * Der Zustandswechsel getrennt → verbunden passiert GENAU EINMAL, beim ersten
 * Einblenden, und nur als CSS (`clip-path`, siehe `globals.css`). Ohne JS und
 * bei reduzierter Bewegung steht der verbundene Zustand sofort da — die
 * Animation darf entfallen, die Information nie.
 */

/** Eine Spur: sechs Stationen, gleich breite Zellen. */
function Spur({
  stationen,
  werkzeuge,
  gebrochen,
  label,
  zaehler,
  note,
  puls,
  uebergabeSr,
  eigentum,
}: {
  stationen: readonly string[]
  werkzeuge?: readonly string[]
  gebrochen: boolean
  label: string
  zaehler: string
  note: string
  puls: boolean
  uebergabeSr?: string
  eigentum?: string
}) {
  return (
    <div data-spur={gebrochen ? "getrennt" : "system"}>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className={`eyebrow ${gebrochen ? "text-muted-foreground" : "text-gold-text"}`}>
          {label}
        </span>
        <span className={`text-subhead text-base ${gebrochen ? "text-muted-foreground" : "text-foreground"}`}>
          {zaehler}
        </span>
        <span className="type-small text-muted-foreground">{note}</span>
      </div>

      <div className="betriebsfluss-spur">
        <ol className="mt-6 flex flex-col md:flex-row md:items-stretch">
          {stationen.map((station, i) => {
            const ersteZelle = i === 0
            const letzteZelle = i === stationen.length - 1
            const werkzeug = werkzeuge?.[i]

            return (
              <li key={station} className="flex flex-1 items-stretch gap-4 md:flex-col md:gap-0">
                <SystemRail
                  ton={gebrochen ? "offen" : "verbunden"}
                  achse="fluss"
                  erste={ersteZelle}
                  letzte={letzteZelle}
                  puls={puls}
                  verzug={i}
                />

                {/*
                  Mobil steht das Werkzeug RECHTS neben der Station, nicht
                  darunter — sonst verdoppelt sich die Hoehe der Spur. Ab md
                  stehen beide mittig unter dem Knoten.
                */}
                <span className="flex flex-wrap items-baseline gap-x-3 self-center py-4 md:mt-4 md:flex-col md:items-center md:gap-y-1 md:self-auto md:py-0 md:text-center">
                  <span
                    className={`text-base md:text-lg ${gebrochen ? "text-muted-foreground" : "text-foreground"}`}
                  >
                    {station}
                  </span>
                  {werkzeug && <span className="text-meta text-muted-foreground">{werkzeug}</span>}
                  {gebrochen && !letzteZelle && uebergabeSr && (
                    <span className="sr-only">{uebergabeSr}</span>
                  )}
                </span>
              </li>
            )
          })}
        </ol>

        {eigentum && (
          <p className="mt-6 flex justify-end md:mt-5">
            <span className="border-gold/60 text-gold-text text-meta inline-flex items-center gap-2 rounded-full border px-3 py-1.5">
              <span aria-hidden="true" className="bg-gold size-[7px] rounded-full" />
              {eigentum}
            </span>
          </p>
        )}
      </div>
    </div>
  )
}

export function Betriebsfluss() {
  const { t } = useLocale()
  const copy = t.home.betriebsfluss
  const reduce = usePrefersReducedMotion()
  const { ref, seen, bereit } = useSeenOnce<HTMLElement>()

  /* Server-HTML, vor der Hydration und bei reduzierter Bewegung: verbunden. */
  const zustand = !bereit || seen || reduce ? "verbunden" : "getrennt"

  return (
    <section
      ref={ref}
      id="systembild"
      aria-labelledby="systembild-title"
      className="section-seam"
      data-state={zustand}
    >
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <SectionEyebrow label={copy.eyebrow} />
            <h2 id="systembild-title" className="type-h2 mt-7 text-balance">
              {copy.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 lg:pb-2">
            <p className="type-lead text-muted-foreground max-w-md text-pretty">{copy.lead}</p>
          </Reveal>
        </div>

        {/*
          Die beiden Spuren stehen UNTEREINANDER, nicht nebeneinander.
          Nebeneinander waeren es zwei Bilder, die man vergleicht; untereinander
          ist es dieselbe Strecke zweimal — und der Unterschied liegt genau
          dort, wo das Auge ohnehin hinspringt.
        */}
        <div className="mt-14 flex flex-col gap-12 md:gap-14">
          <Spur
            stationen={copy.stations}
            werkzeuge={copy.tools}
            gebrochen
            label={copy.todayLabel}
            zaehler={copy.handoffCount}
            note={copy.todayNote}
            puls={false}
            uebergabeSr={copy.handoffSr}
          />
          <Spur
            stationen={copy.stations}
            gebrochen={false}
            label={copy.systemLabel}
            zaehler={copy.systemCount}
            note={copy.systemNote}
            puls={false}
            eigentum={copy.ownership}
          />
        </div>

        {/*
          Die Modell-Kennzeichnung steht am Bild, nicht in der Fusszeile.
          Wer sie erst unten findet, hat das Bild vorher als Messung gelesen.
        */}
        <p className="text-meta text-muted-foreground border-line mt-10 max-w-xl border-t pt-4">
          {copy.modelNote}
        </p>
      </div>
    </section>
  )
}
