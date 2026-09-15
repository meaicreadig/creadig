# Website-Experience · Hauptbuch

> Stand 13.09.2026 · Branch `feat/system-haus-site`
> **Preview-ready ist nicht Closure.** Closure verlangt die beabsichtigte
> Käufer-Erfahrung auf der **echten** Seite — es läuft nichts in Produktion.

## Master Run A · Creative Core & Site Architecture

| Lane | BUILD | Preview-ready | Stand |
|---|:--:|:--:|---|
| **A01** Creative Direction | 🟢 | 🟢 | These, Vokabular, Bewegungs-, Artefakt- und Rhythmus-Sprache, Mobile-Prinzip |
| **A02** Creative Primitives | 🟢 | 🟢 | `components/creative/system.tsx` — drei Bausteine, zwei Achsen |
| **A03** Systembild | 🟢 | 🟢 | auf die Primitive umgestellt, zwei Fehler behoben |
| **A04** Fünf Ebenen | 🟢 | 🟢 | Treppe → Schiene; eine durchgehende Linie, fünf Einstiege |
| **A05** Das Haus | 🟢 | 🟢 | Zeilenrahmen → Schiene; Fundament als kräftiger Knoten |
| **A06** Hero-These | 🟢 | 🟢 | Trennstrich → Thesenlinie unter der Kopfzeile |
| **A07** Homepage-Komposition | 🟢 | 🟢 | Wege eingefügt, Reihenfolge zweimal korrigiert (siehe unten) |
| **A08** Käufer-Routen | 🟢 | 🟢 | drei Wege nach Lage, ohne Größen-Etiketten, ohne Ebenen-Jargon |
| **A09** Editorialer Rhythmus | 🟢 | 🟢 | fünf Modi; **gemessen**: keine drei benachbarten Abschnitte gleich |
| **A10** Bewegungs-Grammatik | 🟢 | 🟢 | nur das Signal bewegt sich; Knoten zeigt Aktivierung |
| **A11** Mobile-Fundament | 🟢 | 🟢 | Spur senkrecht, Knoten auf ihrer Beschriftung, ein DOM |
| **A12** Wahrheits-Ton | 🟢 | 🟢 | **gemessen statt geändert** — Hierarchie stimmt bereits (siehe unten) |
| **A13** Gemeinsame Bausteine | 🟢 | 🟢 | vier Dateien, keine Mikro-Komponenten-Wüste |
| **A14** Visuelle Regression | 🟢 | 🟢 | 100 Aufnahmen vorher, 100 nachher |
| **A15** Preview-Reife | 🟢 | 🟡 | alles grün; **Push/Preview wartet auf Owner** |

---

## Final Closure Strike — Stand 15.09.2026

**MASTER RUN B: owner-unabhängig abgeschlossen.** Ehrliche Schätzung: **~92 %**.

| Lane | Stand | Beleg |
|---|---|---|
| **B14** Verdichtung | 🟢 | `/leistungen` 12.461 → **12.122 px**, 1.638 → **1.600 W**; „NICHT ENTHALTEN" **6 → 3**, „verschwinden" **4 → 2** |
| **B04** Produkte | 🟢 + `OWNER_ASSET_DEPENDENCY` | fünf Pflichtangaben je Produkt; Reife nicht eingeebnet; CASSAMEA/meahv **absichtlich** ohne Aufnahme, Grund steht groß auf der Seite |
| **B07** Unternehmen | 🟢 | unbelegte Ausfallsicherheit entfernt (siehe unten); Das Haus integriert; keine Inhaber-Vertriebsaussage |
| **B13** Navigation | 🟢 | Kopf 6 Verweise · Fuß 28, **28 eindeutig** (kein Dublettenhaufen), 2 Abschluss-CTA, keine Sackgasse |
| **B19** Parität | 🟢 | vier Sprachen auf allen Kernseiten, je genau eine `h1`; Grenzsatz auf `/arbeiten` in **allen vier** |
| **B21** Käufer-Audit | 🟢 | elf Routen gerendert geprüft, vier weitere gemessen |
| **B22** Fixback | 🟢 | Grammatik-Dichte **6/49 Sektionen = 12 %** — keine Übernutzung; RTL auf sechs arabischen Seiten ohne Überlauf |
| **B23** Preview | 🟢 | tsc · ESLint 0 · 40 Gates · a11y 132/132 · sprach-drill 27/27 · 100 Aufnahmen |

