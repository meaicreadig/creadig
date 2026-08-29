# creaDIG · Proof-Inventar

> **Authority:** Working Note (Bestandsaufnahme) · MP-C · Stand 29.08.2026
> **Status MP-C: MATERIAL-BLOCKED.** Dieses Dokument zählt, was fehlt. Es
> erfindet nichts, es schlägt keinen Ersatz vor, und es empfiehlt kein
> Stock-Material.
> **Gezählt wurde im Code, nicht aus dem Gedächtnis** — jede Zeile hat eine
> Fundstelle.

---

## Die Lückentabelle

| Slot | Soll | Ist | Wo im Code | Status |
|---|---|---|---|---|
| **Echte Produkt-Oberflächen** | 4 (meAI, fibero, CASSAMEA, meahv) | **0** | `PRODUCT_SCREENS = {}` · Quelle `public/works/products/` enthält nur `README.md` | 🔴 leer |
| Produkt-Kartenbild | 4 | **3** | `productWorks[].image` — meAI, fibero, CASSAMEA gesetzt; **meahv `null`** | 🟡 teils |
| **Kundenlogos** | ≥ 2 (NV SWISS, maqam) | **0** | `CLIENT_LOGOS = {}` · Quelle `public/brand/clients/` enthält nur `README.md` | 🔴 leer |
| Bild zur Kundenarbeit | 2 | **0** | `clientWorks[].image` — beide `null` | 🔴 leer |
| **Fallstudien freigegeben** | ≥ 2 | **0 von 2** | `caseStudies`: `nv-swiss` und `maqam`, beide `approved: false` | 🔴 gesperrt |
| **Bewertungen / Zitate** | ≥ 1 | **0** | `reviews: []` — Sterne-Gate im Build hält `AggregateRating` fern | 🔴 leer |
| Unternehmensfotos | 4 Slots (`buero`, `ico`, `arbeitsplatz`, `whiteboard`) | **0** | `COMPANY_PHOTOS = {}` · Quelle `public/images/unternehmen/` nur `README.md` | 🔴 leer |
| Ort-Foto | 1 | **1** | `public/images/ico-osnabrueck.jpg` | 🟢 vorhanden |
| Produkt-Reifegrad | 4 | **0 gesetzt** | `productWorlds[].maturity` — alle `null`; Badge rendert den Wert, sobald er da ist (MP-C.1) | 🔴 wartet auf Owner |
| Insights veröffentlicht | — | **1** | `lib/insights.ts`, ein Eintrag `published: true` | 🟢 vorhanden |
| **Handwerk-Referenz** | 1 | **0** | existiert nirgends | 🔴 **größte Lücke** |

---

## Die größte Lücke: der Handwerk-Beleg

`/branchen/handwerk` beschreibt den Alltag eines Handwerksbetriebs. Sie
beschreibt ihn gut genug, dass jemand sich wiedererkennt — und dann findet er
**nichts**, das zeigt, dass creaDIG so einen Betrieb schon einmal
umgebaut hat. Die beiden vorhandenen Kundenarbeiten sind Versicherung/Finanzen
(NV SWISS) und E-Commerce (maqam).

Das ist die teuerste offene Stelle im ganzen Trichter, und sie ist mit Code
nicht zu schließen. Zwei ehrliche Wege:

1. **Ein echter Handwerksbetrieb als Fallstudie** — braucht einen Kunden und
   dessen Freigabe.
2. **Der eigene Betrieb als Beleg** — fibero läuft im Glasfaser-Alltag, also
   in genau der Welt aus Auftrag, Dokumentation und Abrechnung, die die
   Landing beschreibt. Eine Fallstudie über das **eigene** Produkt braucht
   keine fremde Freigabe.

Weg 2 ist der einzige, der ohne Wartezeit geht. Er ist **nicht gebaut** —
die Entscheidung gehört dem Owner.

---

## Zweitgrößte Lücke: die Produkte zeigen sich nicht

`PRODUCT_SCREENS` ist für alle vier Produkte leer. Was heute auf den Karten
steht, sind **Mockups** — und die Seite sagt das auch:

> „Abbildungen sind illustrative Mockups, keine Screenshots."
> (`t.portfolio.mockupNote`)

Damit ist es ehrlich. Es ist aber auch das Gegenteil dessen, was ein
System-Haus zeigen sollte: Vier eigene Produkte, und keines ist zu sehen.
Ein echter Screenshot von meAI oder fibero — auch nur einer — würde mehr
tragen als jede weitere Seite Text.

