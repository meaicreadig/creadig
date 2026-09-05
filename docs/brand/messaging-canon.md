# creaDIG · Messaging-Canon

> **Was das ist.** Die gesperrte Sprache der Marke — DE und TR. Wer einen
> Satz auf der Seite, in einem Angebot, in einer Anzeige oder in einer Mail
> schreibt, schreibt ihn nach diesen Regeln oder gar nicht.
>
> **Was das nicht ist.** Kein Textvorrat zum Zusammenklicken. Jeder Satz hier
> steht entweder schon im Code (mit Fundstelle) oder ist als **[VORSCHLAG]**
> markiert und wartet auf den Owner.
>
> Stand: MP-A, 29.08.2026 · Quelle der Wahrheit im Code: `lib/dictionary.ts`

---

## 1 · Positionierung (gesperrt)

**creaDIG ist ein System-Haus für digitale Betriebe.**

Nie: Digitalagentur. Nie: Webagentur. Nie: Kreativagentur. Nie: Studio.

Der Unterschied ist kein Wort, sondern ein Versprechen: Eine Agentur liefert
ein Ergebnis und geht. Ein System-Haus baut etwas, das danach läuft — und
bleibt dafür zuständig.

**Leitzeile:** Wir bauen das System hinter Ihrem Betrieb.

Diese Zeile steht auf der Seite bereits ausgeschrieben, als Abschluss-Satz:

| | |
|---|---|
| DE | „Sie führen den Betrieb. Wir bauen das System dahinter." |
| TR | „İşletmenizi siz yönetirsiniz. Arkasındaki sistemi biz kurarız." |

→ `lib/dictionary.ts` · `closing.title` (DE und TR)

**Befund MP-A:** Die TR-Fassung stand im Code als „İşletme**yi** siz
yönetirsiniz" — ohne Possessiv. Der Canon des Owners sagt „İşletme**nizi**".
Ein Wort, aber es ist der Unterschied zwischen *dem* Betrieb und *Ihrem*
Betrieb. Im Code korrigiert.

---

## 2 · Die DNA — sechs Sätze, die nicht verhandelt werden

Diese sechs tragen die Marke. Sie stehen so oder sinngemäß auf der Seite;
neue Texte werden gegen sie geprüft, nicht neben sie gestellt.

| # | DNA | Wo es heute steht |
|---|---|---|
| 1 | **Wir bauen, was andere nicht sehen.** | Hero-Headline, `hero.headlineLine1–3` |
| 2 | **Erst zeigen. Dann reden.** | Sektions-Überschrift Startseite |
| 3 | **Fünf Ebenen. Ein System.** | `hero.systemLine` · TR: „Beş katman. Tek sistem." |
| 4 | **Kein Konzept. Ein laufender Betrieb.** | `impact.title` |
| 5 | **Eigene Produkte** — meAI, fibero, CASSAMEA, meahv | `productWorks` in `lib/site-data.ts` |
| 6 | **Deutsch und Türkisch, gleiche Qualität** | `SameShape`-Gate in `lib/dictionary.ts` |

---

## 3 · Die Struktur jedes längeren Textes

**Problem → System → Betrieb → Ergebnis**

Nie: Leistung → Feature → Technologie → Preis.

Die Reihenfolge ist keine Stilfrage. Sie entscheidet, ob jemand sich
wiedererkennt, bevor er etwas kaufen soll. Auf der Leistungsseite liegt sie
bereits als Datenfeld vor:

```
copy.problem   „Ausgangslage"           → Başlangıç durumu
copy.solution  „Was wir bauen"          → Ne kuruyoruz
copy.result    „Was danach anders ist"  → Sonrasında ne değişir
```

→ `lib/dictionary.ts` · `services.problemLabel` / `solutionLabel` / `resultLabel`

Der Betrieb ist der Teil, den Agenturen weglassen. Er gehört in jeden Text,
der länger als drei Sätze ist.

---

## 4 · Die Zeile unter der Headline

**Heute im Code (Owner-Text, bleibt):**

> creaDIG baut Marke, digitalen Auftritt, Betrieb, Automatisierung und
> künstliche Intelligenz als ein System — für Unternehmen in Deutschland,
> Österreich und der Schweiz.

