# Control Center · Vertrieb 1.1

> **Authority:** Spec · Stand 03.09.2026
> **Status:** gebaut, lokal vollständig geprüft. Die Abnahme gegen die echte
> Datenbank steht aus — sie braucht ein Preview-Deployment, weil hier kein
> nutzbarer Zugang existiert (`.env.local` trägt den Wert maskiert).

---

## Das Modell

Bis hierher war „Lead" ein Sammelbegriff für vier Dinge, die sich
unterschiedlich verhalten. Sie sind jetzt getrennt:

| Objekt | Was es ist | Ändert sich |
|---|---|---|
| **Anfrage** | ein Formulareingang, ein Beleg | nie |
| **Kontakt** | ein Mensch | selten |
| **Organisation** | ein Betrieb | selten |
| **Standort** | eine Adresse eines Betriebs | selten |
| **Verkaufschance** | ein laufender Vorgang | ständig |

### Die Trennung, die den Unterschied macht

**Beziehung ≠ Pipeline.** Zwei Achsen, nicht eine Skala:

| | keine offene Chance | offene Chance |
|---|---|---|
| **eng** | der Bekannte, bei dem gerade nichts ansteht | Stammkunde mit Folgeauftrag |
| **unbekannt** | die alte Anfrage von 2024 | die kalte Anfrage von gestern |

Alle vier Felder kommen im Alltag vor. Wer beides in eine Spalte legt, muss
warme Kontakte entweder als Vorgänge führen — dann steht die Pipeline voll
mit Nicht-Geschäften — oder gar nicht führen, dann verliert man sie.

**Bearbeitung ≠ Status.** Eine Anfrage kann „bearbeitet" sein, ohne dass je
eine Chance entsteht. „Angesehen, passt nicht, beantwortet" ist ein
vollständiger Vorgang, kein Rückstand.

### Die dritte Achse: Kundenhistorie

Seit 1.1 gibt es sie getrennt, weil „Kunde" und „warm" verwandt klingen und
unabhängig sind:

| | Beziehung | Kundenhistorie | offene Chance |
|---|---|---|---|
| Vegitat | was belegt ist | **Kunde** | nur wenn real |
| Ole Bettray | **warm** | **nie Kunde** | nein |
| kalte Anfrage von gestern | unbekannt | nie Kunde | ja |

Wer Beziehung und Historie zusammenlegt, kann die wertvollste Frage eines
Betriebs nicht mehr stellen: *wen haben wir schon einmal überzeugt?*

Vier Stufen, nicht drei. „Kunde — belegt" sagt genau so viel, wie belegt ist:
Es gab eine Geschäftsbeziehung. Ob sie heute läuft, weiss niemand, und es gibt
kein Feld, das es behauptet. Der Zustand, in dem sich fast der gesamte Bestand
befindet, ist weder „bestehend" noch „ehemalig" — und ihn zu einem von beiden
zu erklären hiesse raten.

**Prospect ist keine Verkaufschance.** `prospect` heisst „war noch nie Kunde",
sonst nichts. Wer daraus einen Vorgang ableitet, hat eine Pipeline voll
Betriebe, die von nichts wissen.

### Ein Betrieb, mehrere Adressen

Vegitat hat vier bekannte Standorte. Vier Organisationen daraus zu machen
würde jede Zählung ab dem ersten Tag vervierfachen, und die Frage „mit wem
haben wir gearbeitet" hätte vier Antworten, wo es eine gibt.

Umgekehrt gilt dasselbe: **gleiche Marke ist kein Beleg für gleichen
Betreiber.** Die drei freenet-Datensätze (Osnabrück, Bünde, Lübbecke) bleiben
getrennt, solange keine gemeinsame Betreiberorganisation belegt ist. Die
Zusammenführung liesse sich später nachholen; die Trennung nach einer falschen
Verschmelzung nicht.

---

## Was aus den bestehenden Daten wurde

Migration `003` teilt jede vorhandene Anfrage auf, **ohne eine Zeile zu
verlieren**:

| Aus | Wird |
|---|---|
| `business` | Organisation (ein Datensatz je Name, Vergleich kleingeschrieben) |
| `email` | Kontakt (ein Datensatz je normalisierter Adresse) |
| `sales_status`, `next_action` | Verkaufschance — **nur wenn wirklich gearbeitet wurde** |
| — | zwei Chronik-Einträge je Vorgang, beide aus belegten Zeitpunkten |

**Eine unangetastete Anfrage wird KEINE Verkaufschance.** Sonst stünde am
ersten Tag eine Pipeline voll Vorgänge, an denen nie jemand gearbeitet hat.
Gearbeitet heisst nachweisbar: Status nicht mehr `new`, oder ein nächster
Schritt gesetzt. Beides kann nur ein Mensch getan haben.

`leads.sales_status` bleibt gefüllt stehen — ab jetzt Herkunftsnachweis,
nicht mehr Arbeitsstand. Eine Spalte zu löschen, deren Inhalt gerade erst
kopiert wurde, ist ein Rückweg weniger für nichts.

---

## Deduplizierung

Der Fall, der ein CRM zerstört: derselbe Mensch schickt drei Anfragen.

`contacts.email_normalised` (kleingeschrieben, getrimmt) trägt einen
Eindeutigkeitsindex. Der Schreibweg nutzt
`ON CONFLICT (email_normalised) DO UPDATE` — die dritte Anfrage wird kein
dritter Kontakt, sondern setzt seine letzte Berührung neu.

**Die Beziehungsstufe wird dabei nicht angefasst.** Wer warm ist, bleibt
warm, auch wenn er ein Formular ausfüllt; eine Anfrage ist kein Rückschritt.

---

## Verknüpfung neuer Anfragen

Der Backfill läuft beim Prozessstart. Eine danach eintreffende Anfrage hätte
bis zum nächsten Kaltstart keinen Kontakt — und wäre in „Beziehungen"
unsichtbar, obwohl sie in „Anfragen" steht.

Deshalb verknüpft `linkLeadToCrm()` **im Schreibweg**, direkt nach dem
Speichern. Als eigener Schritt, nicht in einer Transaktion: Scheitert er, ist
die Anfrage trotzdem gespeichert. Das ist die richtige Reihenfolge der
Verluste — eine fehlende Verknüpfung zieht der nächste Start nach, eine
verlorene Anfrage nicht.

---

## Warum Vertrieb die Datenbank braucht

`LeadStore` (Schreibweg der Website) erfüllen auch die Entwicklungs-Adapter,
und das bleibt so. `VertriebStore` ist eine **zweite Facette desselben
Speichers**, die nur der Neon-Adapter erfüllt.

Verknüpfungen und Zählungen über vier Tabellen in einer JSON-Datei
nachzubauen hiesse, einen halben Datenbankkern zu schreiben, den niemand
testet — und dessen Verhalten dann **nicht** dem entspricht, was in
Produktion läuft. Genau diese Art Attrappe hat hier schon einen Fehler
versteckt: `42P08` fiel erst gegen echtes Postgres auf.

Fehlt die Datenbank, sagt die Oberfläche das. Sie zeigt keine leere Pipeline —
das wäre eine Aussage über das Geschäft statt über die Technik.

---

## Was bewusst fehlt

| | Warum |
|---|---|
| Kanban | Die Alltagsfrage ist „woran muss ich heute ran", nicht „wie verteilt sich mein Bestand". Neun Spalten können nicht nach Fälligkeit sortieren — und wären bei dieser Menge neun fast leere Spalten. |
| Abschlussquote, Pipeline-Wert, Prognose | Es gibt keine historischen Statuswechsel vor dieser Version und kaum abgeschlossene Vorgänge. Eine Quote aus drei Datensätzen ist eine Behauptung mit Prozentzeichen. |
| LinkedIn-Anbindung | Es gibt keine autorisierte API. Gespeichert wird eine Adresse, angeboten wird ein Link. Eine „Integration", die aus einem `<a href>` besteht, wäre eine Attrappe. |
| Chronik vor 1.0 | Hat niemand protokolliert. Eine nachträglich konstruierte Chronik wäre eine Erzählung mit Zeitstempeln. |
| Lead Scoring | Keine Datengrundlage. Der Betriebscheck misst Reifegrad, nicht Kaufabsicht — ihn umzudeuten wäre die naheliegendste und falscheste Abkürzung. |