### Zwei materielle Funde dieser Runde

**1 · Die Seite versprach eine Ausfallsicherheit, die sie zwei Abschnitte
später dementiert.** Auf `/unternehmen`: *„Groß genug, dass ein Urlaub kein
Projekt anhält."* — und im selben Dokument: *„… eine Vertretungsregel für den
Fall, dass der Verantwortliche ausfällt. Alle drei ließen sich behaupten,
keine davon ist heute belegt."* Wer beides liest, glaubt keinen der beiden
Sätze. Entfernt, in vier Sprachen.

**2 · Dieselbe Zusage stand dreimal auf einer Seite.** „Wir übergeben nicht
und verschwinden" im Prozess-Schritt, 150 px darunter groß als Statement, und
gleich danach als „Betrieb statt Übergabe". Dreimal macht eine Zusage nicht
glaubwürdiger — es macht misstrauisch.

### Was bleibt — und es ist nichts Gebautes

| Rest | Art |
|---|---|
| Öffentlicher Kundenbeleg | `CUSTOMER_PERMISSION` |
| CASSAMEA/meahv-Aufnahmen | `OWNER_ASSET_DEPENDENCY` |
| Impressum · Rechnung · Preisblock | `BLOCKED_G18` |
| `pakete` = 2.334 px / 487 W von `/leistungen` | `BLOCKED_G18_LENGTH_COMPONENT` |
| Produktionsfreigabe | `PRODUCTION_AUTHORITY` |
| Live-Rückmeldung | `REAL_WORLD_FEEDBACK` |

**Kein offener owner-unabhängiger BUILD-Posten.** Run C erbt Validierung,
keine Bauarbeit.

---

## Final Completion Wave — Stand 15.09.2026

**Run B bleibt OFFEN.** Ehrliche Schätzung: **~80 %**, nicht 90.

| Lane | Stand | Messung |
|---|---|---|
| **B15** Artefakt-System | 🟢 | vorher **0 von 4** Artefakten mit Beleg-Rang, nachher **3 von 4** — jedes mit Rang *und* Grenzsatz. Das vierte (Haus-Zeichnung) beantwortet die vier Fragen bereits selbst |
| **B14** Verdichtung | 🟡 | 441 Sätze gemessen, 36 auf mehr als einer Route. Davon echte Dopplung: **eine** (doppelter Betrag auf `/leistungen`) — entfernt. Ergebnis: **−6 Wörter**. Das ist keine Verdichtung, und ich gebe es nicht als solche aus |
| **B04** Produkte | 🟡 | vier von fünf Pflichtangaben je Produkt vorhanden (Aufgabe · Reife · Beleg · Handlung); **Reife ist nicht eingeebnet** (fibero „Im Tagesbetrieb", drei „Im Aufbau"). Fehlt: das eine echte Bild — für zwei Produkte `OWNER_ASSET_DEPENDENCY`, für die anderen zwei läge es an dritter Stelle derselben Aufnahme |
| **B07** Unternehmen | 🟡 | **materieller Fund behoben** (siehe unten); Gravitas-Text selbst nicht neu gefasst |
| **B13** Navigation | 🟡 | Sprachumschalter folgt dem Markt; Fußzeile unverändert |
| **B19** Parität | 🟡 | neue Texte in vier Sprachen; bestehende nicht durchgesehen |
| **B21** Käufer-Audit | 🟡 | gemessen + einzelne Seiten qualitativ; **kein** vollständiger Durchgang über zwölf Seiten |
| **B22** Fixback | 🟢 | vier Befunde, alle behoben oder begründet |
| **B23** Preview | 🟡 | Validierung grün, 100 Aufnahmen — aber Run B ist nicht erschöpft |

### Der materielle Fund dieser Runde

Öffentlich auf `/karriere/dach-business-development`, in **vier Sprachen**, in
großer Schrift: *„creaDIG verkauft heute über den Inhaber."*

