# creaDIG — Terminal-Master-Prompt 11 · KOMPLETTE TIEFENANALYSE

> **Auftrag:** EINE vollständige, tiefe Analyse — von **Design/Corporate Identity** über Motion,
> Struktur, Inhalt, Technik bis Positionierung. **NUR ANALYSE. KEINE Implementierung.**
> **Ergebnis = EIN Dokument** (`creadig-TIEFENANALYSE.md`).
> Reihenfolge: **erst lesen** (Code + bestehende Analysen) → **denken** → **schreiben**.
> Ausführung in EINEM Durchgang, **nur finaler STOPP**. Deutsch.

---

## 0 · NICHT VERHANDELBAR
- **NUR ANALYSE.** Keine Änderung an `components/`, `lib/`, `app/`, `styles/`, `globals.css`; keine Features,
  kein Motiv-Code, keine Motion-Implementierung, kein Redesign. **Wer eine Zeile App-Code ändert, hat den
  Auftrag verfehlt.** Diese Runde bereitet das Redesign VOR, sie macht es nicht.
- **Ausgabe:** ein neues Dokument `creadig-TIEFENANALYSE.md`. Am Ende **nur dieses Doc** committen
  (`git add creadig-TIEFENANALYSE.md`), **nicht** die vorhandenen uncommitteten App-Änderungen mitnehmen.
  **Nicht pushen, nicht nach `main`, kein Force-Push.**
- **Working Tree:** enthält gerade uncommittete Design-Vorschau-Experimente (`signature-motif.tsx` steht auf
  `return null` = Motiv global aus; `components/hero/living-field.tsx` neu; `hero.tsx` angepasst). Das ist der
  **Ist-Zustand — so analysieren**, nicht anfassen, nicht committen, nicht zurücksetzen.
- **Ehrlichkeit (Black Lock):** nichts erfinden. Wo Material/Beleg fehlt, benennen.
- **Tiefe:** opinionated, mit **Belegen aus dem echten Code** (`Datei:Zeile`), nicht generisch. Kein
  BNX-Vergleich als Selbstzweck — der Owner will die Analyse **des EIGENEN Designs**, nicht eine Tabelle.

## 1 · ZUERST LESEN (darauf aufbauen, nicht wiederholen)
- Doku: `KIZILELMA-creaDIG.md` (§1 Kern … §11), `ANALYSE-creaDIG.md`, `creadig-DESIGN-IDENTITAET.md`,
  `creadig-AUDIT-BACKLOG.md`, `creadig-LIVE-CHECKLISTE.md`.
- Code: `app/globals.css` (Tokens: Farbe, **Radius**, Typo, Spacing, Motion), `components/brand/signature-motif.tsx`,
  `components/hero/*`, `components/sections/*`, `components/ui/*` (Buttons/Karten/Radius!), `lib/dictionary.ts`
  (Marke/Copy), `lib/site-data.ts`, Tailwind-Theme.
- Ziel: feststellen, **was schon analysiert ist und wo die echte Lücke liegt** — dann TIEFER gehen.

## 2 · FESTE RAHMEN (als Prüfsteine, nicht als Ergebnis)
- **Marke:** System-Haus, „Wir bauen, was andere nicht sehen.", eigene Produkte (meAI/fibero/CASSAMEA/meahv),
  DACH + **DE/TR-Nische**, gegr. **2017**, Sitz ICO Osnabrück, Zielgruppe **Handwerk/KMU + türkischsprachige
  Betriebe** — also menschennah, nicht Konzern.
- **Owner-Signale zur Optik — als HYPOTHESEN prüfen und BEGRÜNDEN (nicht blind übernehmen):**
  1. **„Zu still."** Die Seite braucht **kontrollierte Bewegung**, kein BNX-Chaos. Zu prüfende Formel:
     **~85 % Ruhe / ~15 % präzise Bewegung** (aktuell gefühlt ~3 %).
  2. **„Runder / wärmer."** Der Owner will **weichere Formen — gerundete Ecken, Buttons und Kanten gerundet.**
     Die aktuelle Sprache ist **scharf/kalt** (Hairlines, spitze Ecken). **These zu prüfen:** Form↔Botschaft-
     Spannung — kalte Optik vs. warme, menschennahe Marke. Radius-Ist-Wert im Code messen und bewerten.
  3. **Motiv ohne Bedeutung/Ordnung.** Dreiecks-Grid als CI **mehrfach verworfen**; die aktuelle Node-Linien-
     Vorschau wirkt **„ohne Logik/unordentlich"**. Ein CI-Motiv muss **Bedeutung + Ordnung** tragen, nicht Deko.
  4. **BNX (bnx.de)** = Referenz für „lebendig", aber **zu laut** — NICHT nachbauen.
