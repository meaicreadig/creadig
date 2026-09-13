import { Hero } from "@/components/sections/hero"
import { HouseStatement } from "@/components/sections/house-statement"
import { Betriebsfluss } from "@/components/sections/betriebsfluss"
import { SelectedWork } from "@/components/sections/selected-work"
import { CapabilityTiles } from "@/components/sections/capability-tiles"
import { EntryLine } from "@/components/sections/entry-line"
import { Lagen } from "@/components/sections/lagen"
import { CaseStudies } from "@/components/sections/case-studies"
import { ImpactBand } from "@/components/sections/impact-band"
import { CompanyTeaser } from "@/components/sections/company-teaser"
import { InsightsTeaser } from "@/components/sections/insights-teaser"
import { ClosingCta } from "@/components/sections/closing-cta"

/**
 * DIE STARTSEITE IST EIN VERTEILER (PHASE A, Master-Prompt 4 §4).
 *
 * ---------------------------------------------------------------------------
 * WAS SICH GEÄNDERT HAT UND WARUM
 * Vorher standen hier 17 Sektionen: Hero, Impact, Logo-Wand, Werkschau,
 * Kundenfälle, Leistungen, Produkte, meAI, Prozess, Zertifizierungen,
 * Bewertungen, Über uns, Standort, Pakete, FAQ, Kontakt, Abschluss. Das ist
 * Landingpage-Architektur: eine lineare Verkaufsgeschichte auf einer
 * Scroll-Schiene, die alles selbst erklärt.
 *
 * creaDIG ist aber ein System-Haus mit eigenem Ökosystem — und das muss die
 * Seite STRUKTURELL zeigen, nicht behaupten. Eine große Website ist nicht
 * dasselbe wie eine lange Homepage. Jede Sektion hier reißt an und führt
 * tiefer; die Ausführung steht auf der Unterseite, auf die verlinkt wird.
 *
 * ---------------------------------------------------------------------------
 * WOHIN DIE ALTEN SEKTIONEN GEZOGEN SIND — gestrichen wurde nichts
 *   Logo-Wand (voll) · Über uns · Zertifizierungen → /unternehmen
 *   Logo-Streifen (3 Bahnen) bleibt auf der Startseite unter dem Hero.
 *   Werkschau, Register, Bewertungen       → /arbeiten
 *   Ebenen-Pyramide, Prozess, Pakete, FAQ  → /leistungen
 *   meAI-Deep-Dive                         → /produkte
 *   Kontaktformular                        → /kontakt
 *
 * ---------------------------------------------------------------------------
 * DIE REIHENFOLGE IST EIN ARGUMENT — UND EIN TAKT (VIS-2)
 * Arbeit kommt VOR der Erklärung (Sektion 3, groß). Vorher musste sich jemand
 * durch drei Sektionen Behauptung lesen, bevor er sah, ob wir etwas können.
 *
 * GATE 01 hat zwei Dinge daran geaendert:
 *
 *   WEB-0003 — Sektion 2 nennt jetzt das PROBLEM und nicht mehr das Haus.
 *   Das Ebenenmodell steht unveraendert an Position 4, aber es wird nicht
 *   mehr erklaert, bevor jemand weiss, warum es ihn angeht. Gemessen in
 *   Gate 00: 31 Eyebrows und 9 H2 vor der ersten Kundenwirkung.
 *
 *   WEB-0005 — die eigenen Produkte standen ZWEIMAL auf dieser Seite:
 *   als „Ausgewählte Arbeiten" (Sektion 3, zwei von vier, verlinkt auf
 *   `/arbeiten`) und als „Vier eigene Produkte" (Sektion 7, alle vier,
 *   verlinkt auf `/produkte`). Dieselbe Quelle, dieselbe Aussage, 4.800
 *   Pixel auseinander. Geblieben ist die Bildsektion; sie sagt jetzt, was
 *   sie zeigt, und fuehrt nach `/produkte`. `HouseProducts` steht
 *   vollstaendig auf der Produktseite und ist von hier gegangen.
 *
 * Neu ist, dass die Reihenfolge auch den RHYTHMUS trägt. Jede Sektion gehört
 * zu einem von drei Archetypen:
 *
 *   A · Editorial   ruhige Fläche, ein Satz, kein Raster
 *   B · Raster      das Hairline-Gitter, dicht und zählbar
 *   C · Band        randlos, dunkel oder Bild, mit Bewegung
 *
 * Gelesen von oben: C A C B A C — A — C. Keine zwei gleichen Archetypen
 * liegen nebeneinander. Mit `HouseProducts` an Position 7 stand nach dem
 * dunklen Band ein zweites Raster; ohne sie folgt auf das Band direkt die
 * Firmen-Zeile (A), und der Wechsel bleibt erhalten.
 *
 * ---------------------------------------------------------------------------
 * ZWEI SEKTIONEN RENDERN HEUTE NICHTS
 * `CaseStudies` und `InsightsTeaser` sind gated und verschwinden spurlos,
 * solange keine Freigabe bzw. keine Notiz vorliegt. Sie stehen hier trotzdem:
 * Sobald der Owner liefert, sind sie an der richtigen Stelle — ohne dass
 * jemand die Reihenfolge neu erfinden muss.
 *
 * Das FAQ-Schema ist mit der FAQ nach /leistungen gezogen; hier stünde es
 * über Inhalten, die auf dieser Seite nicht mehr sichtbar sind — und
 * strukturierte Daten müssen beschreiben, was auf der Seite steht.
 *
 * ---------------------------------------------------------------------------
 * WARUM DIESE DATEI KEINE ROUTE IST (GROW-1)
 * Sie liegt in `app/_routes/`. Ordner mit Unterstrich nimmt Next vom Routing
 * aus — der Inhalt hier ist also kein Pfad, sondern die eine Quelle, aus der
 * `/` (deutsch) und `/tr` (türkisch) gerendert werden. Die beiden
 * `page.tsx`-Dateien enthalten nichts als ihre Sprache. So kann keine der
 * beiden Fassungen der anderen davonlaufen.
 *
 * Die Sektionen selbst brauchen nichts davon zu wissen: Sie lesen ihre Texte
 * ohnehin über `useLocale()`, und das Layout hat die Sprache bereits gesetzt.
 */
