# Control Center · Vertrieb 1.0

> **Authority:** Spec · Stand 02.09.2026
> **Status:** gebaut, lokal geprüft. Die Abnahme gegen die echte Datenbank
> steht aus — sie braucht ein Preview-Deployment.

---

## Das Modell

Bis hierher war „Lead" ein Sammelbegriff für vier Dinge, die sich
unterschiedlich verhalten. Sie sind jetzt getrennt:

| Objekt | Was es ist | Ändert sich |
|---|---|---|
| **Anfrage** | ein Formulareingang, ein Beleg | nie |
| **Kontakt** | ein Mensch | selten |
| **Organisation** | ein Betrieb | selten |
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

## Offen

- **Abnahme gegen die echte Datenbank** — Verknüpfung, Deduplizierung,
  Anfrage→Chance, Chronik, Filter. Braucht ein Preview-Deployment.
- **Organisation bearbeiten** — Website, Ort, Notiz sind im Schema und in der
  Detailansicht sichtbar, aber noch nicht änderbar. Sie entstehen heute nur
  aus dem Betriebsnamen der Anfrage.
- **Geschätzter Wert** — Spalte da, Eingabe noch nicht. Bewusst zuletzt: eine
  Zahl, die niemand pflegt, ist schlimmer als keine.