Als Begründung für eine offene Rolle nachvollziehbar — aber der Satz macht aus
einer Kapazitätsfrage einen **Vertriebskanal** und damit eine Aussage über das
Geschäftsmodell. Ein Käufer liest daraus nicht „hier fehlt eine Rolle", sondern
„diese Firma hängt am Inhaber". Entfernt; der Grund für die Rolle steht
unverändert da, nur bei Verantwortung statt bei Vertrieb.

### Was offen bleibt — owner-unabhängig

1. **B14** — echte Verdichtung der nicht gesperrten `/leistungen`-Abschnitte
2. **B04** — Entscheidung, wo die zwei echten Produktaufnahmen leben
3. **B07** — Gravitas-Durchgang auf `/unternehmen`
4. **B13** — Fußzeile als Abschlussfläche
5. **B19** — Durchsicht der bestehenden Texte in TR/EN/AR
6. **B21** — vollständiger qualitativer Käufer-Durchgang

`packages.tsx` bleibt **BLOCKED_G18**: 2.334 px und 487 Wörter von
`/leistungen`, also 22 % der Höhe und 31 % der Wörter.

---

## Completion Wave — Stand 13.09.2026

| Lane | Stand | Beleg |
|---|---|---|
| **B03** Leistungen | 🟡 | Prozess auf die Strecke gestellt (erste Schiene + Zeig-Moment). `pakete` = 2.334 px / 487 W → **BLOCKED_G18**. Ebenen-Pyramide behält Einrückung: `tile`-Karten, kein Restposten-Zwang |
| **B05** Produkt-Details | 🟡 | **Geprüft, nicht gebaut**: Die fehlende Aufnahme ist bereits benannt (`screensPending`). CASSAMEA/meahv → **OWNER_ASSET_DEPENDENCY** (Aufnahmen existieren, enthalten echte Daten) |
| **B09** Aufwandsrechner | 🟢 | Modell-Kennzeichnung vorhanden und eindeutig; keine erfundene ROI |
| **B10** Kontakt / Termin | 🟢 | 200, je eine `h1`, CTA vorhanden, kein Überlauf |
| **B11** Insights | 🟢 | Index → Artikel → kommerzieller Rückweg (`/termin`, `/produkte`) vorhanden |
| **B12** Karriere | 🟢 | **kein Sackgassen-Befund** — sechs Verweise inkl. `/karriere/bewerben`; Narrativ unberührt |
| **B16** Mobile | 🟢 | 18 Routen × 2 Fenster gemessen: **kein waagerechter Überlauf**, je genau eine `h1`, alle 200 |
| **B17** Bewegung | 🟢 | Fünf Animationsklassen; **alle 9** framer-motion-Dateien respektieren reduzierte Bewegung (zwei Treffer waren Kommentare) |
| **B18** Locale | 🟢 | 27/27 nach Änderungen erneut grün |
| **B19** Parität | 🟡 | Neue Texte in vier Sprachen; bestehende nicht neu gefasst |
| **B20** Validierung | 🟢 | tsc · ESLint · 40 Gates · a11y 132/132 · RTL 5 Seiten |
| **B04 / B07 / B13 / B14 / B15** | 🔴 | **nicht vertieft** — siehe unten |

### Drei Korrekturen an eigenen Annahmen

1. **`/karriere` sei eine Sackgasse.** War es nicht — mein Selektor suchte nur
   `termin`/`kontakt`/`button`. Sechs Verweise sind da.
2. **Die fehlende Produktaufnahme sei stumm.** Ist sie nicht — `screensPending`
   sagt es, und zwar auf beiden betroffenen Seiten.
3. **Zwei Dateien animierten ohne Rücksicht auf reduzierte Bewegung.** Das Wort
   `framer-motion` stand dort nur im Kommentar; null Bewegungsaufrufe.

### Ein Fehler, den ESLint gefunden hat

Die marktabhängige Umschalter-Reihenfolge erzeugte bei jedem Rendern ein neues
Feld und stand zugleich in einer Effekt-Abhängigkeit. `useMemo` — die
Reihenfolge hängt nur an der aktiven Sprache.

---

## Master Run B · Public Experience — Stand 13.09.2026

