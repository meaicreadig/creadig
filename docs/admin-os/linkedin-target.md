# LinkedIn · Zielbild (nur Vertrag, nicht gebaut)

> Stand 25.09.2026 · Final Implementation §17. **Nichts hiervon ist gebaut.**
> Gebaut ist nur der Entwurfszustand im Register (§18, Migration 021).

## Was heute gilt

| Stufe | Fähigkeit | Stand |
|---|---|---|
| 0 | Link zum Profil | offen (B-2: Owner nennt die URLs) |
| 1 | Register: was, wann, Kanal, URL | ✓ `publications` (020) |
| 2 | Reaktion → CRM-Bezug | ✓ `reaktion`, `bezug_art/_id` |
| 3 | Entwurf mit Quelle (Lieferung, Einwand, Beleg, Build Note) | ✓ lokal (021), Produktion wartet auf O7 |
| 4 | Owner gibt frei | ✓ lokal — nur Rolle `owner`, geprüft in Aktion **und** Store |
| 5 | Von Hand veröffentlichen + URL zurück | ✓ „Als veröffentlicht eintragen" — nur aus `freigegeben` |
| 6 | meAI schlägt Entwürfe vor | LATER |
| 7 | API-Veröffentlichung (nur Freigegebenes) | LATER, Trigger unten |
| 8 | Kennzahlen zurück ins Register | LATER — Personenprofile liefern über die API kaum Kennzahlen |

Die eine Regel, die jede spätere Stufe erbt: **Nichts geht von `entwurf`
direkt nach `veroeffentlicht`.** (`lib/veroeffentlichung-zustand.ts`,
`veroeffentlichung-drill` V9.)

## Vertrag für später

```ts
interface PublishingProvider {
  capabilities(): Promise<{ publish: boolean; metrics: boolean }>
  publish(p: ApprovedPublication, idempotencyKey: string): Promise<{ externalId: string; url: string }>
  status(externalId: string): Promise<"live" | "removed" | "unknown">
}
type ApprovedPublication = Publication & { zustand: "freigegeben" }
```

* **Nur beschrieben, nicht gebaut:** OAuth (`w_member_social` für ein
  Personenprofil; Unternehmensseiten brauchen die freigabepflichtige
  Community Management API), Token-Speicher (verschlüsselt, eigener
  Verbindungseintrag in `/admin/verbindungen`), Wiederholung mit demselben
  `idempotencyKey`, Rückschreiben von `url` und `veroeffentlicht_am`.
* Jeder Aufruf läuft als Zeile in `automation_runs` — sichtbar im Block
  „Vom System erledigt".

## Wann gebaut wird (Trigger, nicht Datum)

| System | Bauen, wenn … |
|---|---|
| API-Veröffentlichung | ≥ 8 freigegebene Posts pro Monat über 3 Monate **und** der Owner nennt das Posten selbst als Reibung |
| Kennzahlen-Import | API-Veröffentlichung läuft **und** Reaktionen werden ≥ 1 Monat nicht mehr von Hand gepflegt |
| meAI-Entwürfe | Entwurfszustand ≥ 2 Monate in Gebrauch **und** ≥ 10 Quellereignisse pro Monat |
| Automatische Nachricht an Kunden oder Leads | **nie** ohne Owner-Freigabe pro Nachricht |