**Vor dem Ablegen zu klären (Owner):** Was auf einem echten Screen zu sehen
ist, sind meist echte Daten. Kundennamen, Beträge, Adressen. Ein Screenshot
mit fremden Daten ist kein Beleg, sondern ein Datenschutzvorfall — es braucht
also entweder anonymisierte Ansichten oder eine Demo-Instanz mit erfundenen,
**als solche erkennbaren** Datensätzen. Das ist keine Erfindung von Beweisen,
sondern das Gegenteil: eine saubere Vorführung.

---

## Drop-in: wo das Material hingehört

Alle Slots sind vorbereitet. Datei ablegen, `npm run build` — die
`*.generated.ts` schreiben sich selbst neu, kein Code-Umbau.

| Was | Wohin | Erscheint dann |
|---|---|---|
| Produkt-Screens | `public/works/products/<slug>/*.png` (`meai`, `fibero`, `cassamea`, `meahv`) | Produktseite, echte Abbildungen statt Mockup |
| Kundenlogo | `public/brand/clients/<slug>.svg\|png\|webp` (`nv-swiss`, `maqam`) | Logowand |
| Unternehmensfotos | `public/images/unternehmen/<slot>.jpg` — `buero`, `ico`, `arbeitsplatz`, `whiteboard` | `/unternehmen` |
| Kundenarbeit-Bild | `public/works/<slug>.png` + `clientWorks[].image` setzen | Werkschau-Karte |
| Fallstudie freischalten | `caseStudies[].approved: true` | Fallstudien-Sektion (rendert heute gar nicht) |
| Bewertung | Eintrag in `reviews[]` mit `approved: true` | Bewertungs-Sektion **und** Sterne in den strukturierten Daten |
| Produkt-Reifegrad | `productWorlds[].maturity` = `live` \| `pilot` \| `private-beta` \| `in-development` | Produktseite (Anzeige folgt in MP-C, heute rendert nichts) |

---

## Empty States — Bestand

Die Seite behauptet an keiner Stelle etwas, wo Material fehlt. Geprüft:

| Ort | Verhalten bei fehlendem Material |
|---|---|
| Fallstudien | Sektion rendert **gar nicht** (`approvedCaseStudies` leer) |
| Bewertungen | Sektion rendert nicht · Build-Gate verhindert `AggregateRating` |
| Insights-Teaser | rendert nur mit veröffentlichten Einträgen |
| Unternehmensfotos | fehlender Slot = kein Bild, kein Platzhalter-Kasten |
| Produkt-Screens | Mockup mit sichtbarem Hinweis, dass es ein Mockup ist |
| SEO-Landings | `seoLandings: []` — keine Adresse, die es nicht gibt |
| Verarbeiter ohne AVV | trägt sichtbar den Vermerk „noch offen" |

**Das ist der Stand, der zu halten ist.** Kein Slot bekommt einen
Füll-Platzhalter, nur weil er leer aussieht.

---

## Nebenbefund — ungenutzte Dateien im öffentlichen Ordner

| Datei | Status |
|-------|--------|
| `public/works/bir-damla-hayir.png` | **DO NOT PUBLISH / UNVERIFIED** — nicht in `clientWorks`, öffentlich erreichbar |
| `public/works/rumis-maison.png` | **DO NOT PUBLISH / UNVERIFIED** — ditto |

Owner: löschen, nach `internal/archive` verschieben, oder bewusst freigeben.
Agent: **nicht** verdrahten, nicht als Case/Logo nutzen.

---

## Proof-Arten (nicht vermischen)

> Vollstaendig mit Freigabe-Matrix: `docs/ops/proof-kinds.md`.
> Wie eine Aufnahme entstehen muss: `docs/ops/demo-data-standard.md`.

| Art | Was | Freigabe |
|-----|-----|----------|
| **Eigenes Produkt** | creaDIG baut & betreibt (fibero, meAI, …) | Owner — keine Kundenfreigabe nötig |
| **Kundenprojekt** | Arbeit für Dritte | Kunde + Owner |
| **Kundenergebnis** | KPI / Wirkung | Kunde + messbare Quelle |

---

## Was dieses Dokument NICHT tut

- Es empfiehlt kein Stock-Material und keine KI-generierten Produktbilder.
- Es schlägt keine Formulierung vor, die eine fehlende Referenz umschreibt
  („zahlreiche Projekte", „unter anderem für …").
- Es setzt keinen `maturity`-Wert und kein `approved: true`.
- Es ergänzt keine Zahl, die niemand gemessen hat.

**MP-C bleibt MATERIAL-BLOCKED** für Client-Proof; C.1/C.2 dürfen Eigenes-Produkt + Spec vorbereiten, sobald Owner freigibt.