| Lane | BUILD | Preview | Stand |
|---|:--:|:--:|---|
| **B01** Routen-Inventar | 🟢 | 🟢 | 19 Routen an der laufenden Seite gemessen (Höhe, Wörter, Bilder, Schienen) |
| **B02** Startseite | 🟢 | 🟢 | Namenskonflikt behoben (Wege → Lagen) |
| **B03** Leistungen | 🔴 | 🔴 | **offen** — 1.644 Wörter, 0 Artefakte |
| **B04** Produkte-Übersicht | 🟡 | 🟡 | Reifegrad wird gezeigt (`StatusDot`); Dichte unverändert |
| **B05** Produkt-Details | 🔴 | 🔴 | **offen**; CASSAMEA/meahv-Aufnahmen sind **Owner-zurückgehalten** |
| **B06** Arbeiten / System-Case | 🟢 | 🟢 | Beleglage gebaut; Case-Architektur existierte bereits (8 Kapitel, G18) |
| **B07** Unternehmen | 🟡 | 🟡 | Das Haus aus Run A; Gravitas-Text unverändert |
| **B08** Betriebscheck | 🟢 | 🟢 | persönliche Systemlandkarte aus den eigenen Antworten |
| **B09** Aufwandsrechner | 🔴 | 🔴 | **offen** |
| **B10** Kontakt / Termin | 🔴 | 🔴 | **offen** |
| **B11** Insights | 🔴 | 🔴 | **offen** |
| **B12** Karriere | 🔴 | 🔴 | **offen** (inhaltlich eingefroren) |
| **B13** Navigation / Fußzeile | 🟡 | 🟡 | Sprachumschalter folgt dem Markt; Rest unverändert |
| **B14** Verdichtung | 🔴 | 🔴 | **offen** |
| **B15** Artefakt-System | 🔴 | 🔴 | **offen** |
| **B16** Mobile | 🟡 | 🟡 | neue Abschnitte geprüft; kein Durchgang über alle Routen |
| **B17** Bewegung | 🟡 | 🟡 | Grammatik gilt; kein Durchgang über alle Routen |
| **B18** Locale Intelligence | 🟢 | 🟢 | Middleware + Regelquelle + **27/27 Szenarien** |
| **B19** DE/TR/EN/AR | 🟡 | 🟡 | neue Texte in vier Sprachen; keine Neufassung bestehender |
| **B20** SEO / a11y / Performance | 🟢 | 🟢 | 40 Gates · a11y 132/132 · RTL geprüft |
| **B21** Käufer-Audit | 🟡 | 🟡 | an den geänderten Flächen, nicht site-weit |
| **B22** Adversarial Fixback | 🟢 | 🟢 | drei Befunde, zwei behoben, einer als Regel präzisiert |
| **B23** Preview-Kandidat | 🟡 | 🟡 | grün, aber Run B ist **nicht** erschöpft |

**Run B ist nicht abgeschlossen.** Acht Lanes stehen offen. Das ist keine
Owner-Abhängigkeit, sondern nicht geleistete Arbeit — mit einer Ausnahme:
CASSAMEA und meahv haben vorhandene, aber **bewusst zurückgehaltene**
Aufnahmen (Gate OA-2), und daran ändert kein Design etwas.

### Drei Befunde aus dem Gegenlesen

**1 · Ein Namenskonflikt aus Run A.** „Drei Wege hinein" stand auf derselben
Seite wie „Zwei Wege hinein — beide zum Festpreis" und „Drei Wege zu einem
Preis". Die Seite benutzte das Wort bereits fünfmal. Der Neuankömmling
weicht: drei **Lagen**.

**2 · Eine Diagnose, die falsch war.** Ich hielt die Prüfpakete für
maschinenabhängig und baute einen Sprachkeks ein. Nachgesehen: `a11y.mjs` und
`screenshots.mjs` setzen `locale: "de-DE"` längst selbst. Die Änderung war
überflüssig und hat den Lauf gebrochen — zurückgenommen.

**3 · Die Linien-Regel war zu weit gefasst.** Siehe Präzisierung in der
Creative Direction: Wo die Schiene liegt, aktiviert der Knoten; wo keine
liegt, bleibt die vorhandene Hover-Anzeige. Zehn Komponenten behalten sie.

---

