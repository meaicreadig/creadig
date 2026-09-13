/**
 * DIE CREATIVE-PRIMITIVE — das gemeinsame Formvokabular der Seite.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE THESE, AUS DER ALLES HIER FOLGT
 *
 *     „Ein Betrieb ist eine Linie.
 *      In vielen Betrieben ist diese Linie unterbrochen."
 *
 * Deshalb gibt es genau drei Bausteine: eine LINIE (der Weg, den die Arbeit
 * nimmt), einen KNOTEN (eine Station, ein Zustand, ein Einstieg) und die
 * LUECKE (die Uebergabe von Hand, an der die Linie aufhoert).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE EINE REGEL: DIE LINIE IST SEMANTISCH, NIE DEKORATIV
 *
 * Eine Linie aus dieser Datei darf bedeuten: Fluss, Uebergabe, Verbindung,
 * Unterbrechung, Zustand, Weg, Fortschritt, Signal.
 *
 * Sie darf NICHT sein: ein Trennstrich, ein goldener Zierstrich, eine
 * Tapete. Dafuer gibt es `border-line` — das ist die Trennlinie des
 * Design-Systems und hat mit diesem Vokabular nichts zu tun.
 *
 * Wer eine Linie setzt, muss sagen koennen, was an ihr entlanglaeuft.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM NUR DREI BAUSTEINE
 *
 * Ein Vokabular mit vierzig Woertern ist kein Vokabular. Diese drei reichen
 * fuer alle vier Stellen, an denen die Seite heute ein System zeigt:
 *
 *   Systembild      waagerechter Fluss, gebrochen gegen verbunden
 *   Fuenf Ebenen    senkrechter Stapel, jede Ebene ein Einstieg
 *   Das Haus        senkrechter Stapel mit Fundament und Querbalken
 *   Hero            ein einzelner Fluss, der aus der Luecke in die Linie laeuft
 *
 * Kommt eine fuenfte Stelle dazu, erbt sie dasselbe Vokabular. Genau das
 * unterscheidet ein Creative-System von einer Sammlung schoener Sektionen.
 */

/** Wie eine Strecke gelesen wird. */
export type SystemTon = "offen" | "verbunden"

/**
 * Die Achse.
 *
 *   `fluss`   waagerecht ab `md`, auf dem Telefon senkrecht. Fuer Ablaeufe,
 *             die in der Zeit laufen — auf 390 Pixeln ist senkrecht die
 *             natuerliche Leserichtung, nicht ein Notbehelf.
 *   `stapel`  immer senkrecht. Fuer Ebenen, die aufeinander stehen; ein
 *             Stapel, der auf dem Schreibtisch waagerecht laege, waere kein
 *             Stapel mehr.
 */
export type SystemAchse = "fluss" | "stapel"

/**
 * EIN KNOTEN — eine Station, ein Zustand, ein Einstieg.
 *
 * `puls` laesst ihn im Takt seines Platzes aufleuchten; dadurch wandert das
 * Signal sichtbar in eine RICHTUNG, statt zu blinken. Die Ruhestufe ist
 * sichtbar und nicht null: Ein Knoten, der zwischen zwei Pulsen verschwindet,
 * zerreisst die Strecke — und das ist die Aussage der anderen Strecke.
 */
export function SystemNode({
  ton,
  puls = false,
  verzug = 0,
  gross = false,
  aktivierbar = false,
}: {
  ton: SystemTon
  puls?: boolean
  verzug?: number
  gross?: boolean
  /**
   * Der Knoten reagiert auf `group-hover` des umgebenden Elements.
   *
   * Das ersetzt den goldenen Strich, der vorher beim Ueberfahren einer
   * Ebenenzeile von links nach rechts einlief. Der Strich war huebsch und
   * bedeutete nichts — genau die Sorte Linie, die dieses Vokabular
   * ausschliesst. Ein Knoten, der groesser wird, sagt dagegen etwas: DIESE
   * Station ist gerade aktiv.
   */
  aktivierbar?: boolean
}) {
  return (
    <span
      aria-hidden="true"
      style={puls ? { animationDelay: `${verzug * 0.32}s` } : undefined}
      className={[
        "relative z-1 shrink-0 rounded-full",
        gross ? "size-[9px]" : "size-[7px]",
        ton === "verbunden" ? "bg-gold" : "bg-muted-foreground/45",
        puls ? "animate-signal" : "",
        aktivierbar
          ? "ease-brand transition-transform duration-[var(--dur-2)] group-hover:scale-[1.9] group-focus-visible:scale-[1.9]"
          : "",
      ].join(" ")}
    />
  )
}