> creaDIG; Almanya, Avusturya ve İsviçre'deki işletmeler için markayı,
> dijital görünümü, işletmeyi, otomasyonu ve yapay zekâyı tek bir sistem
> olarak kurar.

→ `hero.subline` (DE/TR)

**[VORSCHLAG] Kurzfassung**, falls der Owner die Zeile straffen will —
gleiche Aussage, halbe Länge, verliert aber die drei Märkte:

> Websites, Betriebssoftware, Automationen und KI — als ein verbundenes System.
>
> Web siteleri, işletme yazılımı, otomasyon ve yapay zekâ — birbirine bağlı
> tek bir sistem olarak.

Nicht umgesetzt. Der Owner entscheidet, ob die Märkte aus der Subline dürfen
— sie stehen sonst nur noch in der Hero-Fußzeile.

---

## 5 · Verbotene Phrasen

Nicht, weil sie hässlich sind, sondern weil sie **nichts belegen** und jeder
Wettbewerber sie auch schreibt. Wer eine davon braucht, hat kein Argument.

**Marketing-Superlative**
revolutionieren · Gamechanger · Next Level · State of the Art · innovativ ·
einzigartig · maßgeschneidert · ganzheitlich · Rundum-sorglos · Lösungen aus
einer Hand · Ihr starker Partner an Ihrer Seite

**Technik als Schmuck**
AI-powered · KI-getrieben · cutting edge · disruptiv · skalierbar (ohne Zahl) ·
performant (ohne Messung) · zukunftssicher

**Türkçe**
devrim niteliğinde · çığır açan · bir adım önde · anahtar teslim çözümler ·
%100 memnuniyet · sektörün lideri · yapay zekâ destekli (belegloser Zusatz)

**Regel dahinter:** Ein Adjektiv, das man nicht messen oder zeigen kann, wird
gestrichen. Steht daneben ein Beleg (Zahl, Screenshot, Kundenname), darf der
Beleg stehen — dann braucht es das Adjektiv ohnehin nicht.

---

## 6 · Was DE und TR unterscheidet

**TR ist keine Übersetzung, TR ist eine Fassung.**

- Wort-für-Wort ist verboten. Beispiel aus dem Code: Die Hero-Headline heißt
  DE „Wir bauen, / was andere / nicht sehen." und TR „Başkalarının /
  görmediğini / inşa ediyoruz." — dieselbe Aussage, andere Satzstellung,
  gleiches Gewicht auf drei Zeilen.
- Gleiche **Struktur**, nicht gleiche Länge: Das `SameShape`-Gate in
  `lib/dictionary.ts` erzwingt dieselben Schlüssel in beiden Sprachen, nicht
  dieselbe Zeichenzahl. Das Paritäts-Gate im Build prüft die Länge nur auf
  grobe Ausreißer.
- Die türkische Fassung ist für die **türkische Diaspora in Europa**
  geschrieben, nicht für den Markt Türkei. Sie duzt nicht, sie verkauft nicht
  lauter, und sie erklärt deutsche Begriffe nicht weg (Betrieb, Handwerk,
  Festpreis).

---

## 7 · Ton

