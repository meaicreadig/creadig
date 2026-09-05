# creaDIG · Kundenkern

> **Authority:** Kanon · Gate 07 · 05.09.2026
> Gemessen gegen eine Wegwerf-Datenbank mit `npm run crm-drill` — nicht aus
> dem Quelltext geschlossen.
>
> **Produktion wurde nicht angefasst.** Kein Import, keine Änderung, kein Push.

---

## 1 · Sieben Dinge, die nicht dasselbe sind

| | Was es ist | Was es **nicht** bedeutet |
|---|---|---|
| **Kontakt** | ein Mensch | Kunde, Prospect, Vorgang, Werbeeinwilligung |
| **Organisation** | ein Betrieb | Person, Standort, Vorgang |
| **Standort** | eine Adresse eines Betriebs | eigener Betrieb, eigener Kunde |
| **Anfrage** | ein Eingang, ein Beleg | Kunde, Prospect, Vorgang |
| **Verkaufschance** | ein laufendes Geschäft | folgt aus keinem der oberen |
| **Lebenszyklus** | Kundengeschichte des Betriebs | laufender Auftrag |
| **Nähe** | Beziehung zu einem Menschen | Verkaufsabsicht |

### Die Datenbank erzwingt die Trennung

Das Modell trennt die beiden Dimensionen **auf verschiedenen Tabellen** und
mit verschiedenen Wertemengen:

```
organisations.lifecycle    unbekannt · prospect · kunde · ehemaliger-kunde
contacts.relationship      unbekannt · bekannt · warm · eng
```

Beides sind Prüfbedingungen, keine Konvention. Der Versuch, `kunde` auf einen
**Menschen** zu schreiben, scheitert an `contacts_relationship_check` — im
Probelauf tatsächlich passiert und der Grund, warum dieser Absatz hier steht.

Das ist besser als eine gemeinsame Liste: „Kunde" ist eine Eigenschaft des
Betriebs, „eng" eine des Verhältnisses zu einer Person. Ein Mensch kann uns
nahestehen, ohne dass sein Betrieb je Kunde war — und umgekehrt.

`ehemaliger-kunde` gibt es ausdrücklich. Kundengeschichte verfällt nicht,
und sie ist auch kein laufendes Geschäft.

---

## 2 · Eine Verkaufschance entsteht nur durch einen Menschen

Der Vorgangs-Aufbau trägt die Bedingung

```sql
WHERE (l.sales_status <> 'new' OR l.next_action IS NOT NULL)
```

Eine frische Anfrage erfüllt keine der beiden Hälften.

**Gemessen** (`crm-drill` Abschnitte 3, 7, 8):

| Nach … | Vorgänge |
|---|---|
| vollem Bestandsimport (24 Organisationen, 19 davon Kundengeschichte) | **0** |
| Import der Eigentümer-Kontakte | **0** |
| einer Anfrage, die auf einen bestehenden Kontakt trifft | **0** |

Eine Pipeline, die beim ersten Öffnen 19 Vorgänge zeigt, an denen niemand
arbeitet, ist ab dem ersten Tag unbrauchbar.

---

## 3 · Vegitat — der Grund, warum es Standorte gibt

```
Organisationen namens Vegitat: 1
  Standorte:                   4
    · Basel Klybeck        — Basel
    · Basel St. Johann     — Basel
    · Luzern Bleicherstr.  — Luzern
    · Zürich Langstrasse   — Zürich
```

Vier Adressen, ein Kunde. Vier Organisationen daraus zu machen hieße, jede
Zählung ab heute um drei zu verfälschen — und Gate 19 später eine Geografie
zu geben, die vier Kunden zeigt, wo einer ist.

Dasselbe gilt für **Die Ostfriesische**: Die Geschäftsstelle Norden ist ein
Standort, keine eigene Gesellschaft.

---

## 4 · Import: Trockenlauf ist die Voreinstellung

`scripts/crm-import.mjs` zeigt zuerst und schreibt erst auf Verlangen.

```
ANLEGEN  ERGAENZEN  UNVERAENDERT  KONFLIKT  AUSGESCHLOSSEN
```

**Bricht ab, wenn ein Konflikt offen ist** — auch mit `--apply`. Ein Import,
der über einen Zweifel hinwegschreibt, ist schlimmer als keiner.

**Legt keine Verkaufschance an.** Das ist keine Auslassung, das ist der Punkt.

**Ergänzen heißt nur leere Felder füllen.** Was ein Mensch eingetragen hat,
gewinnt gegen die Datei — dieselbe `coalesce`-Regel wie im Bestandsimport.
Im Probelauf geprüft: Ort und Rolle von Hand geändert, Import erneut gefahren,
beide Werte standen unverändert da.

### Die Daten liegen nicht im Repository

Das Skript liest eine Datei **außerhalb** des Repos. `lib/vertrieb-bestand.ts`
trägt Organisationen und Rollen — **keine Rufnummern, keine Privatadressen,
keine persönlichen E-Mail-Adressen**. Ein Repository wird geklont, gesichert,
durchsucht und irgendwann geteilt; eine Mobilnummer, die einmal in der
Historie steht, steht dort für immer.

---

## 5 · Dubletten: melden statt raten

Zwei Fehler sind möglich, und beide kosten. **Falsch zusammenführen** macht
aus zwei Menschen einen. **Falsch trennen** verteilt eine Historie auf zwei
Akten, die niemand mehr zusammenbringt. Deshalb führt nur ein eindeutiger
Beleg zusammen; alles andere wird gemeldet.

