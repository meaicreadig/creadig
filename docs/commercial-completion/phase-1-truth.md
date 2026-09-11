# Phase 1 — Wahrheit, Risiko und Integrität der öffentlichen Aussage

**Ziel:** `ÖFFENTLICHE AUSSAGE = HEUTIGE WAHRHEIT`
**Stand:** 11.09.2026 · **Grundlage:** [Phase 0 Rest](./phase-0-rest.md)

Der Grundsatz dieses Laufs war einfach: Wo die Seite mehr behauptet als gilt,
wird die Behauptung kleiner gemacht — nie die Wahrheit größer. Es wurde keine
Zahl erfunden, kein Kunde genannt, kein Vertrag als bestehend erklärt und keine
juristische Bewertung vorgenommen.

## Was gefixt wurde

### T-01 · `/datenschutz` behauptete und dementierte gleichzeitig

Der schwerste Befund des Laufs, und er stand nicht im Reaudit.

Die Seite sagte im Fließtext dreimal, dass ein Auftragsverarbeitungsvertrag
**besteht** — „Mit Vercel besteht ein Vertrag über die Auftragsverarbeitung nach
Art. 28 DSGVO", „Abgesichert ist sie über den Auftragsverarbeitungsvertrag mit
Vercel Inc.", „Resend … als Auftragsverarbeiter nach Art. 28 DSGVO". Neunhundert
Pixel darunter stand an allen drei Einträgen „Bestätigung durch den Inhaber
offen" und darunter der Satz: *„Wir schreiben deshalb nicht, dass sie bestehen."*

Die Seite schrieb es. Dreimal, im selben Dokument.

