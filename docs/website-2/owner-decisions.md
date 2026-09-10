# Owner-Entscheidungen

Sechs Fragen. Nur, was ein Gate wirklich blockiert. Empfehlung steht zuerst.

Alles andere ist aus Repository, Website oder Audit beantwortbar und wird nicht
gefragt.

---

## Stand nach Gate 01

Gate 01 musste liefern, ohne dass eine dieser Fragen beantwortet war. Es hat
deshalb in zwei Fällen **nach der hier stehenden Empfehlung gehandelt** und das
so vermerkt. Beides ist umkehrbar; keine Antwort ist damit vorweggenommen.

| # | Frage | Stand |
|---|---|---|
| OD-1 | Produkte und Arbeiten — zwei Seiten oder eine? | **nach Empfehlung umgesetzt** (siehe unten), Owner kann umkehren |
| OD-2 | Freigebbare Kundenprojekte? | offen — blockiert die Rückkehr von `/arbeiten` ins Hauptmenü |
| OD-3 | *(unverändert)* | offen |
| OD-4 | Personen, Rollen, Lieferfähigkeit | offen — G02 |
| OD-5 | Wen soll die Startseite zuerst ansprechen? | **nach Empfehlung umgesetzt**, Owner kann umkehren |
| OD-6 | Einstiegspreise für Identity, Automation, Intelligence | **neu aus Gate 01** |

---

## Owner-Asset-Warteschlange (Gate 02)

Keine Frage nach einer Entscheidung — eine Liste von **Material**, das nur der
Owner oder ein Kunde herstellen kann. Sortiert nach kommerzieller Wirkung.

| # | Asset | Warum es wiegt | Wo es erscheinen würde | Minimum | Bis dahin |
|---|---|---|---|---|---|
| **OA-5** | **Eine schriftlich freigegebene Kundenarbeit** | Der einzige harte Blocker für Mittelstand und größer. Kein Fall, kein Logo, kein Zitat ist heute öffentlich | `/arbeiten`, Leistungsseiten, Startseite | Ein `releases`-Eintrag: Person, Rolle, Form, Datum, Umfang, Fundstelle | `/arbeiten` sagt truthful, dass keine Freigabe vorliegt |
| **OA-2** | **Klärung zu `/works/cassamea.jpg` und `/works/meahv.jpg`** | Zwei von vier Produkten haben dadurch keine zeigbare Oberfläche | `/produkte/cassamea`, `/produkte/meahv` | Bestätigung, dass die sichtbaren Namen erfunden sind — oder Ersatzaufnahme | Beide Seiten zeigen kein Bild |
| **OA-3** | **Vollbild-Aufnahmen aus einer Demo-Instanz** (4 Produkte) | Zeigt, WIE das System arbeitet, nicht nur DASS es existiert | `public/works/products/<slug>/` — rendert ohne Code-Eingriff | Demo-Mandant mit dem Musterbestand aus `docs/ops/demo-data-standard.md` | In-situ-Aufnahme plus Satz, was sie nicht ist |
| **OA-4** | **Vertretungsregel und Kapazitätsaussage** | Die zwei Fragen, die ein Mittelständler vor jedem größeren Auftrag stellt | `/unternehmen`, Abschnitt „Wenn Sie Verantwortung abgeben" | Ein Satz, der hält: Wer übernimmt, wenn der Verantwortliche ausfällt | Die Lücke steht ausgesprochen auf der Seite |
| **OA-1** | **Entscheidung zu den zwei zurückgehaltenen Bilddateien** | Sie liegen öffentlich unter `public/` und stehen im RSC-Payload ihrer Produktseiten | — | Entfernen oder als standardkonform bestätigen | `check-beleg.mjs` meldet es bei jedem Build |
| **OA-6** | **Ein benanntes Integrationsbeispiel** | `/systeme` trägt 848 Wörter und keinen Beleg | `/systeme` | Ein realer Fall, anonymisierbar | Die Behauptung bleibt `CLAIM_ONLY` |
| **OA-7** | **Reifegrad je Produkt** (`maturity`, heute überall `null`) | Der Badge rechnet ersatzweise aus `live` + Adresse | Produktseiten | Vier Werte, vom Owner bestätigt | Abgeleiteter Status plus Zugangslage |