export function HomeRoute() {
  return (
    <main id="top">
      {/* 1 · C — Wer wir sind, in einer Headline und vier Absprungpunkten. */}
      <Hero />

      {/*
        1b — HIER STAND DIE LOGO-WAND, UND SIE IST GEGANGEN.

        Gedacht war sie als Beweisband direkt unter dem Hero: eigene Produkte
        UND freigegebene Kundenlogos, drei Bahnen. Seit G13 nennt die Seite
        keinen Kunden ohne schriftliche Freigabe, `clientLogos` ist leer —
        uebrig blieben vier eigene Produkte.

        Gemessen am 09.09.2026 auf 1440 Pixeln: 266 Pixel Hoehe, fuenf
        Woerter, Dichte 0.15 — der mit Abstand duennste Abschnitt der Seite,
        der zweitduennste hatte mehr als das Doppelte. Und 4.800 Pixel
        weiter unten stehen dieselben vier Produkte noch einmal, dort aber
        mit Namen, Stand und Beschreibung („Unter dem Dach").

        Vier graue Zeichen, bevor jemand weiss, was fibero oder meahv ist,
        sind kein Beweis — sie sind Dekoration vor dem Verstaendnis. Die
        Angabe geht nicht verloren; sie steht an der Stelle, an der sie
        erklaert wird.

        Die Komponente bleibt. Sobald `clientLogos` traegt, ist sie wieder
        das, wofuer sie gebaut wurde — und gehoert dann wieder hierher.
      */}

      {/* 2 · A — creaDIG in einem Satz. Die erste Pause. */}
      <HouseStatement />

      {/*
        2b · SYSTEMBILD — die Antwort auf den Satz darueber, als Zeichnung.

        `HouseStatement` behauptet: „Die Arbeit ist da. Das System dahinter
        fehlt." Darunter erklaeren das rund 130 Woerter. Der Buyer-Audit
        nennt genau diese Stelle: zu viel erklaeren, zu wenig zeigen — und
        als groesste visuelle Luecke „kein Systembild, kein
        Signature-Moment".

        Die Sektion steht HIER und nicht weiter unten, weil der Satz
        darueber die Frage aufwirft, die sie beantwortet. Zwischen Aussage
        und Beweis gehoert nichts.

        Sie bricht zugleich den Takt: `HouseStatement` ist dunkel, das
        Systembild steht auf Papier, danach folgt das randlose Bildband.
        Dunkel → Papier → Bild, ohne zwei gleiche Grammatiken nebeneinander.
      */}
      <Betriebsfluss />

      {/* 3 · C — Beweis vor Erklärung: randloses Band, eigene Produkte. → /produkte */}
      <SelectedWork />

      {/*
        3b · DIE DREI LAGEN — wo gehoere ich hin, bevor die Architektur kommt.

        ZWEIMAL FALSCH PLATZIERT, BIS ES GEMESSEN WAR.

        Erst standen sie hinter den Ebenen und vor `EntryLine`. Zwei Gruende
        sprachen dagegen, und beide standen schon im Quelltext:

          · `EntryLine` gehoert DIREKT hinter die Ebenen. Der Kommentar
            darunter sagt warum: Wer gelesen hat, was das Haus alles macht,
            fragt als Naechstes nach dem Preis. Dazwischen gehoert nichts.

          · „Drei Wege hinein" landete damit unmittelbar neben „Drei Arten
            anzufangen" — zwei Abschnitte, die beide drei Moeglichkeiten
            anbieten, etwas zu beginnen. Nebeneinander gelesen ist das keine
            Fuehrung, sondern eine Gabelung zu viel.

        Gemessen kam dazu, dass Ebenen, Wege und Einstieg drei benachbarte
        Abschnitte mit derselben Grammatik waren — genau die Gleichfoermigkeit,
        gegen die diese Runde antritt.

        Hier steht die Frage richtig: Problem (Haltung) → Bild (Systembild) →
        Beleg (die zwei echten Aufnahmen) → WO GEHOERE ICH HIN → wie das Haus
        geordnet ist → was es kostet. Die Wege kommen VOR der Architektur,
        weil ein Kaeufer sich in einer Lage wiedererkennt und nicht in einem
        Ebenenmodell.
      */}
      <Lagen />

      {/* 4 · B — Die fünf Ebenen als Verteiler-Kacheln. → /leistungen */}
      <CapabilityTiles />

      {/*
        5 · A — MP10-2.1/2.2: der Einstieg. EINE Zahl, zwei Fragen.

        Er steht direkt hinter den Ebenen und nicht weiter unten, weil genau
        hier die Frage entsteht: Wer gerade gelesen hat, was das Haus alles
        macht, fragt als Naechstes, ob er sich das leisten kann. Keine Antwort
        an dieser Stelle heisst nicht „exklusiv", sondern „vermutlich zu
        teuer" — und der Leser beantwortet die Frage dann selbst, gegen uns.

        Es ist kein Paketblock: ein Satz mit einer Zahl, zwei gespiegelte
        Fragen, zwei Verweise. Die Preisleiter bleibt auf `/leistungen#pakete`.
      */}
      <EntryLine />

      {/*
        6 · C — Das dunkle Fundament-Band.
        Es stand vorher HINTER den Produkt-Kacheln, also lagen zwei
        Raster-Sektionen unmittelbar hintereinander. Zwischen ihnen bricht
        das Band den Takt: Papier → Anthrazit → Papier.
      */}
      <ImpactBand />

      {/*
        7 — HIER STAND „VIER EIGENE PRODUKTE", UND SIE IST GEGANGEN (WEB-0005).

        Die Sektion las `productWorks` — dieselbe Quelle wie die Bildsektion
        oben, nur als Liste statt als Band. Gemessen in Gate 00: dieselben
        vier Ziel-Links, dieselbe Aussage, auf derselben Seite.

        Geblieben ist das Band oben: Es traegt Bilder, also den Beweis, und es
        traegt den Takt (ohne es folgten zwei Rastersektionen aufeinander).
        Die Liste mit Stand, Region und Wirkung steht vollstaendig auf
        `/produkte` — einen Klick entfernt und dort ohne Dublette.

        Die Komponente bleibt im Bestand. Sie ist das, was `/produkte` heute
        rendert; von der Startseite ist sie genommen, nicht geloescht.
      */}

      {/* 8 — Ein tiefer Kundenfall (gated auf schriftliche Freigabe). */}
      <CaseStudies />

      {/*
        9 · A — MP10-2.5: WER, DANN WO. Die beiden Sektionen sind getauscht.

        Vorher stand das Standortbild vor der Firma: Ein Besucher sah eine
        Adresse, bevor er wusste, wessen Adresse das ist. Ein Ort belegt
        nichts, solange niemand dazu gehoert — umgekehrt macht er den Satz
        darueber ueberpruefbar.

        Damit ist der Sitz auch nur noch einmal Text und einmal Bild: Die
        Firmen-Zeile nennt ihn nicht mehr (sie steht direkt darueber), das
        Standortband darunter zeigt ihn. Genannt wird er sonst nur im
        Hero-Eyebrow und in der Fusszeile.
      */}
      <CompanyTeaser />

      {/*
        10 — DAS STANDORTBAND STEHT JETZT NUR NOCH AUF /unternehmen.

        Es stand hier UND dort, Wort fuer Wort dasselbe: „ICO
        InnovationsCentrum Osnabrueck", dreissig Woerter, 649 Pixel. Direkt
        darueber verweist `CompanyTeaser` bereits auf /unternehmen — wer den
        Sitz sucht, ist einen Klick entfernt und liest ihn dort einmal statt
        zweimal.

        Der Ort verschwindet damit nicht von der Startseite: Er steht im
        Hero-Eyebrow („Osnabrueck · seit 2017") und in der Fusszeile.
      */}

      {/*
        11 — HIER STAND DIE NACHWEIS-ZEILE, UND SIE IST GEGANGEN (V2-5).

        Sie zaehlte BAFA, iuk, AVPQ und AGD auf — vier Nachweise, von denen
        keiner belegt ist (KIZILELMA §9.9). Eine Zeile mit der Ueberschrift
        „Nachweisbar" ueber vier unbelegten Namen ist die teuerste Zeile, die
        eine Seite haben kann: Wer einen davon nachschlaegt und nichts
        findet, glaubt danach auch die Saetze nicht mehr, die stimmen.

        Sie kommt zurueck, wenn es etwas gibt, das ein Dritter bestaetigt.
        Nicht vorher, und nicht mit einem Ersatz, der aehnlich aussieht.
      */}

      {/* 12 — Notizen aus dem Bau (gated, bis die erste steht). → /insights */}
      <InsightsTeaser />

      {/* 13 · C — Schlussstrich, souverän: sprechen oder erst weiterschauen. */}
      <ClosingCta />
    </main>
  )
}