Derselbe Überanspruch lag im **Cookie-Banner** („die EU-Standardvertragsklauseln,
die wir mit Vercel geschlossen haben") — an genau der Stelle, an der jemand auf
„Alle akzeptieren" drückt — und im **Einwilligungstext der Formulare**.

**Behoben in `lib/dictionary.ts`, in allen vier Sprachen:** Der Fließtext nennt
jetzt die *vorgesehene* Grundlage und verweist auf den Stand in der Liste. Der
Banner und der Einwilligungstext ebenso. Die Marker selbst bleiben stehen — sie
waren nie das Problem, sie waren die einzige ehrliche Stelle.

> **Nicht getan:** kein Wort dazu, ob die Verträge bestehen. Technische Nutzung
> eines Dienstes beweist keinen Vertrag. Das bleibt `OWNER_FACT`.

### T-02 · 149 €/Monat las sich als Betrieb des ganzen Geschäfts

Die Einstiegskachel sagte „Monatlich 149 € — Der laufende Betrieb — für Systeme,
die wir gebaut haben · Gilt für: **Operations**". Wer eine eigene
Betriebssoftware betreiben lassen will, liest daraus einen Preis. Der
Leistungsumfang dahinter ist website-spezifisch (Hosting, Sicherheitsupdates,
zwei Inhaltsänderungen im Monat, Google-Unternehmensprofil).

Jetzt: „Die laufende Betreuung der Seite, die wir gebaut haben — in festem
Umfang" und „Nur für Seiten, die wir gebaut haben — größerer Umfang nach
Analyse". Keine Preisänderung; 149 € steht unverändert.

### T-03 · `/produkte` beanspruchte Betrieb für alle vier

H1: „Vier Produkte, die wir selbst betreiben." Darunter vier Karten, von denen
**drei** „Im Aufbau" tragen. Die Karten waren ehrlich, die Überschrift nicht —
und gelesen wird die Überschrift.

Jetzt: „Vier Produkte, die wir selbst gebaut haben." Der Vorspann nennt das
Verhältnis beim Namen: eines im Tagesbetrieb, drei im Aufbau, Stand an jedem
Produkt. Ebenso die Verteilerkachel auf der Startseite und der Menütext.

### T-04 · `/arbeiten` sagte „hier steht niemand" und lieferte eine Liste mit vier

Der sichtbare Text war korrekt. Im selben Dokument lag eine `ItemList` namens
„Arbeiten — eigene Produkte **und Kundenwerk**" mit fibero, meAI, CASSAMEA und
meahv samt URLs. Die Metadaten daneben hielten sich längst an die Freigabelage
(`ohneKundenwerk`), die strukturierten Daten nicht.

`app/_routes/arbeiten.tsx` gibt die `ItemList` jetzt nur aus, wenn es etwas
aufzulisten gibt.

### T-05 · „Alle Zeiten in MEZ" — im September

Eine feste Abkürzung ist ein halbes Jahr lang falsch. Alle vier Sprachen nennen
jetzt die Zone statt der Jahreszeit: „deutsche Ortszeit (Europe/Berlin)".

### T-06 · Der Hero hielt sich selbst verborgen

Gemeldet war „Hero kurz leer". Gemessen im ausgelieferten HTML war es mehr:
`opacity:0` an vier Blöcken **und** `transform:translateY(112%)` an jeder der
drei H1-Zeilen. Ohne JavaScript hatte die Startseite **keine sichtbare
Überschrift**.

Gate 04 hatte diese Entscheidung für `Reveal` bereits getroffen — Inhalt wird nie
verborgen, Bewegung bewegt nur die Position. Der Hero war die letzte Stelle, die
es anders machte, ausgerechnet die erste, die jemand sieht. Die `opacity` ist weg;
die Zeilenmaske bleibt, weil sie die Bewegung *ist*, und ein `<noscript>`-Block
nimmt ihren Startwert zurück, wenn keine Animation beginnt.

### T-07 · Das Website-Paket versprach ein Ergebnis

„In vier Wochen online — **mit Anfragen und Bewerbungen**" sagt zu, was Besucher
tun. Zusagbar ist nur, was gebaut wird. Jetzt: „mit **Wegen für** Anfragen und
Bewerbungen", in allen vier Sprachen.

### T-08 · Die Barrierefreiheits-Erklärung stimmte in ihren eigenen Zahlen nicht

Sie nannte „68 Durchläufe (17 Seiten)" und „in beiden Sprachfassungen". Der Lauf
deckte zu dem Zeitpunkt **124 Durchläufe über 31 Routen** ab — und die Seite hat
**vier** Sprachfassungen, von denen **Englisch und Arabisch nicht im Lauf stehen**.
Für ein Dokument, das Barrierefreiheit erklärt, zählt das doppelt.

Jetzt: der Lauf vom 11.09.2026 mit seinen echten Zahlen, die geprüften Routen
benannt, die Handprüfung ausdrücklich dem Prüflauf vom 23.08.2026 zugeordnet —
und unter den bekannten Einschränkungen steht neu, dass Englisch, Arabisch und
die arabische Schreibrichtung nicht geprüft sind.

### T-09 · Nebenbefunde aus dem Anspruchsabgleich

| Stelle | Vorher | Jetzt |
|---|---|---|
| Meta-Beschreibung (4 Sprachen) | „Eigene Produkte, **echte Kunden**, KI-Systeme" | ohne den unbelegten Kundenanspruch |
| `/systeme` | „**Deutsch und Türkisch** haben eigene URLs" | „Jede Sprachfassung hat eigene URLs" |
| Beweis-Hinweis (4 Sprachen) | „Eigene Produkte haben wir gebaut **und betreiben sie selbst**" | „…selbst gebaut — mit dem Stand, den sie heute haben" |
| Impressum-Marker (4 Sprachen) | „Platzhalter — wird **vor dem Livegang** ersetzt" | „Platzhalter — noch nicht freigegeben" |
| Insight vom 23.08.2026 | „Der automatisierte Lauf **meldet** über 68 Durchläufe…" | „…**meldete an diesem Tag**…" — ein Tagebuch wird datiert, nicht korrigiert |

## Das Gate, das es festhält

`scripts/check-commercial-truth.mjs`, im `postbuild` verdrahtet (Gate 35 von 35).
Es liest das **gebaute HTML**, nicht die Quelle — weil das, was im Quelltext
sauber auf vier Wörterbücher verteilt liegt, im Browser untereinander auf einer
Seite steht und dort zusammenpassen muss. Sieben Regeln:

1. Kein behaupteter Auftragsverarbeitungsvertrag, solange ein Marker offen steht
2. Kein interner Arbeitsstand im ausgelieferten Text (Livegang, TODO, Befund-IDs)
3. Keine feste Zeitzonen-Abkürzung
4. Kein globaler Betriebsanspruch über Produkte im Aufbau
5. Keine `ItemList` auf einer Seite, die nichts auflistet
6. Der genannte Barrierefreiheits-Umfang muss dem echten Lauf entsprechen
7. Keine Kundennamen ohne dokumentierte Freigabe

## Nachweis

| Prüfung | Ergebnis |
|---|---|
| `tsc --noEmit` | 0 |
| `eslint .` | 0 |
| `npm run build` + 35 Gates | Exit 0 · 35 × OK · 0 × FEHL |
| `npm run a11y` | 124/124 · keine maschinell feststellbare WCAG-2.1-AA-Verletzung |
| Crawl über alle Routen | 127 Routen, alle 200, kein toter Link |
| Anspruchsabgleich (9 Muster × 4 Sprachen) | keine Behauptung ohne Deckung |
| G18-Sperre | sechs Dateien byte-identisch (SHA-256 geprüft), ungestaged |
| Black-Lock | unberührt |
| Produktionsaktionen | keine |

## Was offen bleibt — und warum es nicht im Code lösbar ist

| # | Offen | Klasse | Warum |
|---|---|---|---|
| 1 | Die drei Auftragsverarbeitungsverträge (Vercel, Resend, Neon) sind nicht bestätigt | `OWNER_FACT` | Nur der Inhaber kann sie im Dashboard abschließen und ablegen. Technische Nutzung beweist nichts. Die Seite behauptet jetzt nichts mehr — sie kennzeichnet. |
| 2 | `/datenschutz` trägt genau **eine** Überschrift; alle Abschnittstitel sind Absätze | **`G18_BLOCKED`** | Der Fix liegt in `components/legal/legal-page.tsx`. Byte-identisch zu halten war Auflage. **Das ist ein echter Barrierefreiheits-Mangel auf der längsten Rechtsseite der Website** und gehört als Erstes entsperrt. |
| 3 | Null freigegebene Kundenfälle | `OWNER_FACT` | Braucht eine schriftliche Freigabe, keine Codezeile. `/arbeiten` sagt es ausdrücklich. |
| 4 | CASSAMEA und meahv ohne zeigbare Ansichten | `OWNER_FACT` | Die vorhandenen Aufnahmen verletzen den eigenen Demodaten-Standard. Nur der Inhaber kann das auflösen. |
| 5 | Alte Kundennamen möglicherweise im Suchindex | `EXTERNAL_SEARCH_CACHE` | In keiner ausgelieferten Seite und keiner Quelldatei. Ein Entfernungsantrag bei der Search Console war ausdrücklich untersagt. |
| 6 | Kein Wirkungsnachweis in Zahlen (ROI) | `OWNER_FACT` | Die Seite verspricht ausdrücklich keine Zahlen. Eine Messung braucht einen gelaufenen Fall. |
| 7 | Kapazitätsgrenze und Vertretungsregel | `OWNER_FACT` | `/unternehmen` benennt die Lücke wörtlich. |
| 8 | Einwilligungstext der Formulare ist lang (68 Wörter) | `LEGAL_FACT` | Er nennt Verarbeiter, Drittlandübermittlung, Rechtsgrundlage und Widerruf. Kürzen wäre eine juristische Entscheidung, keine redaktionelle. |

**Ein bewusst stehen gelassener Rest:** Je Verarbeiter steht weiterhin
„Grundlage: Auftragsverarbeitung nach Art. 28 DSGVO + EU-Standardvertragsklauseln".
Der Satz *benennt* die Grundlage, er behauptet sie nicht — und der Marker
„Bestätigung durch den Inhaber offen" steht sechs Zeilen darüber am selben
Eintrag. Die Zeile bedingt umzuformulieren ginge nur in der G18-gesperrten
`legal-page.tsx`; die Beschriftung pauschal auf „Vorgesehene Grundlage" zu
ändern würde falsch, sobald der erste Vertrag bestätigt ist. Deshalb: benannt
statt behauptet, Stand am Eintrag.

## Phase 2

Nicht begonnen.
