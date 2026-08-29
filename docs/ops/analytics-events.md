# Analytics Events · Taxonomie

> **Authority:** Spec · MP-B Regel D · Stand 29.08.2026  
> **Consent:** Nur bei `hasConsent("statistics")` — siehe `lib/track.ts` / `lib/consent`.  
> **Nie** PII in Properties (keine Namen, E-Mails, Nachrichten).

---

## Prinzip

**Generic event name + properties** — keine Event-Explosion.

| ❌ Vermeiden | ✅ Nutzen |
|-------------|----------|
| `product_view_fibero` | `product_view` + `{ product: "fibero" }` |
| `case_view_nv_swiss` | `case_view` + `{ case: "nv-swiss" }` |
| `cta_project_start` | `cta_click` + `{ cta: "project_start", location, page }` |

---

## Events (Soll)

| Event | Properties | Wann |
|-------|------------|------|
| `lead_submitted` | `source`, `locale` | Nach erfolgreichem `/api/lead` (ersetzt/ergänzt heutiges `Anfrage`) |
| `booking_step` | `step` (1–4), `locale` | Termin-Wizard Schrittwechsel |
| `cta_click` | `cta`, `location`, `page`, `locale` | Primäre CTAs |
| `product_view` | `product`, `locale`, `source_page` | Produktseite sichtbar |
| `case_view` | `case`, `locale` | Case geöffnet |
| `pricing_view` | `locale`, `page` | Pakete/Preise im Viewport |
| `audit_started` | `locale` | Betriebscheck Start (MP-D) |
| `audit_completed` | `locale`, `score_bucket` (z.B. `0-25`… — nicht Rohscore wenn zu granular) | Check fertig |

`score_bucket` statt exaktem Score — weniger Fingerprinting, genug für Funnel.

---

## Ist (Code)

| Event | Implementation |
|-------|----------------|
| `Anfrage` | `trackLead(source)` → Vercel `track("Anfrage", { source })` |

Alles andere: **Spec / Stub** bis Hook gesetzt wird. Kein Fake-Dashboard.

---

## Implementierungsregel

1. Zuerst `lib/track.ts` um generische `trackEvent(name, props)` erweitern.  
2. Bestehende `trackLead` intern auf `lead_submitted` mappen **oder** Alias behalten (Breaking Avoid — beides loggen nur mit Owner-OK).  
3. Keine Events ohne Consent.
