# creaDIG · Proof-Arten

> **Authority:** Canon · MP-C.1 · Stand 29.08.2026
> **Zweck:** Drei Arten von Beleg, die ständig verwechselt werden — und deren
> Verwechslung der schnellste Weg zu einer Aussage ist, die niemand decken kann.
> **Kurzfassung liegt auch in** `docs/ops/proof-inventory.md`; **maßgeblich ist
> diese Datei.**

---

## Die drei Arten

| Art | Was es zeigt | Wer freigeben muss | Was es NICHT belegt |
|---|---|---|---|
| **Eigenes Produkt** | Was creaDIG gebaut hat und selbst betreibt (meAI, fibero, CASSAMEA, meahv) | **Owner allein** | Dass ein Kunde damit arbeitet |
| **Kundenprojekt** | Was creaDIG für Dritte gebaut hat (NV SWISS, maqam) | **Kunde + Owner** | Welche Wirkung es hatte |
| **Kundenergebnis** | Was sich beim Kunden messbar geändert hat | **Kunde + belegbare Quelle** | — die höchste Stufe |

---

## Warum die Trennung wichtig ist

Sie steigt in der Beweiskraft **und** in der Freigabehürde. Genau deshalb ist
die Versuchung, eine Stufe zu überspringen, immer dort am größten, wo die
Freigabe am schwersten zu bekommen ist.

