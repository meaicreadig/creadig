"use client"

import { useLocale } from "@/components/locale-provider"
import { Reveal } from "@/components/ui/reveal"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion"

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

/** Ein Punkt auf der Spur. */
function Knoten({ gold, puls, verzug }: { gold?: boolean; puls?: boolean; verzug: number }) {
  return (
    <span
      aria-hidden="true"
      style={puls ? { animationDelay: `${verzug * 0.32}s` } : undefined}
      className={[
        "relative z-1 size-[7px] shrink-0 rounded-full",
        gold ? "bg-gold" : "bg-muted-foreground/45",
        puls ? "animate-signal" : "",
      ].join(" ")}
    />
  )
}

/**
 * Ein halbes Streckenstueck — die Haelfte links bzw. oberhalb eines Knotens
 * oder die Haelfte rechts bzw. unterhalb.
 *
 * WARUM HALBE STUECKE UND NICHT GANZE ZWISCHEN DEN KNOTEN
 * Ein ganzes Stueck zwischen zwei Stationen macht die Zellen ungleich breit:
 * Die erste haette keines, die anderen je eines. Genau das war der erste
 * Versuch, und gemessen im Bild standen „Anfrage" und „Angebot" dicht
 * beieinander, waehrend rechts Platz blieb.
 *
 * Mit je einer Haelfte pro Seite ist JEDE Zelle gleich gebaut — sechs
 * gleich breite Spalten, der Knoten immer in der Mitte, die Beschriftung
 * darunter zentriert. Die Bruchstelle faellt dann automatisch genau auf die
 * Zellgrenze, also zwischen zwei Stationen.
 */
function Streckenstueck({
  gebrochen,
  unsichtbar,
  seite,
}: {
  gebrochen: boolean
  unsichtbar?: boolean
  seite: "vor" | "nach"
}) {
  /*
    DIE LUECKE IST DAS ARGUMENT — also muss sie eine echte Luecke sein.
    Der erste Versuch zeichnete eine durchgehende graue Linie und setzte an
    jede Uebergabe einen kurzen Querstrich. Im Bild gemessen las sich das
    wie die Skala eines Lineals: eine Linie mit Markierungen, nicht eine
    unterbrochene Linie. Damit war der einzige Satz, den die Zeichnung sagen
    soll, nicht zu sehen.
    Jetzt hoert das Streckenstueck vor der Zellgrenze auf. Zwischen zwei
    Stationen steht Papier. Nichts erklaert das; man sieht es.
  */
  const luecke = gebrochen
    ? seite === "vor"
      ? "mt-4 md:mt-0 md:ms-4"
      : "mb-4 md:mb-0 md:me-4"
    : ""

  return (
    <span
      aria-hidden="true"
      className={[
        "block flex-1",
        /* senkrecht auf dem Telefon, waagerecht ab md */
        "w-px min-h-5 md:h-px md:w-auto md:min-h-0",
        luecke,
        unsichtbar ? "bg-transparent" : gebrochen ? "bg-muted-foreground/30" : "bg-gold/60",
      ].join(" ")}
    />
  )
}

/** Eine Spur: sechs Stationen, gleich breite Zellen. */
function Spur({
  stationen,
  gebrochen,
  label,
  note,
  puls,
}: {
  stationen: readonly string[]
  gebrochen: boolean
  label: string
  note: string
  puls: boolean
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className={`eyebrow ${gebrochen ? "text-muted-foreground" : "text-gold-text"}`}>
          {label}
        </span>
        <span className="type-small text-muted-foreground">{note}</span>
      </div>

      <ol className="mt-6 flex flex-col md:flex-row md:items-stretch">
        {stationen.map((station, i) => {
          const ersteZelle = i === 0
          const letzteZelle = i === stationen.length - 1

          return (
            <li key={station} className="flex flex-1 items-stretch gap-4 md:flex-col md:gap-0">
              {/*
                Die Schiene. Auf dem Telefon eine Spalte links neben der
                Beschriftung, ab md eine Zeile darueber — dieselben Elemente,
                nur andere Flussrichtung.
              */}
              <span className="relative flex shrink-0 flex-col items-center md:w-full md:flex-row">
                <Streckenstueck seite="vor" gebrochen={gebrochen} unsichtbar={ersteZelle} />
                <Knoten gold={!gebrochen} puls={puls} verzug={i} />
                <Streckenstueck seite="nach" gebrochen={gebrochen} unsichtbar={letzteZelle} />
              </span>

              {/*
                AUF DEM TELEFON MUSS DIE BESCHRIFTUNG AUF IHREM KNOTEN LIEGEN.
                Zuerst stand hier `pb-7`: Die Beschriftung klebte oben an der
                Zelle, der Knoten sass in deren Mitte — im Bild lag damit jedes
                Wort eine Station ueber seinem Punkt. `self-center` stellt
                beide auf dieselbe Achse; den Abstand zwischen den Stationen
                tragen die Streckenstuecke, nicht ein Innenabstand.
              */}
              <span
                className={`type-small self-center py-4 md:mt-4 md:self-auto md:py-0 md:text-center ${
                  gebrochen ? "text-muted-foreground" : "text-foreground"
                }`}
              >
                {station}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function Betriebsfluss() {
  const { t } = useLocale()
  const copy = t.home.betriebsfluss
  const reduce = usePrefersReducedMotion()

  return (
    <section id="systembild" aria-labelledby="systembild-title" className="section-seam">
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
        <Reveal delay={0.15} className="mt-14 flex flex-col gap-12 md:gap-14">
          <Spur
            stationen={copy.stations}
            gebrochen
            label={copy.todayLabel}
            note={copy.todayNote}
            puls={false}
          />
          <Spur
            stationen={copy.stations}
            gebrochen={false}
            label={copy.systemLabel}
            note={copy.systemNote}
            puls={!reduce}
          />
        </Reveal>

        {/*
          Die Modell-Kennzeichnung steht am Bild, nicht in der Fusszeile.
          Wer sie erst unten findet, hat das Bild vorher als Messung gelesen.
        */}
        <Reveal delay={0.2}>
          <p className="text-meta text-muted-foreground border-line mt-10 max-w-xl border-t pt-4">
            {copy.modelNote}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
