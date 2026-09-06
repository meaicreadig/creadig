# creaDIG · Kontakt & Zugang

> **Authority:** Kanon · Gate 11 · 06.09.2026
> Baut auf `market-canon.md` (G09) und `research-canon.md` (G10).
> Ausführbar in `lib/contact-access.ts`, geprüft mit `npm run contact-drill`.

---

## 1 · Der Satz, um den es geht

> **„bereit für Kontakt" ist ein Zustand des WISSENS.
> Ansprechen ist eine ENTSCHEIDUNG.**

Zwischen beiden darf keine Automatik stehen. Ein System, das aus „wir wissen
genug" von allein „wir schreiben" macht, ist ein Spam-System mit besserer
Begründung.

Deshalb gibt es `research_cases.contact_decision`. Es füllt sich **nicht**
von selbst — auch dann nicht, wenn alles andere grün ist. Es gibt genau
einen Schreibweg: die Server-Aktion, die ein Mensch auslöst.

---

## 2 · Vier Achsen, die nie zu einer werden

| Achse | Frage | Woher |
|---|---|---|
| **Passung** | Hat der Betrieb das Problem? | G09/G10 |
| **Person** | Kennen wir einen Menschen — **belegt**? | G11 |
| **Zugang** | Gibt es einen ehrlichen Weg? | G10 |
| **Anlass** | Gibt es einen belegten Geschäftsanlass? | G10-Belege |

„LinkedIn-Profil vorhanden" ist kein Zugang. „Warm" ist keine Passung. Ein
Anlass ist keine Erlaubnis.

**Gemessen:** ein passender Betrieb ohne Zugang bleibt passend und wird
zurückgestellt; ein warmer Kontakt ohne Belege erzeugt keine Passung.

---

## 3 · Eine Person zählt nur mit Fundstelle

Ein Name ohne Quelle ist eine Vermutung, und eine Vermutung darf keinen
Menschen erreichen. Der Zustand heißt **`person-unbelegt`** und ist von
„keine Person" ausdrücklich unterschieden.

**Die Ausnahme:** eigener Bestand, eingehende Anfrage, Empfehlung. Dort ist
creaDIG selbst die Quelle — ein Mensch hat den Namen genannt oder der Mensch
hat sich selbst gemeldet.

**Nie:** „wahrscheinlich Geschäftsführer". Aus einer Firmenwebsite ohne
Impressumseintrag folgt keine Person.

---

## 4 · Wann eine Ansprache überhaupt gedeckt wäre

`ansprachedeckung()` kennt genau zwei Wege — beide aus dem G09-Kanon:

1. **Ein bestehender Weg** — Empfehlung, Netzwerk, Bestandskunde, oder der
   Betrieb hat selbst angefragt. Dann braucht der Kontakt keinen Anlass.
2. **Ein belegter Anlass** — eine Ausschreibung, eine Stellenanzeige mit
   passendem Bedarf. Etwas, das der Betrieb **selbst öffentlich gemacht** hat.

Ohne eines von beidem wäre es kontextlose Ansprache, und die ist
ausgeschlossen.

Die Funktion **entscheidet nicht**. Sie sagt, ob eine Entscheidung überhaupt
zulässig wäre. In der Oberfläche ist „Kontakt vorbereiten" ohne Deckung
deaktiviert und trägt den Grund.

---

## 5 · Sieben Zustände

`person-unbekannt` · `person-unbelegt` · `zugang-offen` ·
`entscheidung-offen` · `vorbereitet` · `zurückgestellt` · `abgeschlossen`

**„Keine Person bekannt" ist ein gültiger Zustand** und wird als Satz
erklärt, nicht als leeres Feld — samt konkretem nächsten Schritt (Impressum,
Stellenanzeige, Unternehmensseite, Netzwerk).

**Zurückgestellt bleibt zurückgestellt.** Nichts wird von selbst wieder
aktiv.

---

## 6 · Was auch dann nicht passiert, wenn alles grün ist

Vier Sätze stehen in der Oberfläche, nicht nur hier:

- Keine Nachricht wird verschickt — Ansprache ist ein eigener Schritt.
- Keine Verkaufschance entsteht — die legt ein Mensch im Vertrieb an.
- Keine Werbeeinwilligung entsteht — eine Geschäftsbeziehung ist keine.
- Kein Profil wird abgerufen — LinkedIn wird **verlinkt**, nicht ausgelesen.

**Gemessen über den ganzen Probelauf: 0 Verkaufschancen, 0 Sprünge auf
„vorbereiten" ohne Entscheidung, kein Feld für Werbeeinwilligung im Schema.**

---

## 7 · Kein zweites System

`contacts` (G07) wird erweitert, nicht ersetzt: drei Spalten für die
Herkunft. `research_cases` (G10) bekommt die Person und die Entscheidung.
Der nächste Schritt liegt im **bestehenden** `next_action` — keine zweite
Aufgabenmaschine.

Menschliche Korrekturen überleben den nächsten Import (`coalesce`, wie in
G07) — gemessen.

---

## 8 · Übergabe an die spätere Ansprache

Was weitergereicht wird: Organisation · Person mit Rolle und Fundstelle ·
belegte Signale · Anlass mit Quelle · Zugangsweg · Nähe · offene Fragen ·
**die Owner-Entscheidung mit Begründung** · nächster Schritt.

Was **nicht** mitgeht: eine Erlaubnis. Die Ansprache selbst ist ein eigener
Schritt in einem eigenen Gate.