| Fall | Verhalten | Gemessen |
|---|---|---|
| gleiche Adresse, gleicher Name | zusammen | ERGAENZEN |
| gleiche Adresse, anderer Name | **melden** | KONFLIKT |
| gleicher Name, andere Adresse | **melden** | KONFLIKT |
| gleiche Nummer, gleicher Name | zusammen | UNVERAENDERT |
| gleiche Nummer, anderer Name | **melden** (gemeinsames Büro?) | KONFLIKT |
| gleicher Nachname, andere Person | getrennt | ANLEGEN |
| „Mueller" ↔ „Müller" | **melden** | KONFLIKT |
| gleicher Betrieb, andere Stadt | ein Betrieb | UNVERAENDERT |
| nur Telefon / nur E-Mail | angelegt, Lücke benannt | ANLEGEN |
| Testname, `@beispiel.invalid` | ausgeschlossen | AUSGESCHLOSSEN |

**Rufnummern** werden verglichen, nicht buchstabiert: `+49 171 0000000` und
`0171 0000000` sind dieselbe Nummer (auch `+41` für den Schweizer Teil des
Bestands).

**Namen** werden für den Vergleich gefaltet — erst ä/ö/ü/ß, dann ae/oe/ue/ss,
damit „Müller" und „Mueller" dieselbe Form ergeben. Das faltet gelegentlich
zu viel; hingenommen, weil die Faltung **nichts zusammenführt, sondern nur
meldet**. Ein Fehlalarm kostet einen Blick.

---

## 6 · Ausschlüsse treffen genau

`Yilmaz Dachtechnik` ist Testausschuss. `Dr. Hüseyin Yilmaz` ist ein echter
Prospect. Ein unscharfer Vergleich würde beide treffen.

**Gemessen:** nach vollem Aufbau steht Dr. Hüseyin Yilmaz **aktiv** in den
Kontakten, „Yilmaz Dachtechnik" gar nicht im Bestand. Ausschluss läuft über
**exakte** Namensgleichheit und die Adressendung `@beispiel.invalid`.

---

## 7 · Angebotsreife ist nicht überall dasselbe

Siehe `qualification-canon.md`. Kurz: Ein Festpreis-Angebot braucht das, was
**dieses** Angebot braucht. Nur das **Systemprojekt** braucht die fünf
Treiber. Ein Handwerksbetrieb, der eine Website will, ist angebotsreif, ohne
je einen Treiber zu beantworten.

---

## 8 · Telefon ist nicht mehr Pflicht — Gate-07-Belegkorrektur

Die Rufnummer war Pflichtfeld im Terminassistenten. Gate 07 hat den Beleg
gesucht und keinen gefunden:

- das Gespräch ist **„20 Minuten, per Video"**
- die Eingangsbestätigung geht **per E-Mail**
- die Zusage lautet „Wir melden uns innerhalb von zwei Werktagen" — ohne Kanal
- `docs/ops/sop-lead-handling.md` kennt keinen Rückruf als Schritt

Der einzige zugesagte Rückruf im Haus steht im Managed-Betrieb-Umfang — für
Kunden mit Vertrag, nicht für eine Terminanfrage.

Damit war die Pflicht nur noch damit begründet, dass eine Nummer im Vertrieb
angenehm ist. Das trägt nach dem Gate-04-Grundsatz der Datensparsamkeit
nicht. **Das Feld bleibt** — wer lieber angerufen wird, trägt es ein. Was
fällt, ist der Zwang.

Gate 06 bleibt geschlossen; dies ist eine Belegkorrektur, keine Neuöffnung.

---

## 9 · Geo-Grundlage für Gate 19 — Daten, keine Karte

Abfragbar, ohne Schemaänderung:

```sql
SELECT o.name, o.city, o.country, o.lifecycle,
       l.label, l.city, l.postal_code
  FROM organisations o
  LEFT JOIN locations l ON l.organisation_id = o.id;
```

Damit lassen sich später beantworten: wo Kunden sitzen, wo Anfragen
herkommen, wie sich Nähe verteilt — **je Standort, nicht je Betrieb**, was
bei Vegitat den Unterschied zwischen einem Punkt und vier Punkten ausmacht.

**Was nicht existiert und nicht erfunden wurde:** Koordinaten. Kein
Geocoding, kein `lat`/`lng`, keine Karte, keine Regionsbewertung. Wo eine
Adresse fehlt, steht `NULL` — und `NULL` ist die richtige Antwort auf eine
unbekannte Adresse.

---

## 10 · Übergaben

| Gate | Bekommt | Baut hier **nicht** |
|---|---|---|
| 08 | saubere Anfrage, Kontakt, Organisation, Lebenszyklus, Nähe, die Vorgangsgrenze, zwei Angebotsreife-Regeln | Pipeline |
| 09 | Prospect-Grundlage, Herkunft, echte Kontakte ohne erfundene Chancen | Prospecting |
| 10 | Kontakte **ohne** Werbeeinwilligung — Anfrage und Nähe erzeugen keine | Zielgruppen |
| 12 | „ist Kunde" — **nicht** „darf genannt werden" | Freigaben |
| 16 | Kundengeschichte ohne erfundene Umsätze | Wirtschaftlichkeit |
| 19 | Organisation + Standort + Ort + Land, `NULL` wo unbekannt | Karte |
