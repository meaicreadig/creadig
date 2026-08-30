# creaDIG · Knowledge Map

> **Was das ist.** Die Landkarte, welche Datei **Autorität** hat — damit kein
> Agent und kein Mensch in sechs Monaten fragt: „Welche Version gilt?“
>
> **Drei Systeme:** Website · Company OS · Knowledge OS (diese Map).

### Stage-Status (30.08.2026)

Operative Leiter: **`creadig-MASTER-LEITER-R4.md`** (PHASE A ausgeführt, STOP).  
Älteres `creadig-MASTER-PROMPT-COMPANY-OS.md` bleibt Fach-Canon; **Reihenfolge** folgt R4.

### Stage-Status (29.08.2026, historisch)

| Stage | Status |
|-------|--------|
| MP-A Brand | ✅ |
| MP-B Company OS / Lead | ✅ |
| MP-C Proof | Inventar ✅ · C.1 ✅ · C.2 Pipeline ✅ (**Screens fehlen**) · **C.3 Gerüst ✅** (Logo+Bild NV/maqam/BDH · `imageProof` · CaseCard · `approved` weiter false) |
| MP-D Sales / Betriebscheck | ✅ |
| MP-D.5 Conversion Acceptance | ✅ |
| Live-Mail SELFTEST | ⬜ Owner-Gate |
| MP-E Marketing | ✅ |
| MP-E.5 Marketing Acceptance | ✅ 10/10 |
| MP-F Scale | ⬜ nach Proof-Fortschritt |

---

## Authority-Stufen

| Stufe | Bedeutung | Darf widersprechen? |
|-------|-----------|---------------------|
| **Canon** | Gesperrt. Nur Owner ändert Absicht. | Nein — umsetzen oder Owner fragen |
| **Spec** | Soll-Zustand / Schema. Noch nicht alles live. | Code folgt Spec; Spec folgt Owner |
| **Working Note** | Arbeitspapier, darf veralten | Ja — durch Canon/Spec ersetzen |
| **Archive** | Geschichte. Nicht ausführen. | Nur lesen |

---

## 00 — GOVERNANCE

| Datei | Authority | Rolle |
|-------|-----------|--------|
| `KIZILELMA-creaDIG.md` | **Canon** | Omurga / DNA / §12 Drittanalyse |
| `creadig-MASTER-LEITER-R4.md` | **Canon (operativ)** | Company OS Reihenfolge PHASE A–L · Stand 30.08.2026 |
| `creadig-MASTER-PROMPT-COMPANY-OS.md` | **Canon (Fach)** | Firmen-Maschine MP-A→F — weicht R4 bei Sprachen/Cutover: **R4 + Owner** |
| `creadig-MASTER-PROMPT-EFSANE.md` | **Canon** | Site-Evolution |
| `creadig-MASTER-PROMPT-WEITERENTWICKLUNG.md` | Working Note | Autonomer Zyklus (teilweise historisch) |
| `creadig-MASTER-PROMPT-BETRIEB.md` | Spec | Betrieb / Deploy-Disziplin |
| `.cursor/rules/creadig-autonomous-dev.mdc` | **Canon** | Anti-Nagging, Prioritäten |
| `creadig-TIEFENANALYSE.md` | Archive | Frühere Design-Diagnose |

## 01 — BRAND

| Datei | Authority | Rolle |
|-------|-----------|--------|
| `docs/brand/messaging-canon.md` | **Canon** | DE/TR Sprache, Verbote |
| `docs/brand/design-system.md` | **Canon** | Tokens, Patterns, Info-Hierarchie, Image Bible |
| `docs/brand/creadig-principles.md` | **Canon** | 01–07 + Unknown≠invented |

## 02 — PRODUCT

| Datei / Code | Authority | Rolle |
|--------------|-----------|--------|
| `lib/site-data.ts` (`PRODUCT_WORLDS`, maturity) | Spec→Canon | Produkte; maturity nur mit Owner-Wert |
| `lib/product-media.generated.ts` | Spec | Screen-Slots (oft leer = ehrlich) |

## 03 — OPERATIONS

