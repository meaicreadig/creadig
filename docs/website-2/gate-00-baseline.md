# Gate 00 · Bestandsaufnahme

Gemessen am 10.09.2026 gegen HEAD `4eb05c3`.

## 1 · Die drei Wahrheitsstände

| | Stand | Beleg |
|---|---|---|
| **Produktion** `creadig.de` | erreichbar, 200, ~0,47 s, 96,8 KB | Vercel, HSTS aktiv |
| **Branch** `feat/system-haus-site` | HEAD = origin = `4eb05c3` | nichts gestaged |
| **Preview** | nicht separat geprüft | Produktion und Branch decken sich |

**Drift: keine relevante.** Prüfung an der Karriereseite, die zuletzt geändert
wurde: Produktion liefert bereits „Produkt & Systeme", „Dein Platz" und alle
vier Kapitel; „Istanbul" und „Founding Talent" kommen dort **nicht** vor.

Das hat eine wichtige Folge für die Matrix: Der unabhängige Audit hat den
**aktuellen** Stand gesehen. Seine Höhenangaben decken sich mit meinen
Messungen auf 30 Pixel genau (`/leistungen` 15.666 vs. „rund 15.700",
`/karriere` 9.826 vs. „rund 9.800", `/` 13.449 vs. „rund 13.400"). Deshalb ist
fast jeder Befund `CONFIRMED_CURRENT` — nichts davon ist bereits stillschweigend
behoben.

## 2 · Routen

| | Anzahl |
|---|---:|
| `page.tsx` DE | 25 |
| `page.tsx` TR / EN / AR | je 24 |
| gebaute HTML-Seiten | 121 |
| Sitemap-Einträge | 108 (27 Routen × 4 Sprachen) |

**Differenz DE 25 zu TR/EN/AR 24:** `/status` existiert nur im deutschen Baum
— bewusst, der Materialstand ist eine Innenansicht.

**Dynamische Quellen:** 6 Leistungsseiten, 4 Produkte, 1 Insight, 2 Werke
(`nv-swiss`, `maqam` — im Datenbestand, **nicht** öffentlich verlinkt).

Nicht in der Sitemap und richtig so: `/karriere/bewerben` (`noIndex`),
`/status`, Fehlerrouten.

## 3 · Gemessene Seiten

24 Routen × 3 Fenster (1440 / 768 / 390). **Kein waagerechter Überlauf** auf
keiner Route in keinem Fenster.

| Route | Desktop | Mobil | Faktor | Abschn. | H2 | Eyebrow | Bilder | Wörter |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | 9.367 | 13.449 | 1,4 | 10 | 9 | **31** | 6 | 642 |
| `/leistungen` | 9.854 | **15.666** | 1,6 | 7 | 5 | **61** | **0** | 1.127 |
| `/leistungen/webdesign` | 3.264 | 5.497 | 1,7 | 0 | 8 | 11 | **0** | 308 |
| `/leistungen/website-handwerk` | 3.270 | 5.656 | 1,7 | 0 | 8 | 11 | **0** | 331 |
| `/leistungen/ki-automatisierung` | 3.698 | 6.355 | 1,7 | 0 | 8 | 12 | **0** | 345 |
| `/leistungen/barrierefreiheit-website` | 5.859 | **10.890** | **1,9** | 1 | 14 | 24 | **0** | 1.026 |
| `/produkte` | 3.193 | 5.181 | 1,6 | 3 | 5 | 10 | 4 | 198 |
| `/produkte/fibero` | 4.809 | 7.028 | 1,5 | 8 | 5 | 19 | **0** | 315 |
| `/produkte/meai` | 5.733 | 8.864 | 1,5 | 9 | 6 | 21 | **0** | 428 |
| `/arbeiten` | 3.796 | 5.477 | 1,4 | 3 | **1** | **25** | 4 | **191** |
| `/unternehmen` | 8.227 | 12.137 | 1,5 | 8 | 7 | **36** | 9 | 858 |
| `/systeme` | 5.521 | 9.754 | **1,8** | 6 | 5 | 12 | **0** | 848 |
| `/betrieb` | 5.134 | 8.423 | 1,6 | 7 | 6 | 14 | **0** | 578 |
| `/branchen/handwerk` | 5.003 | 6.999 | 1,4 | 5 | 4 | 23 | **0** | 419 |
| `/insights` | 2.413 | 3.931 | 1,6 | 3 | 2 | 4 | **0** | 138 |
| `/insights/eigene-seite-geprueft` | 5.760 | 9.361 | 1,6 | 4 | 9 | 7 | **0** | 1.079 |
| `/betriebscheck` | 3.588 | 6.057 | 1,7 | 2 | 1 | 7 | **0** | 330 |
| `/termin` | 2.026 | 3.251 | 1,6 | 1 | 1 | 4 | **0** | 85 |
| `/kontakt` | 3.083 | 5.500 | **1,8** | 3 | 2 | 6 | **0** | 241 |
| `/karriere` | 6.150 | 9.826 | 1,6 | 5 | 4 | 10 | **0** | 699 |
| `/karriere/dach-business-development` | 5.224 | 7.129 | 1,4 | 6 | 5 | 7 | **0** | 384 |
| `/karriere/founding-talent` | 4.138 | 5.916 | 1,4 | 6 | 5 | 9 | **0** | 254 |
| `/karriere/bewerben` | 1.999 | 3.194 | 1,6 | 2 | 1 | 1 | **0** | 76 |
| `/diese-adresse-gibt-es-nicht` | 2.116 | 3.165 | 1,5 | 0 | 2 | 3 | **0** | 75 |

