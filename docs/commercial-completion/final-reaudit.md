# Unabhängiger Commercial Re-Audit — Abschluss

**Stand:** 11.09.2026 · gelesen an der gerenderten Seite, nicht am Quelltext

## Die Befunde vom 11.09., einzeln nachgeprüft

| # | Befund des Audits | Stand | Klasse |
|---|---|---|---|
| 1 | Mobiler Hero-CTA unter der Falz | **behoben** — 360 px: y 820 → **678**; 390 px: 811 → **649** | CLOSED_VERIFIED |
| 2 | Hero kurzzeitig leer | **behoben an der Ursache** — H1 0 % → **92 % ab dem ersten Frame**, bei allen vier Navigationsarten | CLOSED_VERIFIED |
| 3 | `/leistungen` zu lang | **materiell reduziert** — Kaufwege −31 % Wörter, −36 % Höhe; Rest hängt an G18 | CLOSED_VERIFIED / G18_BLOCKED |
| 4 | 20-Minuten-Weg zu schwer | **behoben** — 8 Felder / 3 Pflicht → **6 / 2** | CLOSED_VERIFIED |
| 5 | 45-Minuten-Weg | **bewusst schwerer** — 13 Felder / 3 Pflicht, mit den fünf Treibern | CLOSED_VERIFIED |
| 6 | `95 %` auf dem letzten Schritt | **entfernt** — „Schritt X von 4", maschinell gesperrt | CLOSED_VERIFIED |
| 7 | Produkt-Interesse-Reibung | **geprüft** — 3 Felder, kein Konto-/Kauf-/Testversprechen | CLOSED_VERIFIED |
| 8 | Visuelle Gleichförmigkeit | **geprüft**: Leistungsseiten und Insight sind strukturiert, keine Textwüste. Echte Fotos fehlen | kein Mangel / OWNER_ASSET |
| 9 | Leeres `/arbeiten` | **bewusste Strategie** — `noindex, follow`, datengesteuert | CLOSED_VERIFIED |
| 10 | `/arbeiten` Indexierung | siehe 9; Sitemap und interne Verweise mitgezogen | CLOSED_VERIFIED |
| 11 | Alte Kundennamen in Suchtreffern | **null** im Code, im Bau und in 131 gecrawlten Routen | EXTERNAL_SEARCH |
| 12 | Zeitzone | Phase-1-Stand gehalten, jetzt mit Regressionssperre | CLOSED_VERIFIED |
| 13 | WCAG-Prüfumfang | 132/132, Umfang wahrheitsgemäß benannt | CLOSED_VERIFIED |
| 14 | Kommerzieller Beleg | Offer System, fibero-Betriebsbeleg, Aufwandsrechner (Phase 2+3) | CLOSED_VERIFIED |

## Neu gefunden und in diesem Lauf behoben

| Befund | Prio | Wie gefunden |
|---|---|---|
| `/kontakt` bot **kein Systemgespräch** an — „Termin vereinbaren" führte in den kurzen Weg | P1 | Lesen als Käufer mit Betriebsproblem |
| `/kontakt` bot das 20-Minuten-Gespräch nach der neuen Hierarchie **zweimal** an | P1 | Lesen der gerenderten Seite nach dem eigenen Eingriff |
| Einwilligungs-Kästchen ohne `required` — Pflicht in der Prüfung, nicht im Markup | P2 | Konversions-Probelauf |
| `ergebnis` an sechs Angeboten wiederholte, was an drei anderen Stellen derselben Seite steht | P2 | Abschnittsmessung |
| Kaufweg-Spalten „Wann" + „Preis" waren ein Satz in zwei Blöcken | P3 | Messung auf 390 px |

## Die Tests, die das Wiederkommen verhindern

| Lauf | Prüfungen | Hält fest |
|---|---:|---|
| `konversion-drill` | 22 | Der kurze Weg bleibt kürzer; kein Prozent im Fortschritt; kein Lead-Gate; beide Gespräche auf `/kontakt` |
| `erlebnis-drill` | 37 | H1 ab dem ersten Frame; Handlung im ersten Fenster; kein Querlauf bis 320 px; sechs Belege für erhaltene Kauflogik; Wortobergrenze |
| `check-seo` | 7 Regeln | Indexstrategie folgt der Freigabelage — in **beide** Richtungen |
| `check-angebotssystem` | — | Kein erfundener Preis, kein geliehener Kundenfall, kein vorbelegtes Ergebnis |
| `check-commercial-truth` | 7 Regeln | Phase-1-Wahrheit |
| `wirtschaftlichkeit-drill` · `rechner-drill` | 45 · 76 | Die Rechnung und ihre Oberfläche |
| `a11y` | 132 Durchläufe | WCAG 2.1 AA, maschinell |

## Käufer-Urteil

| Persona | Würde Kontakt aufnehmen? | Was noch blockiert |
|---|---|---|
| **Kleinunternehmer** | **Ja** — Festpreis, Grenzen, 20-Minuten-Weg mit zwei Pflichtfeldern | kein vergleichbarer Kundenfall |
| **Wachsender Betrieb** | **Ja** — Fit-Frage sagt, wann er uns *nicht* braucht; Rechner beziffert den eigenen Aufwand | kein Integrationsbeispiel mit Namen |
| **Mittelstand** | **Wahrscheinlich zum Gespräch, nicht zum Auftrag** — fibero zeigt Systemverständnis, der Systembetrieb ist ehrlich als „heute kein Preis" markiert | Referenz, Kapazität, Vertretung, Betriebszusage |
| **Technischer Entscheider** | **Ja** — der fibero-Beleg ist im Schema nachlesbar und nennt seine Grenzen | keine Messung vorher/nachher |
| **Geschäftsführer** | **Ja, für ein Gespräch** — offene Formel statt Benchmark | kein belegter Wirkungsnachweis |

## Fünfstelliges Systemprojekt — trägt die Seite das Gespräch?

**TEILWEISE — und die Grenze liegt nicht mehr im Code.**

Was die Seite jetzt zeigt: creaDIG versteht Operations (das fibero-Schema
belegt es), baut real, misst mit *den Zahlen des Kunden*, verkauft nicht
automatisch Individualsoftware und lässt den Preis aus dem Umfang entstehen.
Das trägt ein ernsthaftes Systemgespräch.

Was fehlt, ist **kein Website-Mangel**: null freigegebene Kundenfälle, keine
Vertretungsregel, keine Kapazitätsaussage, kein Integrationsbeispiel mit
Namen, keine Vorher-Messung. Alle fünf sind Owner- oder Kundensachen.

## Was am Code offen bleibt

| | Klasse |
|---|---|
| `/datenschutz` trägt genau **eine** Überschrift; alle Abschnittstitel sind Absätze | **G18_BLOCKED** |
| `/leistungen` trägt 487 Wörter und 4.404 px (Telefon) aus `packages.tsx` | **G18_BLOCKED** |
| Drei AVV unbestätigt · null Kundenfreigaben · CASSAMEA/meahv ohne sichere Aufnahme · Vertretung/Kapazität · fibero-Vorher-Messung | **OWNER** |
| Alte Namen im Suchmaschinen-Zwischenspeicher | **EXTERNAL_SEARCH** |
| Einwilligungstext (68 Wörter) | **LEGAL_FACT** |

**Material FIXABLE_NOW: 0.**
