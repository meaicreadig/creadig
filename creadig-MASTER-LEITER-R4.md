# creaDIG 1.0 · Company Operating System
# Master-Leiter · Revision 4

> **Authority:** Canon (operativ) · Owner-Freigabe 30.08.2026 (Chat)  
> **Stand:** 30.08.2026  
> **Startbefehl dieses Chats:** nur **PHASE A** — Legacy Safety + Admin Visibility.  
> Volltext der Leiter: Owner-Dokument (Chat). Dieses File ist die **verbindliche Kurzfassung + Konfliktliste + Phase-A-Verweis**.

Bei Konflikten gilt die Rangfolge aus R4 §00:

1. reale, aktuell verifizierte Repo-/Production-Truth  
2. explizite aktuelle Owner-Entscheidung  
3. Fach-Canon  
4. Acceptance  
5. diese Master-Leiter  
6. ältere Specs  
7. ältere Prompts / Working Notes  

---

## Owner-Locks (R4 — nicht still überschreiben)

- Sprachen neu: **DE · TR · EN · AR**. **RU = Legacy Archive**, nicht Live-Canon.  
- URL-Locale: `/` DE, `/tr`, `/en`, `/ar`. Kein `?lang=` / Cookie als Truth.  
- **Prospect ≠ Lead.** Vibe nicht in `LeadRecord`.  
- Neon = technischer Kandidat Frankfurt + serverless driver — **nicht** Production-aktiv ohne Privacy-Gate.  
- Cutover `creadig.de` erst nach R4-Acceptance (inkl. EN/AR/RTL) **oder** explizitem Owner-Ausnahme-Gate.  
- Legacy: archivieren, nicht löschen.  
- Commit nur auf Befehl. Kein `git add .`.  
- Secrets niemals ausgeben.

---

## Dokumentierte Konflikte (Truth first — nicht still entschieden)

| Thema | Ältere Wahrheit | R4 | Umgang |
|-------|-----------------|----|--------|
| Sprachen | DE+TR Canon (`lib/routes.ts`) | +EN +AR | **Owner lock.** Phase B, nicht A. |
| Live-Gate | „jetzt live“ ohne EN/AR | Cutover erst 4 Sprachen | Ausnahme nur Owner. |
| G.0 `docs/control-center/current-state.md` (29.08.) | „Es gibt keinen Admin“ | Admin existiert auf `feat/system-haus-site` | **G.0 veraltet** — siehe aktualisierte Current State |
| `creadig-MASTER-PROMPT-COMPANY-OS.md` | MP-A…F Leiter | R4 ist zentrale operative Leiter | Fach-Canons bleiben; R4 führt die Reihenfolge |
| Admin auf creadig.de | fehlt | Code existiert | Production zeigt **Legacy HTML**, nicht Next |
| Datenschutz | „Eine Datenbank führen wir nicht.“ | Persistence geplant | Gemeinsames Release mit Neon |
| Retention live | 6 Monate (Datenschutztext) | 24 Monate nur Richtung | LEGAL REVIEW |

---

## PHASE A — Fundstellen

| Doc | Authority |
|-----|-----------|
| `docs/production/legacy-current-state.md` | Current State |
| `docs/production/legacy-archive-plan.md` | Spec (kein Delete) |
| `docs/control-center/current-state.md` | Current State (30.08. Update) |
| `docs/ops/provider-neon.md` | Working Note · Gate |

**Nächste Phase nach Owner „weiter“:** PHASE B (International Foundation) — **nicht** Neon-Code, nicht `/admin/leads`, kein Cutover.

Volltext der 104 Abschnitte: Owner-Chat 30.08.2026. Kurzfassung hier, damit die Leiter im Repo liegt ohne die Fach-Canons zu überschreiben.