## Vier Fehler, die erst die Messung gezeigt hat

Alle vier wären im Quelltext unsichtbar geblieben.

**1 · Die gebrochene Spur war nicht gebrochen.** Zuerst eine durchgehende
graue Linie mit kurzen Querstrichen an den Übergaben — im Bild las sich das
wie die Skala eines Lineals. Jetzt hört die Linie vor jeder Übergabe auf.

**2 · Auf dem Telefon lag jede Beschriftung eine Station über ihrem Punkt.**
`self-center` stellt beide auf dieselbe Achse.

**3 · Die Thesenlinie im Hero war ein Trennstrich.** Über 1.800 Pixel
verschwindet eine Haarlinie mit 30 % Deckkraft, und drei Lücken darin liest
niemand als Aussage. Jetzt steht sie direkt unter der Kopfzeile, nur so breit
wie ein Satz.

**4 · Die drei Wege standen an der falschen Stelle — zweimal.** Eingefügt
hinter den Ebenen, verletzten sie zwei Entscheidungen, die schon im Quelltext
standen: `EntryLine` gehört **direkt** hinter die Ebenen (wer gelesen hat, was
das Haus macht, fragt als Nächstes nach dem Preis), und „Drei Wege hinein"
landete unmittelbar neben „Drei Arten anzufangen" — zwei Abschnitte, die
beide drei Möglichkeiten anbieten, etwas zu beginnen. Gemessen kam dazu:
Ebenen, Wege und Einstieg waren drei benachbarte Abschnitte derselben
Grammatik. Die Wege stehen jetzt **vor** der Architektur, hinter dem Beleg.

---

## Was gemessen statt behauptet wurde

| Frage | Messung | Ergebnis |
|---|---|---|
| Sind drei benachbarte Abschnitte gleich komponiert? | gerendertes DOM, Modus je Abschnitt aus Bild/Schiene/Preis/Grund | **nein** — die Regel hält |
| Stehen Verneinungen zu weit vorn? | jeder Satz der Startseite, Position in seinem Abschnitt | **nein** — 86–100 % durch; die frühen sind entlastend („Sie brauchen nicht alle"), nicht selbstbegrenzend |
| Bundle | `next build` vorher/nachher | Startseite 320 → **323 kB**, geteiltes JS 102 → **103 kB** |
| Barrierefreiheit | axe, WCAG 2.1 AA | **132/132**, Exit 0 |
| Gate-Kette | `npm run postbuild` | **40 × OK**, Exit 0 |
| RTL | `/ar`, Systembild | Spur läuft rechts → links, **kein Sonderfall im Code** |

**A12 ist deshalb grün, ohne dass eine Zeile geändert wurde.** Die
Wahrheits-Hierarchie der Startseite ist bereits richtig: erst was wir tun,
dann der Beleg, dann die Grenze. Etwas zu „verbessern", das die Messung als
in Ordnung ausweist, wäre Beschäftigung gewesen.

---

## Was ausdrücklich nicht getan wurde

**Kein drittes Hero-Zeichen.** Zwei Motive hat der Owner am 29.08.2026
abgelehnt (Knoten-Netz, Schienen-Treppe); die Begründung steht in
`system-field.tsx`. Die Thesenlinie ist kein Zeichen hinter der Schrift — ein
vorhandener Trennstrich hat eine Bedeutung bekommen.

**Kein Kundenbeleg ersetzt.** `/arbeiten` ist unverändert leer. Das Systembild
trägt „Modell, kein Kundenergebnis" am Bild.

**Keine zweite Metapher.** Die Treppe der fünf Ebenen war gut begründet — aber
sie war ein zweites Bildvokabular. Ein Creative-System entsteht aus Wiederkehr.

---

## Nächste eigenständige Arbeit (Run B)

1. Produkt-Detailseiten: reale Oberflächen im Systemfenster statt Standbild.
2. `/leistungen` verdichten und bebildern.
3. Betriebscheck-Ergebnis als persönliche Systemlandkarte.
4. `/arbeiten` als Beweis-Architektur reframen, solange keine Freigabe vorliegt.

**Owner-abhängig:** der öffentliche Kundenbeleg. Das Creative-System ersetzt
ihn nicht.
