# Owner-Warteschlange

> **Proof Operations P2 · 11.09.2026** · sortiert nach **Proof-Lane**, dann Nähe.  
> Abgeleitet aus `naechsteSchritte()` in `lib/beleg-betrieb.ts`. Dieselbe
> Reihenfolge steht live unter **`/admin/beleg`**.

| # | Lane | Handlung | Gibt frei | Zeit? | Wirkung |
|---|---|---|---|---|---|
| **1** | **Market Proof** | **Candidate `nv-swiss` bestätigen und Freigabe holen** — Name + Fallstudie + Screenshot (Logo optional); Fundstelle später in `releases[]` (G18) | Erster öffentlicher Kunden-Lieferfall | Nein | `/arbeiten` kehrt nach Freigabe+G18 ohne Feature-Arbeit in Index zurück |
| **2** | **Internal Measured** | **Erste Messprobe fibero** — `npm run messprobe -- --kennzahl fibero-ungeprueft --seite ausgang --wert … --faelle … --quelle system-zaehlung --von "Emin" --schreiben` | Startet 28-Tage-Uhr für eigenen Betriebsbeleg | **Ja — 28 Tage** | Kein Market Proof. Später echte Zahl für Aufwandsrechner |
| **3** | Delivery | **Kapazität Projekte** nennen (parallele größere Deliveries, die Qualität halten) | `kapazitaet-projekte` | Nein | `/unternehmen` schließt benannte Lücke |
| **4** | Delivery | **Vertretung** benennen (Person/Funktion, Zugang, Grenzen) | `vertretung-ausfall` | Nein | dieselbe Stelle |
| **5** | Asset | **CASSAMEA: sichere Aufnahme** | Asset `freigegeben` | Nein | zeigbare Oberfläche |
| **6** | Asset | **meahv: sichere Aufnahme** | Asset `freigegeben` | Nein | ebenso |
| **7** | Compliance | **Drei AVV** (Vercel, Resend, Neon) bestätigen | `avv-*` | Nein | `/datenschutz` ohne offene Kennzeichnung |
| **8** | Delivery | **Betriebskapazität** nennen | `kapazitaet-betrieb` | Nein | Betriebsstufe über Betreuung verkaufbar |

## Warum Freigabe vor Messprobe steht (P2)

Die Messprobe startet eine Uhr — und erzeugt **Internal Measured Proof**.  
Die Kundenfreigabe erzeugt den **ersten Market Proof**.  
Das sind zwei Lanes. Market Proof hat Vorrang, solange noch kein öffentlicher Kundenbeleg existiert. Die Messprobe bleibt parallel und zeitkritisch.

## Was ausdrücklich **nicht** in dieser Liste steht

Keine UI-Aufgabe, keine Metadatenfrage, keine Seitenlänge, keine
CTA-Position. **material FIXABLE_NOW = 0.** Was hier steht, kann Code nicht lösen.