### Was die Zahlen sagen

**Bilder.** 18 von 24 Routen tragen **null** Bilder im Inhalt. Bildmaterial gibt
es nur auf `/`, `/produkte`, `/arbeiten` und `/unternehmen`. Sämtliche
Leistungs- **und** Produktdetailseiten sind reiner Text — dieselben Seiten, auf
denen ein Käufer den Beweis erwartet.

**Eyebrows.** `/leistungen` trägt 61 Label auf einer Seite, `/unternehmen` 36,
`/` 31. Das Label ist kein Akzent mehr, sondern der Grundtakt: Wenn jeder
Abschnitt eines trägt, hebt keines mehr etwas hervor.

**`/arbeiten`.** 25 Eyebrows, 1 H2, 191 Wörter — das schlechteste Verhältnis
von Label zu Inhalt der ganzen Website, auf der Seite, die laut Audit am
wahrscheinlichsten geklickt wird.

**Mobile Serialisierung.** Faktor 1,4 bis 1,9. Die schlechtesten
(`barrierefreiheit-website` 1,9 · `systeme` 1,8 · `kontakt` 1,8) sind
Textseiten ohne eigene mobile Komposition — der Desktop-Aufbau wird gestapelt.

### Nachgemessen (in der Selbstkritik ergänzt)

Die erste Messreihe deckte 24 Routen. Sieben fehlten und wurden nachgeholt:

| Route | Desktop | H2 | Eyebrow | Bilder | Wörter |
|---|---:|---:|---:|---:|---:|
| `/leistungen/corporate-design` | 3.238 | 8 | 11 | 0 | 315 |
| `/leistungen/zweisprachig-de-tr` | 3.214 | 8 | 11 | 0 | 307 |
| `/produkte/cassamea` | **4.809** | 5 | 18 | 0 | 307 |
| `/produkte/meahv` | **4.809** | 5 | 19 | 0 | 314 |
| `/impressum` | 2.587 | 0 | 8 | 0 | 136 |
| `/datenschutz` | 5.432 | **0** | 18 | 0 | 906 |
| `/barrierefreiheit` | 5.632 | 7 | 2 | 0 | 596 |

`fibero`, `cassamea` und `meahv` messen **exakt 4.809 px** — dieselbe Schablone
mit getauschtem Text (WEB-0041). `/datenschutz` trägt 906 Wörter ohne eine
einzige H2 (WEB-0042).

## 3b · Arabisch

Ebenfalls in der Selbstkritik nachgeholt — die erste Messreihe war rein deutsch.

| Route (390 px) | Höhe | lang/dir | H2 | Eyebrow | Überlauf |
|---|---:|---|---:|---:|---|
| `/ar` | 13.514 | ar/rtl | 9 | 31 | nein |
| `/ar/leistungen` | **14.898** | ar/rtl | 5 | **61** | nein |
| `/ar/produkte` | 5.296 | ar/rtl | 5 | 10 | nein |
| `/ar/karriere` | 9.293 | ar/rtl | 4 | 10 | nein |
| `/ar/termin` | 3.253 | ar/rtl | 1 | 4 | nein |
| `/ar` 404 | 3.195 | ar/rtl | 2 | 3 | nein |

`lang` und `dir` stehen überall richtig, kein waagerechter Überlauf. **Aber:**
Arabisch erbt jede Länge und jede Wiederholung (WEB-0043). Eine Verdichtung in
G03/G04 wirkt automatisch in allen vier Sprachen — eine Verschlimmerung ebenso.

## 4 · Hauptfrage je Seite