| Datei | Authority | Rolle |
|-------|-----------|--------|
| `docs/ops/lead-current-state.md` | Spec | Ist→Soll Lead-Fluss (MP-B) |
| `docs/ops/crm-schema.md` | Spec | Lead + 3 State Machines |
| `docs/ops/lead-store.md` | Spec | **MP-G** — Anbieterwahl, Datenschutz-Entwurf, Aufrufort, geprüftes Ausfallverhalten |
| `docs/ops/privacy-persistence-gate.md` | Spec | **Tor** — die vier Owner-Entscheidungen und der fertige Datenschutz-Text; DB und Text sind EINE Freigabe |
| `docs/production/redirect-map.md` | Spec | die drei Legacy-Adressen, und warum Anker keine bekommen |
| `docs/ops/neon-decision-pack.md` | Spec | **eine** Owner-Entscheidung: Anbieter, Region, AVV, Aufbewahrung, Löschung |
| `docs/i18n/current-state.md` | Current State | wo DE/TR/EN/AR stehen — und warum EN fertig, aber nicht veröffentlicht ist |
| `docs/ops/provider-neon.md` | Working Note | **MP-G.3** Neon/Vercel Marketplace Gate — sechs Verarbeiter-Fragen, noch keine Freigabe |
| `docs/ops/analytics-events.md` | Spec | Events + Properties |
| `docs/ops/sop-lead-handling.md` | Spec | Interne Antwort-SLA |
| `docs/ops/conversion-acceptance.md` | Working Note | MP-D.5 Prüfprotokoll: 12/12 PASS, Befunde, was Env-blockiert ist |
| `docs/ops/marketing-acceptance.md` | Working Note | MP-E.5 Prüfprotokoll: 10/10 PASS + Conversion-Definition |
| `docs/ops/proof-inventory.md` | Working Note | MP-C Lückentabelle — was fehlt, wo es hingehört |
| `docs/ops/case-format.md` | Working Note | MP-C.3 Owner-Fill: Projekt · Kategorie · Leistungen |
| `docs/ops/proof-kinds.md` | **Canon** | Eigenes Produkt / Kundenprojekt / Kundenergebnis — Freigabe-Matrix |
| `docs/ops/demo-data-standard.md` | **Canon** | Echte UI, synthetische Daten, Label-Regel, Prüfliste vor jeder Aufnahme |
| `docs/ops/case-format.md` | Spec | Case-Kurzformat + Freigabe-Vorlage zum Ausfüllen |
| `docs/roadmap/creadig-1-0-scale.md` | Spec | **MP-F Blueprint** — Portal-IA, Trust Center, Pulse, Tiers, meAI, Hiring, Revenue-Rahmen, 1.0-Definition |
| `docs/control-center/current-state.md` | Current State | **PHASE A.7** — Admin existiert auf Feature-Branch; Production `/admin` = Legacy-404; Preview hinter SSO |
| `docs/production/legacy-current-state.md` | Current State | **PHASE A.1** — `main` @ `ae76ba6`, `creadig.de` = Vanilla |
| `docs/production/legacy-archive-plan.md` | Spec | **PHASE A.2** — archivieren, nicht löschen; Tag nur auf Befehl |
| `docs/control-center/architecture.md` | Spec | **MP-G G.1** — Routen, Zugang (signierte Sitzung), Rollen, geteilte Bausteine |
| `docs/control-center/acceptance.md` | Acceptance | **MP-G G.1** — 11/11 PASS: Zugang, Regression, Oberfläche |
| `docs/control-center/sales.md` | Spec | **MP-G.3** — Sales-Maschine, Lesepfad, Doppel-Erkennung, „Persisted ≠ Delivered"; Oberfläche wartet auf den Speicher |
| `docs/ops/utm-playbook.md` | Spec | Attribution-Modell + Tracking-Ready-Checkliste; Client blockiert bis Datenschutzsatz |
| `app/api/lead/route.ts` | **Canon (Code)** | Source of Truth Versand |
| `lib/use-lead.ts` | **Canon (Code)** | Client-Submit |

## 04 — SALES

| Datei | Authority | Rolle |
|-------|-----------|--------|
| `lib/betriebscheck.ts` | **Canon (Code)** | Fragen, Rechnung und Texte des Betriebschecks |
| `components/sales/betriebscheck.tsx` | **Canon (Code)** | Oberfläche · `/betriebscheck` (DE+TR) |
| `docs/sales/offers.md` | Spec | Productized Offers |
| `docs/sales/discovery-questions.md` | Spec | Discovery |
| `docs/sales/proposal-outline.md` | Spec | Proposal-Schema |

## 05 — MARKETING

| Datei | Authority | Rolle |
|-------|-----------|--------|
| `lib/branchen.ts` · `components/pages/handwerk-page-body.tsx` | **Canon (Code)** | `/branchen/handwerk` (DE+TR) — genau EIN vertikaler Einstieg |
| `docs/marketing/build-notes.md` | Spec | Insights-Format: Bau-Notizen, kein Blog |
| `lib/seo-landings.ts` | Spec | Stadt/Keyword-Landings — LEER, kein Ort bestätigt |

## 06 — ENGINEERING

| Datei | Authority | Rolle |
|-------|-----------|--------|
| `app/globals.css` | **Canon (Code)** | Tokens |
| `docs/barrierefreiheit-*.md` | Spec | A11y-Befunde |
| Tests / `npm run a11y` · `shots` | Canon Prozess | Gates |

## 07 — ROADMAP

| Datei | Authority | Rolle |
|-------|-----------|--------|
| `docs/roadmap/creadig-1-0-scale.md` | Spec | MP-F Blueprint |

---

## Konfliktregel

1. Reale verifizierte Repo-/Production-Truth.  
2. Explizite aktuelle Owner-Entscheidung.  
3. Fach-Canon.  
4. Acceptance.  
5. `creadig-MASTER-LEITER-R4.md`.  
6. Ältere Specs / Prompts.  
7. Widerspruch → dokumentieren, nicht still mergen.

---

**Stand:** 30.08.2026 · Master-Leiter R4 · PHASE A STOP
