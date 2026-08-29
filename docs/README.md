# creaDIG · Knowledge Map

> **Was das ist.** Die Landkarte, welche Datei **Autorität** hat — damit kein
> Agent und kein Mensch in sechs Monaten fragt: „Welche Version gilt?“
>
> **Drei Systeme:** Website · Company OS · Knowledge OS (diese Map).

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
| `creadig-MASTER-PROMPT-COMPANY-OS.md` | **Canon** | Firmen-Maschine MP-A→F |
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
| `docs/ops/analytics-events.md` | Spec | Events + Properties |
| `docs/ops/sop-lead-handling.md` | Spec | Interne Antwort-SLA |
| `docs/ops/utm-playbook.md` | Spec | (MP-E) |
| `app/api/lead/route.ts` | **Canon (Code)** | Source of Truth Versand |
| `lib/use-lead.ts` | **Canon (Code)** | Client-Submit |

## 04 — SALES

| Datei | Authority | Rolle |
|-------|-----------|--------|
| `docs/sales/offers.md` | Spec | Productized Offers |
| `docs/sales/discovery-questions.md` | Spec | Discovery |
| `docs/sales/proposal-outline.md` | Spec | Proposal-Schema |

## 05 — MARKETING

| Datei | Authority | Rolle |
|-------|-----------|--------|
| Branchen-LPs unter `app/` | Canon wenn live | Handwerk zuerst (MP-E) |
| Insights / Build Notes | Spec | kein SEO-Spam |

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

1. **Owner-Satz im Chat** schlägt Dokument (einmalig) — danach Dokument nachziehen.  
2. **KIZILELMA / COMPANY-OS / messaging-canon** schlagen Working Notes.  
3. **Code-Canon** (`/api/lead`, Tokens) schlägt Fantasie-Specs, die „zweite Systeme“ bauen.  
4. Widerspruch → kurz Owner, nicht stillschweigend mergen.

---

**Stand:** 29.08.2026 · nach Peer-Review Rev. 2 Master-Leiter