**Nicht gefragt wird nach** allem, was sich aus dem Repository oder der
öffentlichen Produktadresse ableiten lässt — das hat Gate 02 selbst getan.

---

## OD-1 · Produkte und Arbeiten — zwei Seiten oder eine?

**Empfehlung: vorläufig zusammenlegen.**

**Warum es blockiert:** Beide Seiten verlinken heute **exakt dieselben vier
Ziele**. `/arbeiten` hat kein einziges eigenes Ziel, trägt 25 Label bei 191
Wörtern — und ist laut Audit der wahrscheinlichste Klick. G01 kann die
Informationsarchitektur nicht entwerfen, solange das offen ist.

| Option | Folge |
|---|---|
| **A · Zusammenlegen** (empfohlen) | Ein starker Beweisraum statt zweier halber. Rückbau später möglich, sobald echte Kundenfälle da sind. |
| B · Getrennt lassen | Braucht sofort 2–3 freigegebene Kundenfälle, sonst bleibt die Doppelung sichtbar. |
| C · `/arbeiten` zu „Cases" umdefinieren | Erst sinnvoll, wenn Fälle existieren — heute leer. |

**Ohne Antwort geht weiter:** alles außer der Navigations- und Beweisstruktur.

> **Was Gate 01 getan hat, ohne die Antwort zu haben.**
> Nicht Option A im Wortsinn (keine Route wurde gelöscht oder umgeleitet),
> aber ihre Wirkung: `/produkte` ist der **eine** Beweisraum und bleibt im
> Hauptmenü; `/arbeiten` zeigt keine eigenen Produkte mehr und verlässt das
> Hauptmenü, bleibt aber als Route für Kundenarbeit bestehen (D-16).
>
> Das ist Option A mit erhaltener Rückbaumöglichkeit — genau der Rückbau, den
> die Empfehlung selbst vorsieht („sobald echte Kundenfälle da sind").
> Eine echte Zusammenlegung hätte `/arbeiten/[slug]` mitgetroffen und wäre
> ohne Owner-Antwort nicht umkehrbar gewesen.

---

## OD-2 · Gibt es Kundenprojekte, die freigegeben werden können?

**Empfehlung: zwei Projekte anonymisiert freigeben.**

**Warum es blockiert:** Das ist die größte kommerzielle Schwäche der Website —
der einzige `PROVEN`-Beleg ist ein Audit der eigenen Seite. Ohne Antwort kann
G02 keine Beweisarchitektur bauen, sondern nur die Lücke schöner einrahmen.

Gebraucht wird pro Fall: Ausgangslage, Umfang, ein Artefakt (Screenshot,
Ablaufbild, Vorher/Nachher) und die Wirkung. Anonymisiert reicht — „ein
Handwerksbetrieb mit 12 Mitarbeitenden" ist ein Fall, „NV SWISS" wäre besser.

Im Datenbestand liegen `nv-swiss` und `maqam`, öffentlich nicht verlinkt.
**Frage:** Ist für eines davon eine Freigabe erreichbar?

**Ohne Antwort geht weiter:** Produktbeleg, Struktur, Content, Visuelles.

---

## OD-3 · Welche Betriebszusage gilt wirklich?

**Empfehlung: „Monitoring rund um die Uhr, Bearbeitung im vereinbarten
Supportfenster."**

**Warum es blockiert:** Auf `/betrieb` **und** `/leistungen` steht „Fällt nachts
etwas aus, ist das unser Problem und nicht Ihres" — und auf denselben Seiten
„Reaktionszeit in Stunden, kein 24/7" sowie „Wochenende, im Urlaub". Das ist ein
Wahrheitswiderspruch (WEB-0006, P1), kein Formulierungsproblem. Ein Kunde, der
sich auf den ersten Satz verlässt, wird enttäuscht.

**Zu klären:** Läuft Monitoring wirklich rund um die Uhr? Wie lautet das
Supportfenster? Gibt es eine Notfallregel?

**Ohne Antwort geht weiter:** alles außer der Betriebs-Copy.

---

## OD-4 · Welche Rollen dürfen öffentlich gezeigt werden?

**Empfehlung: reale Kernrollen und Vertretung zeigen, ohne Größe zu behaupten.**

**Warum es blockiert:** `/unternehmen` nennt Founder plus Kernteam plus Netzwerk
— ohne Personen, Rollen, Vertretung oder Kapazität. Für Kleinbetriebe reicht
das; ab dem wachsenden Betrieb ist es der zweite große Blocker (WEB-0007).

Es geht nicht darum, größer zu wirken. Es geht um die Frage „Wer macht das, und
was passiert, wenn diese Person ausfällt?"

**Ohne Antwort geht weiter:** alles außer der Team- und Lieferfähigkeitsseite.

---

## OD-5 · Wen soll die Startseite zuerst ansprechen?

**Empfehlung: mit dem Problem eröffnen, nicht mit dem Modell — und die Ebenen
danach als Ordnung anbieten.**

**Warum es blockiert:** Die Startseite erklärt heute die fünf Ebenen, bevor
irgendein Kundenproblem vorkommt (WEB-0003), und verankert mit 2.400 € einen
Website-Preis (WEB-0024). Beides zusammen führt kleine Betriebe gut und größere
gar nicht. G01 muss wissen, ob die Startseite bewusst zuerst den Kleinbetrieb
abholt — oder ob sie breiter öffnen soll.

Das ist **keine** Frage nach Zielgruppen-Einschränkung (siehe D-01). Es ist die
Frage, wer zuerst angesprochen wird.

**Ohne Antwort geht weiter:** Beleg, Content-Bereinigung, Visuelles, Technik.

> **Was Gate 01 getan hat, ohne die Antwort zu haben.**
> Die Empfehlung umgesetzt: Die Startseite eröffnet mit dem Problem, das
> Ebenenmodell folgt danach (D-15), und der 2.400-€-Anker ist aufgelöst — die
> Seite zeigt die *Arten* anzufangen statt einer Zahl in der Überschrift
> (D-19). Kein Preis wurde geändert.
>
> Damit ist die Startseite **breiter** geöffnet als vorher, nicht enger. Die
> eigentliche Frage — soll sie zuerst den Kleinbetrieb abholen? — bleibt offen
> und ist mit einer Copy-Änderung in beide Richtungen umkehrbar.

---

## OD-6 · Was kostet ein Einstieg in Identity, Automation und Intelligence?

**Empfehlung: für Intelligence einen bestätigten Einstiegspreis oder eine
Projektgröße nennen. Für Identity und Automation reicht vorerst „Angebot nach
Analyse".**

**Warum es blockiert:** Gate 01 hat jeder der fünf Ebenen einen Einstieg
gegeben (WEB-0004). Zwei tragen einen bestätigten Betrag:

| Ebene | Einstieg | Betrag | Herkunft |
|---|---|---:|---|
| Digital | Festpreis | 2.400 € | `packages.website` |
| Operations | monatlich | 149 € | `retainer.amount` |
| Identity | Angebot nach Analyse | — | **fehlt** |
| Automation | Angebot nach Analyse | — | **fehlt** |
| Intelligence | Angebot nach Analyse | — | **fehlt** |

Für Intelligence ist das die schwerste Lücke: Es ist die Ebene, die creaDIG
vom Webdienstleister unterscheidet, und die einzige, für die es weder Preis
noch Leistungsseite gibt. Der Beleg ist stark (meAI läuft, selbst gebaut,
selbst benutzt) — der Einstieg ist es nicht.

**Es wurde bewusst keine Zahl erfunden.** Sie wäre die einzige Zahl auf der
Website, die niemand halten muss. Was gebraucht wird, ist eines von dreien:

| Option | Folge |
|---|---|
| **A · Ein Einstiegspreis** (empfohlen) | Die Ebene wird kaufbar wie Digital und Operations |
| B · Eine Projektgröße („ab X, typisch Y–Z") | Sortiert Interessenten vor, ohne einen Festpreis zuzusagen |
| C · Bleibt „Angebot nach Analyse" | Wahr und heute umgesetzt — aber das Gespräch entscheidet allein über die Größenordnung |

Wo die Zahl hingehört: `packages` beziehungsweise `retainer` in
`lib/site-data.ts`. Nirgendwo sonst (D-18).

**Ohne Antwort geht weiter:** alles. Die Seite ist in diesem Zustand wahr —
sie ist nur weniger verkaufsfähig, als sie sein könnte.