/**
 * EIN HALBES STRECKENSTUECK — die Haelfte vor oder nach einem Knoten.
 *
 * WARUM HALBE STUECKE UND NICHT GANZE ZWISCHEN DEN KNOTEN
 * Ein ganzes Stueck zwischen zwei Stationen macht die Zellen ungleich: Die
 * erste haette keines, alle anderen je eines. Gemessen im Bild standen dann
 * die ersten beiden Stationen dicht beieinander, waehrend am Ende Platz
 * blieb. Mit je einer Haelfte pro Seite ist jede Zelle gleich gebaut — und
 * die Luecke faellt automatisch genau auf die Grenze zwischen zwei Stationen.
 *
 * WARUM DIE LUECKE EINE ECHTE LUECKE IST
 * Der erste Versuch zeichnete eine durchgehende graue Linie und setzte an
 * jede Uebergabe einen kurzen Querstrich. Im Bild las sich das wie die Skala
 * eines Lineals: eine Linie mit Markierungen, nicht eine unterbrochene
 * Linie. Der einzige Satz, den die Zeichnung sagen soll, war nicht zu sehen.
 * Jetzt hoert die Linie vor der Grenze auf. Dazwischen steht Papier.
 */
export function SystemLine({
  ton,
  seite,
  achse = "fluss",
  unsichtbar = false,
  kraeftig = false,
}: {
  ton: SystemTon
  seite: "vor" | "nach"
  achse?: SystemAchse
  unsichtbar?: boolean
  kraeftig?: boolean
}) {
  const luecke =
    ton === "offen"
      ? achse === "stapel"
        ? seite === "vor"
          ? "mt-3"
          : "mb-3"
        : seite === "vor"
          ? "mt-4 md:mt-0 md:ms-4"
          : "mb-4 md:mb-0 md:me-4"
      : ""

  return (
    <span
      aria-hidden="true"
      className={[
        "block flex-1",
        achse === "stapel"
          ? kraeftig
            ? "w-[2px] min-h-4"
            : "w-px min-h-4"
          : "w-px min-h-5 md:h-px md:w-auto md:min-h-0",
        luecke,
        unsichtbar ? "bg-transparent" : ton === "verbunden" ? "bg-gold/60" : "bg-muted-foreground/30",
      ].join(" ")}
    />
  )
}

/**
 * DIE SCHIENE — ein Knoten mit seinen beiden Streckenhaelften.
 *
 * Sie ist der Baustein, den jede Liste benutzt: Ihre Flussrichtung folgt der
 * Achse, und sie weiss selbst, dass am Anfang und am Ende einer Strecke
 * nichts weitergeht.
 */
export function SystemRail({
  ton,
  achse = "fluss",
  erste = false,
  letzte = false,
  puls = false,
  verzug = 0,
  gross = false,
  kraeftig = false,
  aktivierbar = false,
  ausrichtung = "mitte",
}: {
  ton: SystemTon
  achse?: SystemAchse
  erste?: boolean
  letzte?: boolean
  puls?: boolean
  verzug?: number
  gross?: boolean
  kraeftig?: boolean
  aktivierbar?: boolean
  /**
   * Wo der Knoten in einer unterschiedlich hohen Zeile sitzt.
   *
   * `mitte` ist richtig, wenn alle Zellen gleich hoch sind. In einer Liste
   * mit verschieden langen Beschreibungen wandert der Knoten dagegen mit der
   * Zeilenhoehe — gemessen im Bild lag er bei „Identity" rund zwanzig Pixel
   * unter der Ueberschrift, die er markieren soll. `kopf` haengt ihn an die
   * erste Zeile, also an das, was er bezeichnet.
   */
  ausrichtung?: "mitte" | "kopf"
}) {
  return (
    <span
      /* Feste Marke fuer Messungen: „welche Abschnitte tragen ein Systembild?"
         laesst sich damit im gerenderten DOM zaehlen, statt am Quelltext zu
         raten. Sie kostet nichts und traegt keine Bedeutung fuer den Leser. */
      data-system-rail={achse}
      className={[
        "relative flex shrink-0 flex-col items-center",
        achse === "fluss" ? "md:w-full md:flex-row" : "self-stretch",
      ].join(" ")}
    >
      {ausrichtung === "kopf" ? (
        <span
          aria-hidden="true"
          className={[
            "block h-9 w-px shrink-0",
            erste ? "bg-transparent" : ton === "verbunden" ? "bg-gold/60" : "bg-muted-foreground/30",
          ].join(" ")}
        />
      ) : (
        <SystemLine ton={ton} seite="vor" achse={achse} unsichtbar={erste} kraeftig={kraeftig} />
      )}
      <SystemNode ton={ton} puls={puls} verzug={verzug} gross={gross} aktivierbar={aktivierbar} />
      <SystemLine ton={ton} seite="nach" achse={achse} unsichtbar={letzte} kraeftig={kraeftig} />
    </span>
  )
}
