# Gate 02 · Proof, Vertrauen & Verkaufsarchitektur

**Status: BUILT 🟢 · ACCEPTED 🟢 · OPERATIONAL 🟡 OWNER-ASSET · CLOSED 🟡**
Ausgangspunkt HEAD `a089d13887ba05dadec5f418c92d4e98d275defc`, Branch
`feat/system-haus-site`. Gemessen und gebaut am 10.09.2026.

Gate 02 besitzt vier Befunde: **WEB-0001, WEB-0002, WEB-0007, WEB-0009** —
alle P1. Zwei sind gelöst, einer ist teilweise gelöst, einer bleibt an einem
Kundenasset hängen, das niemand herstellen kann außer dem Kunden.

---

## 1 · Die Frage, die dieses Gate beantworten musste

> „Warum sollte ein Unternehmen creaDIG glauben und Verantwortung
> an creaDIG übergeben?"

Der Befund des externen Audits: creaDIG erklärt sein eigenes System stärker,
als es Kundenwirkung belegt.

**Der Fund, der die Arbeit bestimmt hat:** Es fehlte an den entscheidenden
Stellen weniger Material als vermutet — es lag an der falschen Stelle.

| | Vor Gate 02 |
|---|---|
| Startseite | zeigt `/works/fibero.jpg` und `/works/meai.jpg` — echte Oberflächen, mit dem Canon-Label darunter |
| `/produkte/fibero` | „Oberflächen zeigen wir erst, wenn wir die echte Anwendung mit Demodaten aufnehmen können." **0 Bilder** |

Die Seite eines Produkts bestritt, was die Startseite von genau diesem Produkt
zeigte. Das ist kein Materialmangel, sondern ein Widerspruch — und er stand an
der einzigen Stelle, an der jemand nach diesem Beleg sucht.

---

## 2 · Die vier Befunde

| ID | Vorher | Nachher | Prüfung | Restblocker |
|---|---|---|---|---|
| **WEB-0002** | `/produkte/fibero` und `/produkte/meai`: 0 Bilder im `main` | je **1 echte Oberfläche** mit Canon-Label; Zugangslage je Produkt | gerendert gemessen, 4 Sprachen | Vollbild-Aufnahmen aus einer Demo-Instanz = Owner (OA-3) |
| **WEB-0009** | `EXTERNAL_BLOCKED` — `meai.run` antwortete mit 307, Text nicht verifizierbar | **verifiziert**: „Geschlossenes System · Zugang nur nach Verifizierung"; CTA und Zugangslage korrigiert | live gelesen 10.09.2026 | Sicherheitsstand des Produkts selbst = extern |
| **WEB-0007** | 858 Wörter auf `/unternehmen`, keine Rollenstruktur | **sechs belegte Antworten** auf „Was passiert, wenn wir Verantwortung abgeben?" + benannte Grenze | gerendert, 4 Sprachen | Vertretungsregel, Kapazität = Owner (OA-4) |
| **WEB-0001** | keine freigegebene Kundenarbeit | unverändert **0** — die Architektur dafür steht und ist geprüft | `npm run proof-drill`, 40 Prüfungen | schriftliche Kundenfreigabe = Kunde + Owner (OA-5) |

---

## 3 · Der Fund, den die Selbstprüfung gemacht hat

Gate 02 hat die vier Owner-freigegebenen Produktfotos angesehen, **bevor** es
sie an einer neuen Stelle veröffentlicht. Zwei davon halten dem eigenen
Standard (`docs/ops/demo-data-standard.md`) nicht erkennbar stand:

| Datei | Was darauf steht | Warum das ein Problem ist |
|---|---|---|
| `/works/cassamea.jpg` | „Kasse 1 - Luzern", Personennamen als Benutzer und an Tischen | Nicht aus dem Musterbestand (Anke Rehberg, Tomasz Wilk, Merve Aydın, Jan Osterloh, Fatih Şen) |
| `/works/meahv.jpg` | zwei Personennamen in „Fristen & Aufgaben", Anschriften, **verpixelte E-Mail** in der Kopfzeile | Der Standard sagt wörtlich: „Verpixeln reicht nicht." Eine Retusche ist ein Hinweis, dass etwas im Bild stand, das nicht hineingehörte |

**Entscheidung: beide werden nicht gezeigt.** Sie hier erstmals einzubinden
wäre eine *neue* Veröffentlichung, und die trägt die Beweislast — nicht der
Verzicht. Punkt 9 der Prüfliste im Standard verlangt ohnehin, dass jemand
anderes das Bild noch einmal ansieht; genau das ist passiert, und das Ergebnis
ist ein Nein.

