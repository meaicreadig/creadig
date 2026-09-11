# Phase 2 — Commercial Offer System

**Stand:** 11.09.2026 · **Baseline:** `88f1b06` · **Primary Home:** `/leistungen#kaufwege`

## Der Befund

Das kommerzielle System von creaDIG war nicht unklar. Es war **unveröffentlicht**.

`docs/sales/offer-canon.md` (Gate 05, 05.09.2026) und
`docs/sales/qualification-canon.md` (Gate 06) beschreiben seit Wochen
vollständig, was creaDIG verkauft, wie ein Preis zustande kommt, wo kostenlos
aufhört, wann ein Systemgespräch der richtige Schritt ist und welche fünf
Treiber den Umfang schneiden.

Auf der Website standen davon die **Ergebnisse**: Beträge in der Preistabelle,
die fünf Treiber daneben, der Pilotpreis in einer Fußnote. Die Regel darüber —
dass es **drei grundverschiedene Arten** gibt, hier zu kaufen — stand nirgends.

Ohne diese Auskunft rechnet jemand mit einem Betriebsproblem still hoch:
*„3.900 € für eine Seite, also 40.000 für mein System."* Oder er liest 149 €
und hält das für den Betrieb seiner Warenwirtschaft.

**Phase 2 hat deshalb nichts erfunden. Sie hat veröffentlicht.**

## Die drei Kaufwege

`offer-canon.md` §8 kennt **fünf Preistypen** — das ist die Innensicht: Wie
kommt eine Zahl zustande? Ein Käufer stellt eine andere Frage: *Was passiert
mit mir, bis ich weiß, was es kostet?* Darauf gibt es genau drei Antworten.

| | Kaufweg | Wann | Wie der Preis entsteht |
|---|---|---|---|
| 01 | **Der Umfang steht vorher fest** | abgegrenztes Stück Arbeit | Die Zahl steht auf der Seite |
| 02 | **Der Umfang entsteht zuerst** | mehrere Abläufe, Rollen, vorhandene Programme | Erst Zuschnitt, dann Festpreis |
| 03 | **Es ist ein laufender Zustand** | etwas ist gebaut und muss weiterlaufen | Pro Monat, gedeckelt, monatlich kündbar |

## Die Angebotsmatrix

Quelle im Code: `lib/kaufwege.ts`. **Jeder Betrag stammt aus `packages` bzw.
`retainer` in `lib/site-data.ts`** — in `kaufwege.ts` wird keine Zahl getippt
(D-18), und `scripts/check-angebotssystem.mjs` weist das bei jedem Build nach.

| Angebot | Kaufweg | Preismodell | Öffentlicher Preis | Nicht enthalten | Nächster Schritt | Kanon |
|---|---|---|---:|---|---|---|
| Website-Paket | fester Umfang | Festpreis | **2.400 €** (Regel 3.900 €) | Shop, Buchung, Warenwirtschaft, mehrere Standorte | `/leistungen#pakete` | §3, §4 |
| Barrierefreiheits-Prüfung | fester Umfang | Festpreis | **1.500 €** | Konformitätszusage, Zertifizierung | `/leistungen/barrierefreiheit-website` | §5 |
| Behebung | Umfang zuerst | nach Zuschnitt | — | Zahl erst nach der Prüfung | dieselbe Seite | §5 |
| **Systemprojekt** | Umfang zuerst | nach Zuschnitt | — | kein Listenpreis, keine Spanne | `/termin?art=systemgespraech` | §7 · qual. §4 |
| Laufende Betreuung | laufend | monatlich | **149 €** | Rufbereitschaft, Wochenenddienst, Reaktionszeit in Stunden | `/betrieb` | §6 |
| **Betrieb einer Individualanwendung** | laufend | nach Zuschnitt | — | **heute kein öffentlicher Preis, keine Stufe darüber** | `/termin?art=systemgespraech` | §6 |

## Die beiden Antworten, die vorher fehlten

### 149 € ist Website-Betreuung — und nichts darüber

**Was enthalten ist** (aus `retainer.includes`): Hosting und Sicherheitsupdates,
bis zu zwei Inhaltsänderungen im Monat, Google-Unternehmensprofil,
Barrierefreiheits-Lauf bei jeder Änderung, Rückruf am nächsten Werktag.

**Was es nicht ist:** der Betrieb einer Individualanwendung. Dafür steht jetzt
ein eigener Eintrag mit einer Auskunft, die kein Preis ist:

> Dafür gibt es heute keinen öffentlichen Preis und keine Betriebsstufe über
> der laufenden Betreuung. Reaktionszeit, Erreichbarkeit und Vertretung sind
> nicht zugesagt — solange das so ist, verkaufen wir darüber nichts.

Das ist **kein Ausweichen**, sondern exakt der Beschluss aus `offer-canon.md`
§6: Die Staffel (Operate, Business, Mission Critical) ist Struktur, keine
Preisliste, und wird nicht verkauft, solange diese drei Fragen offen sind.
Bisher stand dieser Beschluss nur intern — ein Interessent erfuhr ihn nicht.

