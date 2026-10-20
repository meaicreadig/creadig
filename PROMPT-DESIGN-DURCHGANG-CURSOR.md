# creaDIG — Design-/Rhythmus-Durchgang (EIN Auftrag für Cursor)

## Kontext — zuerst lesen
- Live = Commit `5f3523b` (creadig.de). Die Durchgänge **W1–W8 sind fertig und live**:
  eine Preisquelle (`lib/offers.ts`), `149 €` gehört zur Website-Betreuung (raus aus „Operations"),
  TR-Korrekturen, Admin entdichtet (Anfragen einmal, „Einrichtung", keine Migration-Nummern),
  Veröffentlichungs-Flow. **Nichts davon erneut bauen.**
- Dies ist **ausschließlich ein Design-/Rhythmus-Durchgang**. Kein Inhalt dazu, keine Logik,
  kein Higgsfield, kein neues Motiv-Zeichen (das Zeichen ist AUS).
- Das Design-System ist **zentral** in `app/globals.css` (Tokens, `type-*`, `section-*`).
  Änderungen **immer zentral am Token/Utility**, nie 30× im Markup verstreut.
- Gesperrt/geltend: **rund**; **eine Bewegung pro Sektion**; warme Palette; **Ehrlichkeit**
  (keine erfundenen Belege, „keine Mockups" nur wo es stimmt).

## Ziel
Die Seite ist ehrlich und inhaltlich fertig, wirkt aber **dicht und ohne Sog**. Dieser Durchgang
macht sie **ruhiger, luftiger, markentypischer — durch WENIGER und durch RHYTHMUS**, nicht durch
mehr Inhalt. Zielgefühl: erster Bildschirm mit viel Ruhe, **EINER Aussage**, **EINEM lebendigen
Liniensystem**.

## Ablauf (Pflicht — so und nicht anders)
1. Zuerst **Plan + betroffene Dateien + Vorher/Nachher-Skizze** zeigen, dann **STOPP** und auf mein
   ausdrückliches **„OK"** warten. Noch nichts umsetzen.
2. Nach „OK" umsetzen.
3. **Screenshots**: Startseite hell **und** dunkel, Desktop **und** Mobil, plus ein Bild mit
   `prefers-reduced-motion`. Hero **und** Betriebsfluss zusammen zeigen (Wiederholung prüfen).
4. **Lighthouse** vorher/nachher (v. a. Performance und LCP).
5. **Preview-Link**. **Nicht veröffentlichen** — das Deployen mache ich selbst.

---

## Die Änderungen — genau diese sechs, zentral

### 1) Markenschrift dorthin, wo sie am lautesten ist  · `app/globals.css`
Aktuell: `--font-display: var(--font-poppins)`, `--font-sans: var(--font-mplus)`.
Die **Überschriften** — das identitätsstärkste Element der Seite — sind damit **nicht** die runde
Markenschrift. Das widerspricht der runden Formentscheidung.
- `--font-display` auf **M PLUS Rounded 1c** umstellen; Poppins entfällt oder bleibt nur Fallback.
- In der `type-*`-Skala und in `text-display`/`text-subhead` die Gewichte prüfen: die großen
  Bauwerke (`type-display`, `type-h1`, `type-h2`) tragen **M PLUS Rounded 1c in 800** (fett).
- **Das ist die größte Änderung am Gesicht der Marke — Vorher/Nachher unbedingt zeigen.**

### 2) Hero-Typo kleiner = Luft  · `app/globals.css` (`type-display`)
Aktuell `clamp(3rem, 11vw, 7rem)` → 112px, füllt den halben Laptop.
- Auf **≈ `clamp(2.4rem, 6vw, 4.25rem)`** senken (genauen Wert am Bild feinjustieren).
- Muss klar über `type-h2` (max 3.25rem) bleiben, damit die Hierarchie stimmt.

### 3) Hero entdichten  · `components/sections/hero.tsx`
Erster Bildschirm trägt aktuell zu viel. Er soll **nur** noch tragen:
- Eyebrow, Headline (max. 2–3 kurze Zeilen), **ein** Untertitel (ein Satz),
  **ein** Hauptknopf + **ein** leiser Nebenknopf, dazu das Liniensystem (Punkt 4).
- **„Fünf Ebenen. Ein System." + die 5 Ebenen-Chips raus aus dem Hero** — sie stehen ohnehin direkt
  darunter in „Das Haus" (`HouseArchitecture`, Sektion 3). **Nicht doppeln.**
- **`ThesisLine` im Hero entfällt** zugunsten des Liniensystems (nicht zwei Linien-Motive im selben
  Bild).
- Kein Text wird erfunden; nur umgeordnet/entfernt. Vorhandene `t.hero.*`-Dictionary-Schlüssel
  weiterverwenden.

### 4) Das eine lebendige Bild im Hero  · neue Komponente `components/hero/system-line.tsx`
Ersetzt bzw. ergänzt das heute leere `SystemField` (nur Verläufe). Ein ruhiges, **abstraktes**
Liniensystem: links mehrere lose, unterbrochene Fäden (**getrennt**), zur Mitte ein Knoten, rechts
**eine durchgezogene Gold-Linie** (**verbunden**). Genau **eine Bewegung**: ein weicher Lichtpunkt
läuft langsam über die durchgezogene Linie. Farben aus Tokens, nicht hart. Bei
`prefers-reduced-motion` steht alles still, die Linie bleibt sichtbar. Kein Text, kein Symbol, keine
Muster-Fläche.

**Wiederholung vermeiden:** Sektion 2 (`Betriebsfluss`) trägt bereits eine getrennt→verbunden-Spur
mit sechs Werkzeugen. Der Hero bleibt deshalb **abstrakt** (nur Linie, kein Werkzeug, keine
Beschriftung), `Betriebsfluss` bleibt **konkret**. Beide im Preview nebeneinander zeigen; wenn sie
sich doch wiederholen, Hero-Linie leiser/anders lösen.

Grundgerüst (Pfad-Geometrie als Ausgangspunkt; Bewegung nach Repo-Konvention lösen — z. B. CSS
`offset-path`/`clip-path` wie bei Betriebsfluss, oder ein kleiner Lichtpunkt entlang `#flow`):

```html
<svg viewBox="0 0 460 360" fill="none" aria-hidden="true">
  <!-- getrennt: lose, unterbrochene Fäden (Linie/Muted) -->
  <path d="M28 70  C150 70 210 120 300 172" stroke="var(--line-strong)" stroke-width="2"
        stroke-dasharray="15 13" stroke-linecap="round" opacity="0.55" fill="none"/>
  <path d="M28 128 C160 128 220 150 300 178" stroke="var(--line-strong)" stroke-width="2"
        stroke-dasharray="15 13" stroke-linecap="round" opacity="0.55" fill="none"/>
  <path d="M28 234 C165 234 222 205 300 182" stroke="var(--line-strong)" stroke-width="2"
        stroke-dasharray="15 13" stroke-linecap="round" opacity="0.55" fill="none"/>
  <path d="M28 292 C150 292 210 236 300 188" stroke="var(--line-strong)" stroke-width="2"
        stroke-dasharray="15 13" stroke-linecap="round" opacity="0.55" fill="none"/>
  <!-- verbunden: eine durchgezogene Gold-Linie -->
  <path id="flow" d="M28 180 C150 180 185 158 250 158 C315 158 330 180 432 180"
        stroke="var(--gold)" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  <circle cx="300" cy="180" r="12" stroke="var(--gold)" stroke-width="1.2" opacity="0.4" fill="none"/>
  <circle cx="300" cy="180" r="4.5" fill="var(--gold)"/>
  <!-- Lichtpunkt läuft über #flow (die eine Bewegung; bei reduced-motion aus) -->
</svg>
```

### 5) Mehr Ruhe zwischen den Kapiteln  · `app/globals.css` (`section-shell*`)
Vertikale Abstände eine Stufe großzügiger, damit die Fuge/`section-seam` wirkt — z. B.
`section-shell` 6→7rem / (md) 8→10rem. Am Bild justieren, nicht übertreiben.

### 6) Eine Aussage pro Sektion  · die 8 Startseiten-Sektionen
Jede Sektion beginnt mit **einer** klaren Zeile. Wo zwei konkurrierende Ordnungen/Untertitel
nebeneinander stehen, die schwächere streichen. **Keine neuen Inhalte, nur kürzen/ordnen.**

---

## Grenzen (nicht überschreiten)
- Keine neue Farbe, kein neues Motiv-Zeichen, kein Higgsfield, keine zusätzliche Animation über die
  eine pro Sektion hinaus.
- Ehrlichkeit bleibt: keine erfundenen Belege; „echte Oberfläche / keine Mockups" nur wo es stimmt.
- **Nicht anfassen:** `lib/offers.ts` und Preise, Angebotstexte, Admin, Veröffentlichungs-Flow,
  Impressum/Recht, Rechnungen, i18n-Preiszeilen.

## Abschluss
Kurze Liste: was geändert wurde (Datei + Token) — plus die Vorher/Nachher-Bilder, Lighthouse und der
Preview-Link. Veröffentlicht wird nicht.
