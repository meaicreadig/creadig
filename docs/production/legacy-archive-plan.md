# Legacy Archive Plan

> **Authority:** Spec · PHASE A.2 · Stand 30.08.2026  
> **Noch kein Delete. Noch kein Domain-Cutover. Noch kein Git-Tag (nur Vorschlag).**

---

## Ziel

Nach Cutover:

- Neue System-Haus-Site = **creadig.de**  
- Legacy = **wiederherstellbarer Snapshot**, nicht zweite indexierbare Hauptseite  
- Keine unnötige öffentliche Legacy-Subdomain ohne Bedarf

---

## A · Git

| Aktion | Wer | Wann |
|--------|-----|------|
| Stand festhalten | `main` = `ae76ba6` | jetzt dokumentiert |
| **Tag vorschlagen** | `legacy-production-2026-08-26` → `ae76ba6` | **nur Owner-Befehl** |
| Archive-Branch | optional `archive/legacy-vanilla` von `main` | nur Owner-Befehl |

---

## B · Vercel

Die ersten beiden Punkte sind am 30.08.2026 **erledigt** (API-verifiziert,
`legacy-current-state.md` §2):

| # | Punkt | Stand |
|---|-------|-------|
| 1 | Production Deployment | **`dpl_7XsgY2peDVzXY76foS2VNTrs8Avx`** · `creadig-2mig6uudn-…vercel.app` |
| 2 | Production-Branch / Commit | **`main` @ `ae76ba6`** · `target: production` |
| 3 | Env Production vs Preview | **offen** — Admin-Env im Preview nachweislich unwirksam |
| 4 | `creadig.de` + `www` DNS | **teilweise** — www läuft über Cloudflare (Proxy Detected bestätigt); `creadig.de` in keiner API-Alias-Liste sichtbar |

**Rollback ist damit konkret:** Domain zurück auf
`dpl_7XsgY2peDVzXY76foS2VNTrs8Avx`. Diese ID am Cutover-Tag nicht suchen,
sondern hier ablesen. Legacy-Dateien nicht am selben Tag löschen.

---

## C · Inventar vor Cutover (A.1 Folge)

- [ ] Alle Legacy-HTML-Routen listen (`index`, `termin.html`, `meai_intro.html`, …)  
- [ ] `assets/` Dateiliste  
- [ ] Sprachstrings DE/EN/TR/AR/RU (data-Attribute) — KEEP AS REFERENCE  
- [ ] Externe Backlinks / wichtige alte URLs → Redirect-Map (Phase F)  
- [ ] Kundenwerk-Bilder: welche nur Legacy, welche schon `public/works/`

---

## D · Redirect-Map (Phase F, nicht A)

Mindestens:

| Alt | Neu (System-Haus) |
|-----|-------------------|
| `/termin.html` | `/termin` (Next hat Redirect bereits im neuen Code) |
| `/index.html` | `/` |
| Bookmark ohne Pfad | `/` |

Sprach-URLs gab es im Legacy **nicht** (`localStorage`) — kein 1:1 `/en/...` Mapping aus alter Site.

---

## E · Nach Cutover (nicht jetzt)

- Legacy-Deployment nicht als Canonical  
- `creadig.vercel.app` nicht als öffentliche Zweit-Site indexieren (robots/noindex oder Protection)  
- RU-Inhalte in Git behalten  

---

## F · Was dieses Dokument NICHT tut

- Domain umstellen  
- Dateien löschen  
- Tag erstellen  
- Production Env ändern  