**Kein Betrag wurde geändert.**

### Sie brauchen vielleicht gar kein eigenes System

Vier Sätze, von denen **drei vom Systemprojekt wegführen** — sie stehen als
erster Block der Sektion, nicht als höfliche Fußnote am Ende:

1. Löst eine vorhandene Standardsoftware Ihr Problem sauber, ist das die
   günstigere Antwort. **Dann bauen wir nichts.**
2. Trifft keiner der fünf Treiber zu, ist es kein Systemprojekt — dann reicht
   das Website-Paket.
3. Klemmt es nur an der Übergabe zwischen vorhandenen Programmen, ist das eine
   **Anbindung**: Teil eines Systemprojekts, aber der kleinere Teil.
4. Treffen mehrere Treiber zu, ist Systemarchitektur die Frage.

Satz 2 und 4 stehen wörtlich so in `offer-canon.md` §7. Satz 1 und 3 sind
Ableitungen in derselben Richtung: Sie **verkleinern** den Anspruch. Keiner
vergrößert ihn.

## Was ausdrücklich NICHT gemacht wurde

| | Warum |
|---|---|
| Keine Mindestprojektsumme | `offer-canon.md` §7 leitet eine Untergrenze ab **und entscheidet, sie nicht öffentlich auszustellen**. Eine Kanon-Entscheidung wird nicht per Überschrift gekippt. Maschinell gesichert (Regel 1.4). |
| Keine Betriebsstufen über 149 € | Kanon §6 — nicht verkaufen, solange Reaktionszeit, Erreichbarkeit und Vertretung offen sind |
| Keine Preisänderung | Die Menge der öffentlichen Beträge ist als Invariante im Gate hinterlegt: `[149, 1500, 2400, 3900]` |
| Keine künstliche Verknappung beim Pilotpreis | Die Bedingung ist nachprüfbar (erster Betrieb in einem Gewerk) und läuft von selbst aus. Kein Zähler, keine Plätze, kein Ablaufdatum |
| Kein neuer Servicekatalog | Sechs Angebote — dieselben wie vorher. Neu ist die **Ordnung**, nicht die Menge |
| Startseite unverändert | Sie trägt weiterhin nur die drei *Arten* anzufangen (D-19) |

## Komposition

Eine **Tabelle**, kein Kachelraster. Die naheliegende Umsetzung wären drei
Kaufweg-Karten plus sechs Angebotskarten gewesen — neun Kacheln für eine
Auskunft aus drei Zeilen. Ein Käufer *vergleicht* hier: dieselbe Frage an
mehreren Stellen nebeneinander. Das ist eine Tabelle, auch wenn sie auf
390 px zu gestapelten Blöcken zerfällt.

`grenze` steht **gleichwertig** neben `ergebnis` und nicht kleiner darunter:
Im Streitfall gilt das größere Versprechen, also muss das kleinere genauso gut
lesbar sein.

## Der richtige Aufruf zur richtigen Kaufreife

Im ersten Durchgang trug jedes der sechs Angebote „Ansehen" — auch das
Systemprojekt, das auf eine Terminanfrage führt. Ein Aufruf, der nicht sagt,
was als Nächstes passiert, macht aus sechs Kaufwegen wieder einen Katalog.

| Angebot | Aufruf |
|---|---|
| Website-Paket | Paket und Preis ansehen |
| Barrierefreiheits-Prüfung | Prüfung ansehen |
| Behebung | Erst prüfen lassen |
| Systemprojekt | Systemgespräch anfragen |
| Laufende Betreuung | Umfang im Detail |
| Betrieb einer Individualanwendung | Im Gespräch klären |

## Der Käufertest

| Frage | Antwort auf der Seite |
|---|---|
| Was bekomme ich für 149 €? | Der laufende Betrieb einer Seite/eines Systems, das wir gebaut haben — gedeckelt, monatlich kündbar. Umfang vollständig unter „Managed Betrieb" |
| Ist 149 € der Betrieb meiner Individualanwendung? | **Nein.** Eigener Eintrag, eigener Weg, heute kein Preis |
| Wann passt ein Website-Paket? | Wenn keiner der fünf Treiber zutrifft |
| Wann brauche ich eine Anbindung? | Wenn es nur an der Übergabe zwischen vorhandenen Programmen klemmt |
| Wann Custom? | Wenn mehrere Treiber zutreffen |
| Wie beginnt ein Systemprojekt? | Systemgespräch, 45 Minuten, kostenlos — Umfang zuerst |
| Was kostet ein Systemprojekt? | Nach Zuschnitt. Der Grund steht daneben |
| Was ist mein nächster Schritt? | Je Angebot ein eigener Aufruf |

## Nachgewiesen durch

`scripts/check-angebotssystem.mjs`, Teil 1 — fünf Regeln: jeder Betrag aus
site-data, Betragsart passt zum Betrag, vier Sprachen mit Pflicht-`grenze` und
Aufruf, keine Mindestsumme im gebauten HTML, Preis-Invariante.
