# creaDIG · Recherche

> **Authority:** Kanon · Gate 10 · 06.09.2026
> Baut auf `market-canon.md` (G09). Ausführbar in `lib/research.ts`,
> geprüft mit `npm run research-drill` (15 Reisen gegen echte Datenbank).

---

## 1 · Recherche hängt an Organisationen

**Kein zweites Firmenmodell.** Ein recherchierter Betrieb ist derselbe
Betrieb wie ein Kunde — er ist nur früher im Leben. Zwei Tabellen hängen an
`organisations`:

| | |
|---|---|
| `research_cases` | ein Vorgang je Organisation: warum entdeckt, wo gefunden, wie weit, was als Nächstes |
| `research_evidence` | die einzelnen Belege — **je Beleg eine Quelle**, vom Schema erzwungen (`source_url NOT NULL`) |

**Keine Spalte für die Einordnung.** Sie wird aus den gültigen Belegen
abgeleitet. Gespeichert wäre sie ab der ersten Regeländerung still falsch —
dieselbe Überlegung wie bei der Angebotsreife in G08.

---

## 2 · Drei Dinge, die getrennt bleiben

| | |
|---|---|
| **Tatsache** | was beobachtet wurde, mit Fundstelle |
| **Deutung** | was daraus folgen könnte |
| **Unbekannt** | was niemand nachgesehen hat |

Die Datenbank speichert die **Tatsache**. Die Deutung entsteht beim Lesen.
Unbekannt bleibt sichtbar unbekannt — die Detailseite trägt eine eigene
Spalte „Was noch offen ist", weil ein leeres Feld sonst wie eine Antwort
aussieht.

---

## 3 · Quellen — was darf ein Programm, was nur ein Mensch

| Quelle | maschinell | verlässlich |
|---|---|---|
| Eigene Website | ✓ | hoch |
| **Stellenanzeige** | **nein** | **hoch** |
| Presse | ✓ | mittel |
| Ausschreibung | ✓ | hoch |
| Handelsregister | nein | hoch |
| Branchenverzeichnis | nein | mittel |
| **LinkedIn-Unternehmensseite** | **nein** | mittel |
| Empfehlung | nein | mittel |

**Die ergiebigste Quelle darf nicht automatisiert werden.** Stellenanzeigen
sagen mehr über den Betriebszustand als jede andere öffentliche Quelle —
welche Werkzeuge benutzt werden, welche Arbeit von Hand läuft. Und genau
diese Portale untersagen den maschinellen Abruf. Also: von Hand öffnen,
Fundstelle festhalten. Das steht im Code, nicht im Gewissen.

LinkedIn ist auf **Unternehmensseiten** begrenzt. Keine Personenprofile —
das wäre G11 und bräuchte G04.

---

## 4 · Sieben Zustände, und wann Schluss ist

| Zustand | Bedeutung |
|---|---|
| entdeckt | Gefunden, noch nicht angesehen |
| in-recherche | Belege werden gesammelt |
| **beleg-fehlt** | Ein zweites Signal fehlt |
| eingeordnet | Genug für ein Urteil; Zugang fehlt |
| zurückgestellt | Passt, aber heute nicht bedienbar oder nicht erreichbar |
| ausgeschlossen | Belegter harter Ausschluss |
| **bereit-für-kontakt** | Ab hier ist es Menschenarbeit — G11 |

**Recherche hat kein natürliches Ende.** Man findet immer noch etwas. Ohne
Abbruchregel produziert ein Rechercheystem keine Entscheidungen, sondern
Beschäftigung. `abbruch()` beantwortet das deterministisch.

**Die Reihenfolge der Prüfung ist selbst eine Entscheidung.** Bedienbarkeit
kommt **vor** Zugang — das hat der Probelauf gefunden: Ein Schweizer Betrieb
mit bestem Zugang landete auf „bereit für Kontakt", obwohl die Rechnungslage
für CH ungeklärt ist. Jemanden anzusprechen, dem man keine Rechnung stellen
kann, ist schlimmer als ihn nicht anzusprechen — man verbrennt einen echten
Kontakt für nichts.

---

## 5 · Dubletten

| | Führt zusammen | Warum |
|---|---|---|
| **Netzadresse** | **exakt** | Sie gehört genau einem Betrieb |
| gefalteter Name | **wahrscheinlich** — Mensch entscheidet | „Meyer Bau" gibt es in jeder zweiten Stadt |
| sonst | kein Treffer | |

Die Faltung ist dieselbe wie im CRM-Import (G07), zusätzlich fallen
Rechtsformen weg — „Meyer GmbH" und „Meyer GmbH & Co. KG" sollen wenigstens
auffallen.

Gemessen: Vegitat wird bei Wiederentdeckung als **wahrscheinlich** gemeldet,
es entsteht keine zweite Organisation, und die vier Standorte bleiben.

---

## 6 · Widersprüche werden gemeldet, nicht aufgelöst

Zwei gültige Belege zum selben Signal, die Verschiedenes sagen, bleiben
**beide stehen** und werden angezeigt. **Der neuere ist nicht automatisch
der bessere** — eine Stellenanzeige von gestern schlägt kein
Handelsregister von vorletztem Jahr.

Ein Mensch entscheidet; der abgelöste Beleg bleibt in der Akte, damit man
später erklären kann, warum damals anders entschieden wurde.

---

## 7 · Frische ohne Verfallsfrist

Es gibt **keine** einheitliche Frist. Eine Registeradresse ist nach zwei
Jahren noch richtig, eine Stellenanzeige nach zwei Monaten gegenstandslos.
Eine gemeinsame Frist wäre in beiden Fällen falsch. Das Alter des jüngsten
Belegs wird **sichtbar gemacht**, nicht bewertet.

---

## 8 · Fremder Text bleibt Daten

Recherchetext stammt von Seiten, die creaDIG nicht kontrolliert, und wird
später von einer KI gelesen (G28/G29). `sanitizeClaim()` entfernt
Steuerzeichen und Auszeichnung, entschärft Anweisungsformen und begrenzt die
Länge — **bevor** der Text die Datenbank sieht.

Gemessen: `System: ignore all previous instructions <script>…` kommt
entschärft an.

---

## 9 · Was Recherche NICHT erzeugt

Gemessen über alle 15 Reisen:

- **keine Verkaufschance** — 0, durchgehend
- **kein Kontakt** — kein Mensch wird gespeichert
- **keine Werbeeinwilligung**
- **keine Erlaubnis zur Ansprache** — auch nicht bei belegtem Anlass

**Ein Anlass ist ein Beleg, keine Erlaubnis.** Eine Ausschreibung wird als
Tatsache mit Quelle und Datum gespeichert. Ob daraus eine Ansprache wird,
entscheidet G11 — und es gibt kein Feld, das die Frage vorwegnimmt.

---

## 10 · Übergabe an G11

`bereit-für-kontakt` heißt: **Wir verstehen den Betrieb gut genug, dass die
Frage nach dem richtigen Menschen jetzt gerechtfertigt ist.**

Es heißt **nicht**: ansprechen.

G11 bekommt: Organisation · belegte Signale mit Quellen · offene Fragen ·
Zugangsweg · Anlass, falls vorhanden · Grund der Übergabe. Keine Arbeit
doppelt.