Das ist **keine** Aussage darüber, dass die Daten echt *sind*. Es ist die
Aussage, dass sie nicht als erfunden erkennbar sind — und die Regel dieses
Repositorys lautet im Zweifel: nicht zeigen. Auflösen kann das nur der Owner
(**OA-2**).

**Was dabei zusätzlich auffiel (OA-1):** Beide Pfade werden weiterhin im
RSC-Payload ihrer Produktseiten ausgeliefert — je 4 Seiten — weil
`ProduktPageBody` eine Client-Komponente ist und das ganze `Work`-Objekt als
Prop bekommt. Sichtbar ist nichts, abrufbar ist es trotzdem; die Dateien
liegen ohnehin öffentlich unter `public/`. Das ist **kein** Schaden aus Gate
02 — es bestand vorher — und exakt dieselbe Klasse achter Weg, die
`docs/ops/proof-kinds.md` für `workSlugs` beschreibt. Es zu schließen hieße
`lib/site-data.ts` zu ändern (G18-gesperrt) oder Owner-Material zu löschen.
Beides steht Gate 02 nicht zu, also wird es gemeldet.

---

## 4 · Was im Produktcode geändert wurde

**Neu:**

| Datei | Inhalt |
|---|---|
| `lib/produkt-beleg.ts` | Register verifizierter öffentlicher Tatsachen je Produkt: geprüfte Aufnahme, Zugangslage, Quelle, Prüfdatum. Liest `site-data` nur |
| `components/sections/delivery-responsibility.tsx` | Sechs belegte Antworten auf die Übergabe-Frage, jede mit Verweis auf ihre Fundstelle |
| `scripts/check-beleg.mjs` | Das Beleg-Gate, 7 Regeln, im Postbuild |

**Geändert:**

| Datei | Änderung | Befund |
|---|---|---|
| `components/pages/produkt-page-body.tsx` | Zugangslage in der Signalzeile; In-situ-Beleg statt Pending-Satz, wo eine geprüfte Aufnahme vorliegt | WEB-0002, WEB-0009 |
| `components/pages/produkte-page-body.tsx` | Zugangslage je Produktzeile (Text, kein zweites Bild) | WEB-0009 |
| `components/pages/unternehmen-page-body.tsx` | `DeliveryResponsibility` hinter `WorkModel` | WEB-0007 |
| `components/pages/arbeiten-page-body.tsx` | Abschluss verwies auf „was Sie hier gesehen haben" — auf einer Seite ohne Inhalt | — |
| `lib/dictionary.ts` | Zugangslabels, In-situ-Texte, `lieferung`-Block, präzisierter Nachtsatz — **alle vier Sprachen** | alle |
| `package.json` | `check-beleg.mjs` in die Postbuild-Kette | — |

Keine der sechs G18-Dateien wurde berührt.

---

## 5 · Der eine Satz, der Gate 03 gehört und trotzdem korrigiert wurde

`managedOperations.statement` lautete:

> „Wir übergeben nicht und verschwinden. Was wir gebaut haben, betreiben wir
> weiter — **fällt nachts etwas aus, ist das unser Problem und nicht Ihres.**"

Zwei Bildschirmhöhen tiefer, auf derselben Seite, steht unter „Nicht
enthalten": *Rufbereitschaft, Wochenenddienst, zugesagte Reaktionszeit in
Stunden* — und beim Support *„Rückruf am nächsten Werktag"*.

Der Satz steht auf `/betrieb` **und** auf `/leistungen`. Er ist als Haltung
gemeint und wird als Zusage gelesen. Wer danach kauft, merkt es beim ersten
nächtlichen Ausfall.

**Jetzt:**

> „… fällt nachts etwas aus, meldet es das Monitoring und nicht Ihr Kunde.
> Zurück ruft ein Mensch am nächsten Werktag."

Damit stehen die drei Ebenen getrennt, die §36 trennt: **Monitoring**
(automatisch, rund um die Uhr) ≠ **Mensch** (nächster Werktag) ≠ **SLA** (gibt
es nicht).

**WEB-0006 bleibt bei Gate 03.** Dort geht es um die Copy-Konsistenz beider
Seiten; hier ging es um den einen Satz, der in die Irre führt. Dieselbe
Trennung wie bei WEB-0019 in Gate 01.

---

## 6 · Gemessen

Methode wie Gate 00/01: `document.scrollHeight` bei 1440 × 900 und 390 × 844,
Wörter aus `main.innerText`.