| Ja | Nein |
|---|---|
| Ruhig, konkret, sparsam | Enthusiastisch, ausrufezeichenlastig |
| Nennt Preise, wo es welche gibt | „Auf Anfrage" als Standard |
| Sagt, was fehlt („folgt") | Lücken mit Bildern füllen |
| Sie-Form, DE und TR | Du-Form |
| Ein Gedanke pro Satz | Schachtelsätze mit drei Kommas |

**Zwei Sätze, die alles zusammenfassen, was hier verboten ist:**
Nicht behaupten, was man nicht zeigt. Nicht versprechen, was man nicht
betreibt.

---

## 8 · Wo der Canon im Code lebt

| Was | Wo |
|---|---|
| Alle sichtbaren Texte DE/TR | `lib/dictionary.ts` (SameShape-Gate) |
| Produkt- und Ebenen-Daten | `lib/site-data.ts` |
| Leistungsseiten-Texte | `lib/service-pages.ts` |
| Paritäts-Prüfung DE↔TR | `scripts/check-parity.mjs` (läuft im `postbuild`) |

Ein Satz, der auf der Seite steht und nicht in einer dieser Dateien, ist ein
Fehler — kein Feature.

---
---

# Teil B · Positionierungs-Architektur (Gate 02, 05.09.2026)

> Teil A oben regelt die SPRACHE. Teil B regelt, was diese Sprache behauptet:
> Kategorie, Zielbild, Problem, Ebenen-Rolle, Abgrenzung, Beweispflicht.
> Wer einen Satz schreibt, prüft ihn gegen Teil A. Wer eine Seite, ein
> Angebot oder eine Kampagne baut, prüft sie gegen Teil B.

## B1 · Die Kategorie — geprüft, nicht nur gesetzt

**„System-Haus für digitale Betriebe" bleibt.** Nicht, weil sie gesperrt ist,
sondern weil sie zwei Prüfungen übersteht, an denen die naheliegenden
Alternativen scheitern.

**Was sie richtig sagt.** „System" heisst: etwas, das nach der Übergabe läuft.
„Haus" heisst: jemand bleibt zuständig. Beides trennt sie von der Agentur,
die liefert und geht — und das ist der Unterschied, um den es geht.

**Was sie falsch sagen kann — und was dagegen steht.**

| Fehldeutung | Warum sie entsteht | Was dagegen steht |
|---|---|---|
| „IT-Systemhaus" — Server, Lizenzen, Helpdesk | In Deutschland ist „Systemhaus" eine besetzte Kategorie | Die Verneinung steht **vor** der Behauptung: „Kein klassisches IT-Systemhaus." Seit Gate 02 auch auf der Startseite, nicht nur auf zwei Unterseiten |
| „digitale Betriebe = Digitalfirmen" — also nicht ich, ich bin Dachdecker | „digital" liest sich als Eigenschaft des Betriebs | **Der entscheidende Satz:** „Digitaler Betrieb" ist das **Ergebnis**, nicht die Voraussetzung. Steht seit Gate 02 wörtlich auf der Startseite |

**Die zweite Zeile ist die wichtigere.** Eine Kategorie, die den eigenen
Zielkunden ausschliesst, ist teurer als eine, die missverstanden wird: Wer
sich nicht angesprochen fühlt, liest nicht weiter und fragt auch nicht nach.

**Regel:** „System-Haus" darf nie allein stehen, wo jemand die Marke zum
ersten Mal sieht. Entweder die Verneinung daneben oder die Definition
darunter.

## B2 · Für wen — vier Stufen statt „KMU"

„KMU" ist kein Zielbild, sondern eine Statistikklasse. Passend ist ein
Betrieb nicht wegen seiner Grösse, sondern wegen **seiner Symptome**.

| Stufe | Merkmale |
|---|---|
| **Primär** | 5–50 Mitarbeiter · Arbeit hängt an Zetteln, Tabellen und drei Programmen, die nichts voneinander wissen · alles läuft über den Inhaber · Anfragen gehen unter · mehrere Standorte oder Aussendienst · wiederkehrende Verwaltung von Hand |
| **Sekundär** | Betriebe mit EINEM klaren Engpass (nur Auftritt, nur Barrierefreiheit, nur ein Ablauf) · gewachsene Betriebe, die einen Nachfolger einarbeiten müssen |
| **Gering** | Betriebe unter 3 Personen ohne wiederkehrende Abläufe · reine Ladengeschäfte ohne Auftragslogik |
| **Kein Fit** | Wer eine Broschüre bestellen will und keinen Betrieb ändern · wer den billigsten Anbieter sucht · wer Server, Lizenzen und Helpdesk braucht — das ist ein IT-Systemhaus, und das sind wir nicht |

**Branchen sind kein Filter.** Handwerk, Praxen, Gastronomie, Verwaltung,
Aussendienst — die Symptome sind dieselben, die Systemlogik ist dieselbe.
Wer die Marke auf eine Branche verengt, verliert die Übertragbarkeit, die
ihr eigentliches Argument ist.

## B3 · Vom Symptom zur Ebene

Kunden sagen nicht „ich brauche eine Operations-Schicht". Sie sagen die
linke Spalte. Die Marke muss die linke Spalte verstehen und die rechte
anbieten — nie umgekehrt.

| Was der Betrieb sagt | Worum es wirklich geht | Ebene | Einstieg |
|---|---|---|---|
| „Unsere Website bringt nichts." | Der Auftritt nimmt nichts entgegen | 02 Digital | Website-Paket |
| „Anfragen gehen unter." | Kein Weg vom Eingang zur Bearbeitung | 02 → 03 | Website-Paket / Systemgespräch |
| „Wir machen alles doppelt." | Dieselben Daten in mehreren Werkzeugen | 03 Operations | Systemgespräch |
| „Alles hängt an mir." | Wissen im Kopf statt im System | 03 Operations | Systemgespräch |
| „Unsere Programme reden nicht miteinander." | Keine Schnittstellen | 03 → 04 | Systemgespräch |
| „Wir brauchen ständig Excel." | Der Betrieb läuft neben der Software | 03 → 04 | Systemgespräch |
| „Immer dieselbe Arbeit von Hand." | Wiederkehrende Wege ohne Automatik | 04 Automation | Systemgespräch |
| „Wir wissen nicht, was zuerst dran ist." | Zahlen da, Entscheidung nicht | 05 Intelligence | Systemgespräch |
| „Wir wachsen, das Chaos wächst mit." | Kein tragendes System | quer | Betriebscheck |
| „Ich weiss nicht, wo es klemmt." | — | — | **Betriebscheck** |
| „Ab 2026 muss die Seite barrierefrei sein." | Rechtliche Frist | 02 Digital | Barrierefreiheits-Prüfung |

**Regel:** Jede neue Leistung braucht eine Zeile in dieser Tabelle. Findet
sich keine, gehört sie nicht ins Haus.

## B4 · Die fünf Ebenen — eine Rolle, nicht vier

Sie sind **eine Landkarte, auf der ein Problem einen Ort bekommt.**

Sie sind ausdrücklich **nicht**:

- **keine Pakete** — man kauft keine Ebene, man löst ein Problem
- **keine Reifestufen** — niemand muss 01 „erreichen", bevor 03 möglich ist
- **keine Reihenfolge im Verkauf** — Einstieg ist dort, wo es klemmt
- **keine Preisliste** — Preise stehen bei den Angeboten, nicht bei den Ebenen

**Was „aufeinander aufbauen" heisst.** Eine Ebene trägt die nächste
*technisch*: Automatisierung ohne saubere Abläufe automatisiert das Chaos.
Das ist eine Bau-Aussage, keine Kauf-Aussage. Der Satz auf `/leistungen` sagt
es richtig: „Sie können auf jeder einsteigen — und auf jeder aufhören."

**Regel:** Wo die fünf Ebenen erscheinen, darf nie ein Preis daneben stehen
und nie eine Nummerierung, die wie ein Weg aussieht, den man abarbeitet.

## B5 · Warum all das zu EINEM Haus gehört

Der grösste Positionierungsrisiko: Marke, Website, CRM, Automatisierung, KI
und eigene Produkte sehen aus wie ein Gemischtwarenladen.

Die Klammer ist keine Aufzählung, sondern eine Reihenfolge:

**Ein Betrieb hat ein Problem → wir sehen es uns an → wir schneiden den
Umfang zu → wir bauen → wir betreiben weiter.**

Alles andere sind Werkzeuge in diesem einen Ablauf:

| | Rolle |
|---|---|
| **Systemprojekt** | die Hauptsache — nach Umfang gerechnet |
| **Einstiegsangebote** | zwei Türen mit Festpreis, damit man nicht das ganze Haus bestellen muss |
| **Managed Betrieb** | der Teil, den Agenturen weglassen |
| **Eigene Produkte** | der Beleg, dass wir Systeme bauen können — nicht ein zweites Geschäft |

**Regel:** Eine Leistung, die sich nicht in diesen Ablauf einordnen lässt,
wird nicht angeboten. Sie macht das Haus zur Agentur zurück.

## B6 · Die eigenen Produkte — Beleg, nicht Portfolio

| | Was es über creaDIG beweist | Sichtbarkeit |
|---|---|---|
| **fibero** | Ein System im **Tagesbetrieb** — Auftrag, Abrechnung, Auswertung. Der stärkste Beleg, weil es läuft | hoch |
| **meAI** | Dass das Haus bis in die Intelligenz-Ebene baut · Stand „im Aufbau, live unter meai.run" | hoch, **aber nicht dominierend** |
| **CASSAMEA** | Branchentiefe (Gastronomie, CH-Anforderungen) | mittel |
| **meahv** | Datenmodell und Abrechnungslogik in der Verwaltung | mittel |

**meAI darf die Marke nicht anführen.** KI ist gerade das lauteste Wort im
Markt — genau deshalb ist es das schwächste Argument: Es macht creaDIG
verwechselbar mit jeder KI-Agentur. Der stärkere Beleg ist ein System, das
seit Jahren im Tagesgeschäft läuft. Die Reihenfolge auf der Seite darf das
widerspiegeln; die Marke führt mit **Betrieb**, nicht mit **KI**.

**Regel:** „Verkauft wird hier keins davon" bleibt auf `/produkte` stehen.
Ohne diesen Satz wird aus dem Beleg ein Katalog.

## B7 · Abgrenzung — fünf Fragen, fünf Antworten

Keine Strohmänner, keine Beschimpfung. Jede Antwort nennt einen Unterschied
in der Sache, nicht im Ton.

| Frage | Antwort |
|---|---|
| **Warum nicht eine Webagentur?** | Eine Website ist bei uns ein Teil des Betriebs, nicht das Produkt. Wir bauen, was danach mit der Anfrage passiert — und wir betreiben es weiter. |
| **Warum nicht ein IT-Systemhaus?** | Die kümmern sich um Geräte, Netz und Lizenzen. Wir kümmern uns um Abläufe: Auftrag, Kunde, Beleg, Zahl. Beides ist nötig, es ist nur nicht dasselbe. |
| **Warum nicht fünf SaaS-Werkzeuge?** | Fünf Werkzeuge sind fünf Datenstände. Die Arbeit, sie zusammenzuhalten, macht danach jemand von Hand — meistens der Inhaber. |
| **Warum kein Freelancer?** | Für einen abgegrenzten Auftrag oft die richtige Wahl. Nicht für etwas, das danach jahrelang laufen muss: Ein System braucht jemanden, der auch in zwei Jahren noch erreichbar ist. |
| **Warum nicht gar nichts tun?** | Weil die Handarbeit nicht auffällt. Sie kostet nie viel auf einmal — sie kostet am Monatsende. |

## B8 · Botschafts-Hierarchie — was wann ankommen muss

Verbindliche Vorgabe für Gate 03.

| Zeit | Was verstanden sein muss |
|---|---|
| **5 Sekunden** | Kategorie + Relevanz: kein IT-Systemhaus, keine Agentur — jemand, der Betriebssysteme baut, und zwar für **meinen** Betrieb |
| **30 Sekunden** | Problem („das kenne ich") + Vorgehen (ansehen → bauen → betreiben) + Unterschied (bleibt zuständig) |
| **2 Minuten** | Fähigkeiten als fünf Ebenen · Einstieg mit Preis · Beleg (eigene Produkte, echte Kunden) · nächster Schritt |
| **Vertiefung** | Leistungstiefe, Produktstände, Managed Betrieb, Ablauf, Fragen |

**Reihenfolge in jedem längeren Text:** Problem → System → Betrieb → Ergebnis
(siehe Teil A §3). Nie Leistung → Feature → Technologie → Preis.

## B9 · Begriffe — was gilt, was nicht

| Wir sagen | Wir meinen | Wir sagen nicht | Warum |
|---|---|---|---|
| **System-Haus** | baut Systeme und betreibt sie | Systemhaus (ohne Bindestrich), Agentur, Studio | Ohne Bindestrich ist es die IT-Kategorie |
| **digitaler Betrieb** | ein Betrieb, dessen Arbeit digital zusammenhängt — das **Ergebnis** | Digitalunternehmen, digital natives | Sonst schliesst es den Zielkunden aus |
| **Ebene** | Ort eines Problems auf der Landkarte | Paket, Stufe, Modul, Phase | Ebenen sind nicht käuflich |
| **Betriebscheck** | Selbsteinschätzung, 15 Fragen, kostenlos | Audit, Analyse, Assessment | „Audit" verspricht eine Prüfung durch uns |
| **Systemgespräch** | 45 Min, Umfang zuschneiden, kostenlos | Discovery, Workshop, Beratungstermin | Ein Wort, deutsch, und es steht schon im Assistenten |
| **Managed Betrieb** | wir betreiben weiter, was wir gebaut haben | Wartung, Support-Paket, SLA | „SLA" verspricht Zahlen, die wir nicht zusagen |
| **Automatisierung** | wiederkehrende Wege übernimmt das System | Prozessoptimierung, Digitalisierung | „Digitalisierung" ist Förderantrags-Sprache |
| **künstliche Intelligenz / meAI** | ein System, das einordnet und vorbereitet | KI-gestützt, AI-powered, intelligent | Beiwörter ohne Beleg |
| **Systemprojekt** | nach Umfang gerechnete Arbeit | Individualsoftware, Custom Development | Der Kunde kauft eine Lösung, keine Programmierung |

## B10 · Behauptung → Beleg

Keine Behauptung ohne den Beleg, der sie tragen müsste. Fehlt der Beleg,
wird die Behauptung schwächer formuliert — nicht der Beleg erfunden.

| Behauptung | Nötiger Beleg | Stand heute |
|---|---|---|
| „Wir bauen Systeme" | eigene Produkte im Betrieb | **vorhanden** — fibero läuft |
| „Wir betreiben weiter" | Managed Betrieb mit Umfang und Preis | **vorhanden** — 149 €/Monat, Umfang benannt |
| „Seit 2017" | Gründungsjahr | **vorhanden** |
| „Echte Kunden" | freigegebene Referenzen | **vorhanden** — NV SWISS, maqam, Bir Damla Hayır |
| „Wir lösen Betriebsprobleme" | eine Fallbeschreibung mit Ausgangslage und Ergebnis | **FEHLT** — 0 von 8 Kapiteln → Gate 12 |
| „meAI bereitet Entscheidungen vor" | Screenshot oder Demo | **FEHLT** → Gate 12 |
| „In vier Wochen online" | ein gelieferter Betrieb in vier Wochen | **unbelegt** — steht als Zusage, nicht als Erfahrungswert |

**Regel:** Solange eine Zeile „FEHLT" trägt, darf die Behauptung erklären,
aber nicht beweisen wollen. Kein „bewährt", kein „vielfach", keine Zahl.

## B11 · JETZT / ALS NÄCHSTES / VISION

Öffentlich darf Richtung stehen. Öffentlich darf **nicht** stehen, dass die
Richtung schon erreicht ist.

| | |
|---|---|
| **JETZT** | Marke · Auftritt · Barrierefreiheit · Betriebssoftware nach Umfang · Managed Betrieb · vier eigene Produkte, davon eines im Tagesbetrieb |
| **ALS NÄCHSTES** | Automatisierung als Regelangebot · meAI aus dem Aufbau in den Betrieb · Fallbeschreibungen als Beleg |
| **VISION** | die digitale Betriebsschicht des Mittelstands |

**Regel:** Was in JETZT steht, darf im Präsens behauptet werden. Was in ALS
NÄCHSTES steht, braucht ein Wort wie „im Aufbau". Was in VISION steht,
gehört in kein Verkaufsversprechen.

## B12 · Was creaDIG nicht ist

Kein IT-Systemhaus (keine Server, Lizenzen, Helpdesk) · keine Werbe- oder
Kreativagentur · kein SaaS-Anbieter — die eigenen Produkte werden hier nicht
verkauft · keine Unternehmensberatung ohne Umsetzung · kein Anbieter, der
übergibt und verschwindet · nicht der billigste.
