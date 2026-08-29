# SOP · Lead-Handling (intern)

> **Authority:** Spec · MP-B · Stand 29.08.2026  
> **Kein Kundenversprechen** in diesem Dokument — nur interne Disziplin.

---

## Eingang

1. Mail an `LEAD_TO` (Standard: info@creadig.de) mit Zeilen Name, Betrieb, Mail, Telefon, Sprache, Herkunft, **Referenz `CD-…`**.  
2. Absender hat Eingangsbestätigung (ohne verbindliche Terminbuchung bei `termin`).

## Reaktion (interner Ziel-SLA)

| Quelle | Ziel-Antwort | Hinweis |
|--------|--------------|---------|
| `termin` | innerhalb 1 Werktag | Wunschzeiten abgleichen — Assistent bucht **nicht** |
| `kurzcheck` | innerhalb 2 Werktage | Seite ansehen; drei konkrete Punkte (Dictionary) |
| `produkt-*` | innerhalb 2 Werktage | Interesse notieren; kein Fake-Demo-Termin |
| Direkt Mail/WhatsApp | best effort, ≤ 1 Werktag | nicht über `/api/lead` — manuell Referenz vergeben optional |

Wenn überlastet: ehrliche Verzögerungsmail > Schweigen.

## Status (Sales)

Ohne CRM-Tool: Ordner/Labels im Postfach oder Notiz mit `reference` + Stage aus `crm-schema.md` (mind. `new` / `contacted` / `won` / `lost`).

## Verloren / Datenschutz

- Keine Lead-Inhalte in öffentlichen Chats/Issues.  
- Lösch-/Auskunftswünsche: Owner-Prozess (nicht Agent-Aufgabe).  
- Speicherfrist: Datenschutzerklärung (Postfach) — hier nicht neu erfinden.

## Eskalation

Technischer Versandfehler → Alert `lead-send-failed` (`lib/alert`). Owner prüft Resend/Env — Agent naggt nicht wegen Legal.