| Seite | Die eine Frage | Beantwortet? |
|---|---|---|
| `/` | Was ist creaDIG, warum weiterlesen? | Teilweise — starkes Bild, Kaufgegenstand spät |
| `/leistungen` | Was kann ich kaufen, wo steige ich ein? | Teilweise — vollständig, aber überladen |
| `/produkte` | Kann creaDIG Systeme bauen? | Teilweise — vier Produkte, wenig Ergebnis |
| `/arbeiten` | Was hat creaDIG nachweisbar geliefert? | **Nein** — zeigt dieselben Produkte |
| `/unternehmen` | Wem vertraue ich mein Projekt an? | Teilweise — ehrlich, ohne Personen |
| `/systeme` | Kann creaDIG integrieren und betreiben? | Inhaltlich ja, Nachweis generisch |
| `/betrieb` | Was heißt laufender Betrieb konkret? | Ja, mit einem Widerspruch (WEB-0006) |
| `/betriebscheck` | Wo klemmt mein Betrieb? | Klar, diagnostisch flach |
| `/insights` | Denkt creaDIG gründlich? | Ja, auf einem Thema |
| `/termin` | Wie komme ich ins Gespräch? | Ja, mit Reibung |
| `/karriere` | Finde ich hier einen Platz? | Ja — seit der Neuordnung vier Kapitel |
| `/kontakt` | Wie erreiche ich creaDIG? | Ja |

## 5 · Funnel und CTA

| Funnel | Einstieg | Beleg unterwegs | Nächster Schritt | Bruchstelle |
|---|---|---|---|---|
| Website-Kunde | `/` → `/leistungen` → Detail | Preis, Pakete | Termin | Beleg fehlt (WEB-0001) |
| Systemprojekt | `/` → `/systeme` | Erklärtexte | Systemgespräch | Keine Größenordnung (WEB-0004) |
| Handwerk | `/branchen/handwerk` → `/betriebscheck` | Selbstdiagnose | Gespräch | Ergebnis flach (WEB-0021) |
| Produktinteresse | `/produkte/*` | 0 Bilder | Interesse-Formular | Beleg fehlt (WEB-0002) |
| Insights | `/` → `/insights` | Artikel | keiner direkt | Teaser verlinkt Übersicht (WEB-0019) |
| Karriere | `/karriere` → Weg → Vorstellen | Status | E-Mail-Übergabe | Keine Annahme (bekannt, kein Befund) |

**CTA-Bestand.** Der wahrscheinlichste Klick ist laut Audit „Unsere Arbeit" —
und führt auf die schwächste Seite. WhatsApp steht zusätzlich in Kopfleiste,
Fußzeile und als schwebende Schaltfläche.

## 6 · Produkt-/Arbeiten-Überschneidung (Beweis für WEB-0005)

| | `/produkte` | `/arbeiten` |
|---|---|---|
| fibero · meAI · CASSAMEA · meahv | alle vier | **alle vier** |
| Ziel-Links | `/produkte/{fibero,meai,cassamea,meahv}` | **identisch dieselben vier** |
| eigene Ziele | — | **keine** |

Zwei Hauptnavigationspunkte, ein Zielbestand. `nv-swiss` und `maqam` liegen im
Datenbestand, sind aber öffentlich nicht verlinkt.

## 7 · Technische Basis

| | Stand |
|---|---|
| TypeScript | sauber |
| ESLint | 0 Fehler, 0 Warnungen |
| Build | Exit 0 |
| Postbuild-Gates | **30** |
| Probeläufe | 30 Skripte |
| Barrierefreiheit | `a11y.mjs` **124/124**, Exit 0 (31 Routen × 2 Fenster × 2 Erscheinungsbilder) |
| Sprach-Parität | `check-parity` OK |
| Waagerechter Überlauf | keiner, 24 Routen × 3 Fenster |

**Grenze der a11y-Zahl:** Die Suite prüft **keine arabische Route**. 124/124 ist
kein Beweis für arabische Barrierefreiheit — und maschinelle Prüfung findet
nach Angabe ihrer Entwickler etwa ein Drittel der Barrieren.

## 8 · Bewegung

`Reveal` wurde lokal **und gegen Produktion** gemessen: Above-the-fold-Abschnitte
sind ab 100 ms voll deckend (2/2, unverändert bis 2.000 ms). Der Audit-Befund
„blass/leer nach Navigation" ist mit dieser Methode **nicht reproduzierbar**
(WEB-0026). Möglich bleibt ein Effekt bei langsamer Verbindung oder beim
Client-seitigen Routenwechsel — das ist in G08 mit anderer Methode zu prüfen.
