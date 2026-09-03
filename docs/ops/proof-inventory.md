# creaDIG · Proof-Inventar

> **Authority:** Working Note (Bestandsaufnahme) · MP-C · Stand 29.08.2026 (MP-C.3)
> **Status MP-C:** Material für Kundenlogos/Bilder **da** · Fallstudien weiter
> **gesperrt** (`approved: false`) · Produkt-Screens weiter **MATERIAL-BLOCKED**.
> **Gezählt wurde im Code, nicht aus dem Gedächtnis.**

---

## Die Lückentabelle

| Slot | Soll | Ist | Wo im Code | Status |
|---|---|---|---|---|
| **Echte Produkt-Oberflächen** | 4 (meAI, fibero, CASSAMEA, meahv) | **0** | `PRODUCT_SCREENS = {}` · `public/works/products/` nur README | 🔴 leer |
| Produkt-Kartenbild | 4 | **4** — meAI · fibero · CASSAMEA · meahv = `product-photo` | `productWorks[].image` | 🟢 |
| Kundenlogos | ≥ 2 | **3** — nv-swiss · maqam · bir-damla-hayir | `CLIENT_LOGOS` · `public/brand/clients/` | 🟢 |
| Bild zur Kundenarbeit | ≥ 2 | **3** — `nv-swiss.jpg` · `maqam.jpg` · `bir-damla-hayir.jpg` · `imageProof: customer-photo` | `clientWorks[].image` | 🟢 |
| **Fallstudien freigegeben** | ≥ 2 | **0 von 3** | `caseStudies`: alle `approved: false` · Kurzformat `card` vorbereitet | 🔴 gesperrt |
| Case-Kurzformat | 3 | **3 Gerüste** | `card`: Projekt · Kategorie · Leistungen — NV services belegt; maqam/BDH `null` | 🟡 wartet Freigabe |
| **Bewertungen / Zitate** | ≥ 1 | **0** | `reviews: []` | 🔴 leer |
| Unternehmensfotos | 4 Slots | **0** | `COMPANY_PHOTOS = {}` | 🔴 leer |
| Ort-Foto | 1 | **1** | `public/images/ico-osnabrueck.jpg` | 🟢 |
| Produkt-Reifegrad | 4 | **0 gesetzt** | `maturity` alle `null` | 🔴 Owner |
| Insights veröffentlicht | — | **1** | `lib/insights.ts` | 🟢 |
| **Handwerk-Referenz** | 1 | **0** | existiert nirgends | 🔴 größte Lücke |

---

## MP-C.3 — was erledigt ist / was fehlt

**Erledigt (Code):**

- `imageProof` trennt Mockup · product-photo · customer-photo — Fussnoten in Portfolio / Selected Work / Arbeit-Detail
- meAI-Kartenbild Owner 29.08.: `/works/meai.jpg` (echte Oberfläche, Demodaten)
- CASSAMEA-Kartenbild Owner 29.08.: `/works/cassamea.jpg` (POS, echte Oberfläche)
- fibero-Kartenbild Owner 29.08.: `/works/fibero.jpg` (Feld + Map Center)
- meahv-Kartenbild Owner 30.08.: `/works/meahv.jpg` (Laptop, echte Oberfläche)
- `CaseCard` (Projekt · Kategorie · Leistungen) an `CaseStudy` + Render in `CaseStudyBody`
- Kundenbilder an Case-Gerüsten verdrahtet (sichtbar erst bei `approved: true`)
- Guide: `docs/ops/case-format.md`

**Blockiert (Owner):**

- Schriftliche Freigabe + Freigabesatz → dann erst `approved: true`
- maqam / Bir Damla Hayır: Leistungen (`card.services` / `built`)
- Keine KPI ohne Quelle

**fibero-Screens:** Drop-in `public/works/products/fibero/*.png` + `npm run build` — kein neuer Code.

---

## Die größte Lücke: der Handwerk-Beleg

`/branchen/handwerk` beschreibt den Alltag — die vorhandenen Kundenarbeiten sind
Versicherung/Finanzen (NV SWISS), E-Commerce (maqam) und Nonprofit (Bir Damla Hayır).
Kein Handwerksbetrieb. Zwei ehrliche Wege: fremde Fallstudie mit Freigabe, oder
eigenes Produkt fibero als Beleg (Owner-Entscheidung).

---

## Zweitgrößte Lücke: die Produkte zeigen sich nicht

`PRODUCT_SCREENS` leer. Produktkarten tragen `imageProof: mockup` und den Hinweis:

> „Produktkarten: illustrative Mockups, keine Screenshots."

Kundenwerk trägt getrennt:

> „Kundenbilder zeigen die echte Oberfläche — keine Mockups."

---

## Drop-in: wo das Material hingehört

| Was | Wohin | Erscheint dann |
|---|---|---|
| Produkt-Screens | `public/works/products/<slug>/*.png` | Interface-Sektion „Echte Oberfläche, Demodaten.“ |
| Kundenlogo | `public/brand/clients/<slug>.png` | Logowand |
| Kundenarbeit-Bild | `public/works/<slug>.jpg` + `image` + `imageProof: customer-photo` | Werkschau / Arbeit-Detail |
| Fallstudie freischalten | Freigabe + Satz → `approved: true` | Fallstudien-Sektion |
| Case-Leistungen | `caseStudies[].card.services` / `clientWorks[].built` | Kurzformat |
| Bewertung | `reviews[]` mit `approved: true` | Bewertungs-Sektion + Sterne-Gate |

---

## Empty States — Bestand

| Ort | Verhalten |
|---|---|
| Fallstudien | Sektion rendert **gar nicht** (`approvedCaseStudies` leer) |
| Bewertungen | Sektion rendert nicht · Build-Gate |
| Produkt-Screens | Mockup-Hinweis (nur Produkte) |
| Kundenbilder | customer-photo-Hinweis — **kein** Mockup-Label |

---

## Nebenbefund — öffentliche Dateien

| Datei | Status |
|-------|--------|
| `public/works/bir-damla-hayir.jpg` | Owner 29.08. — in `clientWorks` · Logo vorhanden |
| `public/works/rumis-maison.png` | **DO NOT PUBLISH / UNVERIFIED** — nicht verdrahten |

---

## Proof-Arten

Vollständig: `docs/ops/proof-kinds.md` · Case-Fill: `docs/ops/case-format.md`

| Art | Freigabe |
|-----|----------|
| Eigenes Produkt | Owner |
| Kundenprojekt | Kunde + Owner |
| Kundenergebnis / KPI | Kunde + messbare Quelle |

**Agent setzt kein `approved: true` und keine Zahl ohne Quelle.**
