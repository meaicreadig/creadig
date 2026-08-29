# CRM-Schema · creaDIG Company OS

> **Authority:** Spec · MP-B · Stand 29.08.2026  
> **Persistence heute:** E-Mail-Postfach (`/api/lead`). Schema beschreibt das **logische** Objekt — nicht eine Pflicht-DB.

---

## Lead-Objekt

| Feld | Typ | Pflicht | Hinweis |
|------|-----|---------|---------|
| `id` | UUID/ULID string | ja | Intern, immutable. **Nicht** die CD-Nummer. |
| `reference` | `CD-YYMMDD-XXXX` | ja | Menschlich / Mail / Owner. XXXX = 4 hex (kein Tages-Sequence auf Serverless). |
| `source` | string | ja | `termin` \| `kurzcheck` \| `kontakt` \| `produkt-<slug>` \| später `betriebscheck` |
| `locale` | `de` \| `tr` | ja | |
| `name` | string | ja | |
| `email` | string | ja | |
| `phone` | string | ja | |
| `business` | string | nein | |
| `message` | string | situativ | bei `kurzcheck` optional |
| `siteUrl` | string | bei kurzcheck | |
| `landingPage` | string | nein | wenn Client mitschickt |
| `country` | string | nein | nicht raten |
| `interest` | string | nein | aus source/message ableitbar |
| `employees` | number \| null | nein | Unknown = null |
| `score` | number \| null | nein | erst Betriebscheck |
| `salesStatus` | enum | default `new` | siehe Sales-Maschine |
| `utm_source` / `utm_medium` / `utm_campaign` / `utm_content` | string \| null | nein | |
| `createdAt` | ISO | ja | Serverzeit |

### Reference-Format

```
CD-YYMMDD-XXXX
Beispiel: CD-260829-a3f2
```

- `YYMMDD` = UTC-Datum der Erstellung  
- `XXXX` = 4 Hex aus CSPRNG (kollisionsarm genug für Mail-Volumen; **kein** DB-PK)

---

## Drei State Machines (getrennt)

### 1 · SALES (Lead / Opportunity)

```
new → contacted → qualified → discovery → audit → proposal → negotiation → won
                                                                         ↘ lost
```

Lead-Status ≠ Projekt-Status.

### 2 · DELIVERY (nach Won)

```
onboarding → planning → build → review → go-live → completed
```

### 3 · CUSTOMER (Beziehung)

```
active → managed → expansion → paused → churned
```

---

## Abbildung heute → später

| Heute | Später |
|-------|--------|
| Mail-Zeile `Referenz: CD-…` | CRM-Zeile mit gleichem `reference` |
| Implizit alles `new` | Owner setzt Stage in Tool / Sheet |
| Kein Delivery-Objekt | Erst bei erstem Won-Projekt anlegen |

**Regel:** Neues Capture immer über `/api/lead`. CRM importiert — konkurriert nicht.
