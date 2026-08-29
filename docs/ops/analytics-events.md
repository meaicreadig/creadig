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

## Ist (Code) — Stand nach MP-B Rest

| Event | Implementation | Wo |
|-------|----------------|----|
| `Anfrage` (Alias) + `lead_submitted` | `trackLead(source)` | `lib/track.ts` |
| `cta_click` `{ cta, location, page }` | im Hauptknopf selbst — `cta` aus dem ZIEL, nicht aus der Beschriftung (die ist zweisprachig) | `components/ui/magnetic-button.tsx` |
| `booking_step` `{ step, locale }` | `useEffect` auf `step`, nur 1–4 (Schritt 5 = Erfolg trägt `lead_submitted`) | `components/termin/termin-wizard.tsx` |
| `audit_started` `{ locale }` | bei der ERSTEN Antwort, genau einmal | `components/sales/betriebscheck.tsx` |
| `audit_completed` `{ locale, score_bucket }` | beim Aufdecken des Ergebnisses; `score_bucket` = Zwanziger-Korb, nie der Rohwert | `components/sales/betriebscheck.tsx` |

**Noch Spec (kein Hook):** `product_view`, `case_view`, `pricing_view` — alle
drei brauchen einen Viewport-Beobachter, den es heute nicht gibt. Ein
`IntersectionObserver` je Sektion ist Arbeit, die sich erst lohnt, wenn
jemand die Zahlen auch ansieht. Kein Stub, der nichts misst.

### Warum `cta_click` in der Komponente sitzt und nicht an den Aufrufstellen

`MagneticButton` steht an dreizehn Stellen. Dreizehn handgesetzte
`onClick`-Tracker wären dreizehn Gelegenheiten, einen zu vergessen oder
anders zu benennen — am Ende hätte man dreizehn Ereignisnamen statt eines mit
dreizehn Ausprägungen. Genau das verbietet Regel D.

---

## Implementierungsregel

1. Zuerst `lib/track.ts` um generische `trackEvent(name, props)` erweitern.  
2. Bestehende `trackLead` intern auf `lead_submitted` mappen **oder** Alias behalten (Breaking Avoid — beides loggen nur mit Owner-OK).  
3. Keine Events ohne Consent.

---

## Später · Attribution (MP-E — Spec only, kein Client heute)

Wenn UTM-Client nach Datenschutz-Satz kommt, nicht nur die fünf UTM-Felder
denken. Modell vorbereiten:

| Touch | Bedeutung |
|-------|-----------|
| first touch | Wo creaDIG zuerst gesehen wurde |
| last touch | Was unmittelbar vor dem Lead lag |
| landing page | Erste URL der Session |
| referrer | HTTP-Referrer wenn vorhanden |
| lead source | Formular-`source` (`termin`, `betriebscheck`, …) |

Frage in sechs Monaten: *„Wo hat der Kunde uns zuerst gesehen — und welcher
Kontakt hat ihn zum Betriebscheck gebracht?“*  
Code dafür = MP-E, nicht jetzt.