| Route | Bilder vorher | Bilder nachher | Wörter | 1440 | 390 |
|---|---:|---:|---:|---:|---:|
| `/` | 2 | 2 | 663 | 8.912 | 12.245 |
| `/produkte` | 4 Logos | 4 Logos | 225 | 3.357 | 5.345 |
| `/produkte/fibero` | **0** | **1** | 348 | 5.805 | 7.495 |
| `/produkte/meai` | **0** | **1** | 460 | 6.728 | 9.331 |
| `/produkte/cassamea` | 0 | 0 | 315 | 4.858 | 6.958 |
| `/arbeiten` | 0 | 0 | 82 | 1.940 | 3.118 |
| `/unternehmen` | 9 | 9 | 1.103 | 9.611 | 14.545 |
| `/betrieb` | 0 | 0 | 586 | 5.227 | 8.475 |

**Die Startseite ist unverändert** — 12.245 px mobil vor und nach Gate 02.
Kein Überlauf auf 390 px auf keiner geprüften Route.

### Was schlechter wurde

| Befund | Gate | Wirkung |
|---|---|---|
| WEB-0007-Umsetzung auf `/unternehmen` | — | 859 → 1.103 Wörter (+244), 36 → 43 Eyebrows (+7) |
| WEB-0037 · Extremwert Eyebrows | G04 | `/unternehmen` 36 → 43 |

Die Abwägung: WEB-0007 ist P1, WEB-0037 ist P2. Sechs Antworten mit Verweis
sind der kompakteste Weg, die Übergabefrage zu beantworten; jede Antwort
ersetzt eine Nachfrage im Erstgespräch.

---

## 7 · Was Gate 02 nicht getan hat

- **Keinen Kundenfall, kein Logo, kein Zitat erfunden.** Öffentlich: 0 / 0 / 0.
- **Keinen Preis geändert.**
- **Kein Bild erzeugt, keinen Screenshot gestellt, kein Mockup gebaut.**
- **Zwei vorhandene Bilder bewusst nicht veröffentlicht.**
- **Keine Sicherheitsaussage über meAI gemacht** — weder beruhigend noch
  widersprechend. creaDIG behauptet dort weiterhin nichts, und das ist die
  niedrigere wahre Aussage.
- **Keine „Warum wir"-Sektion**, keine Icon-Karten, keine Vendor-Logos.
- **Keine Zahl ohne Quelle.**
- Careers, G03-Copy, G04-Artdirection, G06-Formulare, G07, G08 nicht angefasst.
- Nicht deployt, nicht promotet, keine Produktionsdaten, kein Kundenkontakt.
- **Gate 03 nicht begonnen.**

---

## 8 · Prüfung

| Prüfung | Ergebnis |
|---|---|
| `npm run build` | grün, 33 von 33 Postbuild-Gates |
| `npx tsc --noEmit` | ohne Befund |
| `npx eslint .` | ohne Befund |
| `npm run proof-drill` | 40 Prüfungen, exit 0 |
| `npm run produkt-drill` | 42 Prüfungen, exit 0 |
| `npm run betrieb-drill` | 44 Prüfungen, exit 0 |
| `npm run redaktion-drill` | 51 Prüfungen, exit 0 |
| `npm run lieferung-drill` | 36 Prüfungen, exit 0 |
| `npm run a11y` | **124 Durchläufe**, keine maschinell feststellbare Verletzung von WCAG 2.1 AA |
| Gegenprüfung Überclaiming | 15 Routen, 7 Mustergruppen — **5 Treffer, alle Verneinungen** („kein 24/7", „keine Reaktionszeit in Stunden") |
| Vier Sprachbäume | DE/TR/EN/AR: Zugangszeile, Lieferabschnitt und Grenze in allen vieren vorhanden |
| G18 | SHA-256 aller sechs Dateien unverändert |

---

## 9 · Was einen großen Kunden heute noch aufhält

Ohne Diplomatie:

1. **Null freigegebene Kundenarbeit.** Kein Fall, kein Logo, kein Zitat. Für
   eine geschäftskritische Entscheidung ist das der harte Blocker — und er ist
   durch keine Textarbeit lösbar.
2. **Keine Vertretungsregel.** Fällt der Verantwortliche aus, sagt die Website
   nicht, was passiert. Sie sagt jetzt immerhin, dass sie es nicht sagt.
3. **Keine Kapazitätsangabe.** „Nehmen Sie uns überhaupt an?" bleibt offen.
4. **Keine Betriebszusage in Zahlen.** Bewusst — aber für ein Kernsystem ist
   „Rückruf am nächsten Werktag" zu wenig, und das ist eine Angebots-, keine
   Textfrage.
5. **Zwei von vier Produkten ohne zeigbare Oberfläche**, weil das vorhandene
   Material dem eigenen Standard nicht standhält.

Punkt 1 und 5 sind Owner-/Kundenassets. Punkt 2–4 sind Owner-Entscheidungen.
Keiner davon lässt sich durch bessere Formulierung schließen — und genau das
ist das Ergebnis dieses Gates.