- **Owner-Vorschläge, die eingeordnet werden sollen** (kamen vom Owner/„kuzu", also prüfen, nicht abnicken):
  Motion-DNA in 3 Stufen (Atmosphäre / Scroll-Choreografie / Produkt-Beweis), max. 1 Effekt pro Sektion;
  „5-Token-CD als Zwischen-System"; Light-Mode als Default für die Zielgruppe.

## 3 · DIE ANALYSE — PFLICHT-DIMENSIONEN (je: Befund · Beleg · Bewertung)

### 3.1 Corporate Identity / visuelle Sprache — KERN, AM TIEFESTEN
- Gibt es eine **generative Leitidee**, aus der alles ableitbar ist? (Arbeitsthese: **nein** — eine Sammlung von
  Einzelentscheidungen ohne verbindendes Prinzip; deshalb „premium Template".)
- **Token-Audit:** Farbe, **Radius** (scharf vs. Owner-Wunsch „rund"), Typo, Spacing, Motiv — intern kohärent?
- **Form↔Botschaft:** passt scharf/kalt zu „menschennah, Handwerk, DE/TR, wir sind an eurer Seite"?
- **Motiv:** welche Bedeutung trägt es heute (Dreieck/Node = keine)? Was WÄRE ein bedeutungstragendes,
  **geordnetes** Motiv für „unsichtbare Systeme sichtbar **und menschlich** machen"?
- **Vorschlag EINER generativen Leitidee** + vollständige Ableitung des Systems (Geometrie/**Radius**,
  Motiv-Logik, Farbe/„warmes Anthrazit statt reinem Schwarz", Typo-Charakter, Bildsprache) — als **begründete
  Empfehlung**, nicht als Code.
- **Reifegrad ehrlich beziffern** (Owner sagt ~10 %) — je Teilbereich.

### 3.2 Motion / „Tech-Energie"
- Ist-Motion messen (nur Scroll-Reveal + Hero-once?). Wo ist es tot?
- **Motion-DNA-Regelwerk** vorschlagen: 3 Stufen, pro Sektion max. 1 Effekt, ~15 %, `prefers-reduced-motion`.
  Wo genau welche Bewegung — **begründet**, kein Effekt ohne Grund.

### 3.3 Struktur / IA / Rhythmus
- Seitenarchitektur, **Sektions-Takt** (Wiederholung eyebrow→heading→text→cards), Hierarchie, Conversion-Pfad
  (`/termin` vs `/kontakt`), Navigation. Wo ermüdet der Rhythmus?

### 3.4 Inhalt / Beweis / Vertrauen — „leere Bühne"
- Welche Sektionen sind gated/leer? Was macht die Bühne voll (Produkt-UI, Cases, Fotos, Team)? Ehrlichkeits-
  Gating bewerten. **Der unsichtbare Moat:** die eigenen Produkte werden nirgends GEZEIGT — das ist der
  größte visuelle Verlust.

### 3.5 Technik / Frontend
- Token-/CSS-Architektur (`globals.css`): wie leicht ist ein NEUES CI anwendbar (ein Radius-Token, ein Motiv-
  Slot, Motion-Tokens)? Qualität der Motiv-/Motion-Implementierung. Perf/a11y-Relevanz fürs Visuelle.

### 3.6 Positionierung / Wettbewerb — als INPUT, nicht Selbstzweck
- Wo sitzt creaDIG visuell/positionell? BNX + Segment nur als Referenzpunkte: was der Markt signalisiert,
  wohin creaDIG optisch muss (System-Haus mit Substanz, nicht Show).

## 4 · SYNTHESE (das Wichtigste)
- **DAS EINE Kernproblem** in einem Satz.
- **Die generative Leitidee** (Vorschlag) + warum sie die Owner-Signale (rund/warm, lebendig-aber-ruhig,
  Bedeutung/Ordnung) **auflöst**.
- **Reifegrad je Dimension** (Ampel + %).
- **Priorisierter Weg:** was der Owner ENTSCHEIDEN muss · was als Nächstes VISUELL gezeigt wird
  (**2–3 komplette CI-Richtungen als Mockup — in DIESER Runde NICHT bauen, nur empfehlen**) · was später.
- **Offene Owner-Entscheidungen** als klare Liste.

## 5 · FORM DER AUSGABE
- `creadig-TIEFENANALYSE.md`: **Executive Summary (max. 1 Seite) oben**, dann die sechs Dimensionen,
  dann Synthese + Owner-Entscheidungen. Opinionated, konkret, mit `Datei:Zeile`-Belegen. Kein Wiederkäuen
  des schon Analysierten ohne Mehrwert.
- **Finaler STOPP** mit Kurz-Zusammenfassung (Kernproblem + Leitidee + Owner-Entscheidungen). **Kein Code.**

## 6 · NICHT TUN
- Kein App-Code, kein Motiv/Motion implementieren, kein Redesign. Keine erfundenen Daten/Referenzen.
- Uncommittete Vorschau-Änderungen weder committen noch zurücksetzen. Nicht nach `main`, kein Push, kein Force.