---

---

## Der reale Bestand

`lib/vertrieb-bestand.ts` trägt die Bestandsliste des Eigentümers — **keine
Zeile stammt aus einer Suchmaschine.** Wo eine Anschrift steht, wurde sie
mitgeteilt; wo keine steht, ist die Organisation nicht eindeutig
identifizierbar, und das Feld bleibt leer.

Eine Adresse, die zu 80 % stimmt, ist schlimmer als ein leeres Feld: Das leere
Feld sagt „nachschlagen", die falsche sagt „erledigt".

Bei ARAG, freenet und dem Integrationsrat kommt hinzu, dass die naheliegende
Zuordnung nicht nur ungenau, sondern **unwahr** wäre — eine Agentur ist nicht
ihr Konzern, ein Shop nicht seine Kette, ein kommunales Gremium keine GmbH.
Diese Fälle tragen ihre offene Frage im Feld `note`, sichtbar beim Öffnen des
Datensatzes.

**Der Import legt keine einzige Verkaufschance an.** Aus „war einmal Kunde"
folgt kein laufendes Geschäft.

### Wiederholbar, ohne Nachpflege zu zerstören

Drei Mechanismen zusammen:

| | |
|---|---|
| `import_key` | Identität hängt am Schlüssel, nicht am Namen |
| `import_log` | jeder Schritt läuft genau einmal — auch über Deploys hinweg |
| `coalesce(vorhanden, neu)` | ein zweiter Lauf ergänzt, überschreibt nie |

Ohne `import_log` wäre das eine Saatdatei, die bei jedem Deploy zuschlägt: ein
gelöschter Datensatz wäre wieder da, ein aufgehobener Ausschluss wieder
gesetzt.

## Ausschluss statt Löschung

Abnahmedatensätze verschwinden aus Listen und Zählungen — aber nicht aus der
Datenbank. Sie tragen einen `excluded_reason`, und der ist in beide Richtungen
umkehrbar.

`DELETE` gegen unscharfe Namen ist die unsichere Operation: Trifft es einmal
daneben, merkt es niemand, weil die Zeile weg ist. Verglichen wird deshalb der
**ganze Name**, kleingeschrieben und getrimmt — nie mit Platzhaltern.

> Der Fall, der das entscheidet: „Yilmaz Dachtechnik" ist ein
> Abnahmedatensatz, „Dr. Hüseyin Yilmaz" ein echter Prospect. Ein
> `ILIKE '%Yilmaz%'` hätte beide getroffen.

`scripts/check-bestand.mjs` bricht den Build, wenn ein Name auf beiden Listen
steht, ein Schlüssel doppelt ist, ein Kontakt auf eine unbekannte Organisation
zeigt oder jemand einen Betrag einträgt.

Zwei Gründe, die nicht dasselbe sind: ein Abnahmedatensatz ist Ausschuss; ein
Arbeitskontakt aus einem anderen Vorhaben ist ein echter Mensch mit einem
echten Anliegen — er gehört nur nicht in den creaDIG-Vertrieb.

---

## Offen

- **Abnahme gegen die echte Datenbank** — die 24 Punkte aus §19. Braucht ein
  Preview-Deployment; ein lokaler Zugang existiert nicht (`.env.local` trägt
  den Wert maskiert).
- **Geschätzter Wert** — Spalte da, Eingabe noch nicht. Bewusst zuletzt: eine
  Zahl, die niemand pflegt, ist schlimmer als keine.
- **Kontakt anlegen ohne Anfrage** — Kontakte entstehen heute aus Anfragen
  oder aus dem Bestand. Ein Formular „neuer Kontakt" fehlt.
