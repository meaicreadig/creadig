# Lead · Current State → Target State

> **Authority:** Spec · MP-B Schritt 0 · Stand 29.08.2026  
> **Regel A:** Keine zweite Persistence-Schicht. Source of Truth bleibt der bestehende Lead-Weg.

---

## CURRENT STATE

```
┌─────────────────┐   ┌──────────────────┐   ┌────────────────────┐
│ Termin-Wizard   │   │ Quick-Check      │   │ Produkt-Interesse  │
│ source: termin  │   │ source: kurzcheck│   │ source: produkt-*  │
└────────┬────────┘   └────────┬─────────┘   └─────────┬──────────┘
         │                     │                         │
         └──────────┬──────────┴─────────────────────────┘
                    ▼
            useLeadSubmit()          GET /api/lead → Form-Token
            lib/use-lead.ts          (Honeypot + Zeit-Token + Rate-Limit)
                    │
                    ▼
            POST /api/lead
            app/api/lead/route.ts
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
   Mail an LEAD_TO        Bestätigung an Absender
   (info@creadig.de)      (Resend HTTP)
         │
         ▼
   Postfach = einzige Speicherung
   (bewusst keine DB — siehe Route-Kommentar)
```

### Was es gibt

| Eingang | Client | `source` | Extra-Felder |
|---------|--------|----------|--------------|
| Termin-Assistent | `termin-wizard.tsx` | `termin` | Datum/Zeitfenster im message-Körper |
| Kurz-Check (A11y) | `quick-check.tsx` | `kurzcheck` | `siteUrl` Pflicht |
| Produkt-Interesse | `product-interest.tsx` | `produkt-<slug>` | Produkt im source |
| Kontakt-Seite | `contact-direct.tsx` | — | **Kein Formular** — Direktwege (Mail/WhatsApp) |

### Analytics heute

| Ereignis | Wo | Form |
|----------|-----|------|
| `Anfrage` | `lib/track.ts` → Vercel Analytics | `{ source }` nur bei Consent `statistics` |

Keine Funnel-Events (`booking_step`, `cta_click`, …) — nur erfolgreiche Anfrage.

### Was fehlt (ehrlich)

- Keine Lead-Referenznummer in Mail/UI  
- Kein internes immutable ID  
- Kein CRM / Pipeline-Status (alles = „neu im Postfach“)  
- Keine UTM-Persistenz  
- Kontakt-Projekt-Pfad ist nicht Formular → Lead-API  

---

## TARGET STATE (ohne Parallel-System)

```
Website (alle Formulare)
        │
        ▼
   POST /api/lead  ◄── weiterhin EIN Endpunkt
        │
        ├─ id:          ulid/uuid (intern, Mail-Header/Body, Logs)
        ├─ reference:   CD-YYMMDD-XXXX (menschlich, Mail + JSON-Antwort)
        ├─ source / locale / Felder / utm* (wenn mitgeschickt)
        └─ salesStatus: implizit "new" (kein Store — Spec für später)
        │
        ▼
   Resend → Postfach (SoT) + Bestätigung inkl. Referenz
        │
        ▼
   Owner bearbeitet manuell nach SOP
   (CRM-Tool später = Import aus Mail/reference — nicht zweites Capture)
```

### Bewusste Nicht-Ziele (MP-B)

- Keine Datenbank „weil Company OS“  
- Kein zweites `/api/crm`  
- Kein Customer Portal  
- Delivery/Customer-State Machines = **Spec only** bis es echte Projekte gibt  

### Nächster Code-Schritt

1. ~~`id` + `reference` in `/api/lead`~~ — **live** (`lib/lead-id.ts`, Mail + JSON)  
2. Bestätigungsmail nennt die Referenz — **live**  
3. Specs: `crm-schema.md` · `analytics-events.md` · SOP — **geschrieben**  
4. Funnel-Events (`booking_step`, `cta_click`, …) — noch Stub; `trackEvent` + `lead_submitted` Alias live  