**Der typische Fehler:** Ein Screenshot des eigenen Produkts wird so gezeigt,
dass er wie ein Kundenprojekt wirkt („So arbeiten unsere Kunden"). Damit ist
aus einem Beleg, den man selbst decken kann, eine Behauptung über Dritte
geworden — und die deckt niemand.

**Die Regel:** Jeder Beleg trägt seine Art im Kontext. Wer eine Abbildung
sieht, muss ohne Nachfrage wissen, ob er auf ein eigenes Produkt oder auf
Kundenarbeit schaut.

---

## Was jede Art aussagen darf

### Eigenes Produkt

**Darf:** „Wir haben es gebaut." · „Wir betreiben es." · „So sieht es aus." ·
„Es läuft in unserem eigenen Alltag."

**Darf nicht:** „X Betriebe nutzen es." · „Kunden sparen damit Y Stunden." ·
Nutzerzahlen, Umsätze, Marktanteile — nichts, was nicht gemessen und belegt
ist.

**Sonderfall, der oft übersehen wird:** Ein eigenes Produkt, das mit echten
Kundendaten betrieben wird, ist als Screenshot **kein** eigener Beleg mehr —
auf dem Bild sind fremde Daten. Dafür gilt `docs/ops/demo-data-standard.md`.

### Kundenprojekt

**Darf:** „Wir haben das für X gebaut." · Name und Logo — **mit Freigabe.**

**Darf nicht:** Zahlen zur Wirkung ohne Quelle · Zitate, die niemand gesagt
hat · „unter anderem für …" als Andeutung einer längeren Liste.

**Freigabe heißt schriftlich.** Ein „ja klar" im Telefonat ist keine Freigabe,
die man in einem Jahr noch belegen kann. Im Code ist die Freigabe
`caseStudies[].approved: true` — dieses Flag ist kein Redaktionsstand, es ist
die Aussage „der Kunde hat zugestimmt".

### Kundenergebnis

**Darf:** Eine Zahl, wenn drei Dinge stehen: **was** gemessen wurde,
**wie lange**, und **womit verglichen**.

**Darf nicht:** „bis zu" · „deutlich" · „spürbar" · eine Zahl ohne
Vergleichszeitraum · eine Zahl, die der Kunde nicht bestätigt hat.

**Prüffrage:** Könnte der Kunde diese Zahl in einem Gespräch bestätigen, ohne
nachzurechnen? Wenn nein, ist es kein Ergebnis, sondern eine Schätzung.

---

## Freigabe-Matrix

| | Owner-OK | Kunden-OK schriftlich | Messquelle | Im Code |
|---|---|---|---|---|
| Eigenes Produkt zeigen | ✅ nötig | — | — | `PRODUCT_SCREENS`, `productWorks` |
| Kundenname / Logo | ✅ | ✅ | — | `clientWorks`, `CLIENT_LOGOS` |
| Fallstudie veröffentlichen | ✅ | ✅ | — | `caseStudies[].approved` |
| Zahl zur Wirkung | ✅ | ✅ | ✅ | `CaseMetric` |
| Zitat | ✅ | ✅ | — | `CaseVoice`, `reviews[]` |

**Fehlt eine Spalte, fehlt der Beleg.** Nicht „schwächer formulieren" —
weglassen.

---

## Ausführbar seit Gate 13 — `lib/proof.ts`

Bis zum 08.09.2026 stand diese Matrix nur hier. Im Code beantworteten **vier
Stellen** dieselbe Rechtsfrage verschieden:

| Stelle | Form | Problem |
|---|---|---|
| `Work.approvalOnFile?` | optionales `boolean` | fällt still auf `undefined` |
| `CaseStudy.approved` | `boolean` | ein Ja ohne Wer, Wann, Worüber |
| `Review.approved` | `boolean` | dasselbe noch einmal |
| `clientLogos` | **fest verdrahtet `true`** | und von niemandem gelesen |

Die vierte war der Schaden. `clientLogos` entsteht aus `clientWorks` per
`.map()` und stempelte jedem Eintrag `approved: true` auf — während in
denselben Datensätzen `approvalOnFile: false` stand. Das Feld wirkte nicht
einmal: `logo-wall.tsx` und `logo-strip.tsx` lasen `{ name, mark, region,
color, logoPath }`, `approved` war nie dabei.

**Ergebnis im Betrieb:** Drei Kundennamen standen öffentlich auf der Logowand,
während `/status` im selben Build meldete, die Freigabe fehle.

### Was jetzt gilt

**Es gibt kein `approved` mehr, das man setzen kann.** Es gibt `releases: []`
— jede Freigabe mit Person, Form, Datum, Umfang und **Fundstelle**. Ob etwas
erscheinen darf, wird daraus abgeleitet.

```ts
releases: [{
  by: { name: "…", role: "Geschäftsführung", company: "NV SWISS" },
  form: "e-mail",
  at: "2026-09-08",
  scopes: ["name", "logo"],
  reference: "Postfach info@creadig.de, Betreff „Freigabe Referenznennung“",
}]
```

Drei Regeln, die der Code erzwingt und dieses Dokument bisher nur beschrieb:

1. **Der Bedarf fällt aus dem Inhalt.** Wer eine Kennzahl ergänzt, verlangt
   damit automatisch `zahl`; wer ein Zitat ergänzt, `zitat`. Stünde der Bedarf
   daneben, könnte man ihn kleinschreiben.
2. **Die Form begrenzt den Umfang.** Eine selbst veröffentlichte
   Google-Bewertung trägt das **Zitat** — nicht das Logo und nicht eine
   Fallstudie. Sonst erzeugt die freundlichste Quelle die weitreichendste
   Erlaubnis.
3. **Ein Widerruf wirkt sofort**, nicht zum nächsten Redaktionsschluss. Der
   Eintrag bleibt stehen: Man muss später erklären können, warum damals
   veröffentlicht wurde.

**Das Freigabedokument selbst gehört nicht ins Repository.** `reference` sagt,
wo es liegt. Ein Repository wird geklont, gesichert und geteilt.

### Zwei Wächter

- **Quellsperre** — `genannteClientWorks` / `clientLogos` / `approvedCaseStudies`
  sind gefilterte Listen. Ein Filter kann man nicht vergessen zu lesen.
- **Freigabe-Gate** (`npm run build`) — liest das **gebaute HTML**. Damit ist
  egal, über welchen Weg ein Name hineinkommt.

Der zweite hat sich beim ersten Lauf sofort gelohnt: `clientWorks` erreichte
die Öffentlichkeit über **sieben** Wege, nicht über einen. Nachdem alle sieben
geschlossen waren, fand das Gate den achten — `workSlugs: ["nv-swiss","maqam"]`
wanderte über den RSC-Payload von `ServicePageBody` (`"use client"`) in den
Quelltext jeder Leistungsseite. Sichtbar war nichts; ausgeliefert war es
trotzdem.

Geprüft mit `npm run proof-drill` (38 Prüfungen).

---

## Wo das heute steht

| Art | Bestand |
|---|---|
| Eigenes Produkt | 4 Produkte, **0 echte Oberflächen** (`PRODUCT_SCREENS = {}`) |
| Kundenprojekt | 3 Arbeiten (NV SWISS, maqam, Bir Damla Hayır), **0 hinterlegte Freigaben** |
| Kundenergebnis | **0** — keine bestätigte Zahl, keine Bewertung (`reviews: []`) |

**Seit Gate 13 hat das eine sichtbare Folge:** Ohne hinterlegte Freigabe
erscheint kein Kundenname — nicht auf der Logowand, nicht in der Werkschau,
nicht im Referenzregister, nicht auf den Leistungsseiten, nicht in der
Sitemap. Die eigenen vier Produkte bleiben unberührt; sie hängen an niemandem
außer am Owner.

Das ist keine Panne und kein Rückbau, sondern der Zustand, den
`docs/ops/proof-inventory.md` seit dem 29.08.2026 meldet. Neu ist nur, dass
die Seite ihn jetzt auch zeigt.

**Was ihn beendet:** ein `releases`-Eintrag je Kunde, sobald die schriftliche
Freigabe vorliegt. Kein Code-Umbau — die Namen erscheinen beim nächsten Build.

Zählung und Fundstellen: `docs/ops/proof-inventory.md`.

---

## Die Reihenfolge, in der das zu schließen ist

1. **Eigenes Produkt** — hängt an niemandem außer am Owner. Schnellster
   ehrlicher Gewinn (MP-C.2: fibero).
2. **Kundenprojekt** — braucht eine Anfrage beim Kunden. Kann parallel laufen.
3. **Kundenergebnis** — braucht Messung. Zuletzt, oder nie.

Wer bei 3 anfängt, weil es am besten klingt, wartet am längsten und hat in der
Zwischenzeit nichts.
