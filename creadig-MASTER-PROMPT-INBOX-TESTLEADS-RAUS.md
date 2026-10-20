# MASTER PROMPT — Anfragen-Inbox: Testleads SOFORT raus

**Owner-Befehl (verbindlich):** Keine Recherche. Keine Screenshots. Keine Analyse-Docs. Kein „erstmal verstehen“. Fixen. Committen. Pushen. Preview prüfen. Fertig.

**Sprache zum Owner:** Türkçe, kurz. Passwort nie in Chat/Log.

---

## PROBLEM (gemessen, Screenshot Owner 03.09.2026)

`/admin/vertrieb/anfragen` zeigt **7 Zeilen**, die der Owner **nie angelegt** hat:

| Referenz | Absender |
|---|---|
| CD-260903-3ab0 | V11 Abnahme Betrieb |
| CD-260903-661b | V11 Abnahme Betrieb |
| CD-260903-1ab5 | V11 Abnahme Betrieb |
| CD-260903-80d9 | V11 Abnahme Betrieb |
| CD-260902-54ce | Runde2 Testbetrieb |
| CD-260901-23df | Yilmaz Dachtechnik |
| CD-260901-0bd1 | Gate4 Testbetrieb |

**Soll:** Inbox zeigt **nur** echte Owner-/Kunden-Anfragen. Diese 7 und jeder weitere V11/Gate4/Runde2/`@beispiel.invalid`-Eintrag = **unsichtbar**.

**Nicht löschen** (Datenverlust). `excluded_reason` setzen + Liste hart filtern.

---

## FERTIG-KRITERIUM (einziges)

Preview `/admin/vertrieb/anfragen`:

- die 7 Referenzen oben = **0 Treffer**
- Suche „V11“ / „Gate4“ / „Runde2“ = **leer**
- echte Leads des Owners bleiben sichtbar

Dann stoppen. Kein §19-Marathon. Kein Org-Polish.

---

## WO (Code, nicht raten)

| Datei | Rolle |
|---|---|
| `lib/vertrieb-bestand.ts` | `AUSGESCHLOSSENE_NAMEN`, `AUSGESCHLOSSENE_REFERENZEN`, `sqlLeadOperational()`, `isTestEnquiry()` |
| `lib/neon-client.ts` | `applyExclusions()` — bei jedem Start die 7 Refs + Namen markieren |
| `lib/vertrieb-store-neon.ts` | `listEnquiries` — SQL-Filter **und** JS-Filter `!isTestEnquiry` |
| `app/(admin)/admin/vertrieb/anfragen/page.tsx` | ruft `listEnquiries` |

Branch: `feat/system-haus-site`. HEAD sollte `6bad3d4`+ sein — **wenn Preview trotzdem die 7 zeigt, läuft alter Deploy ODER Filter greift nicht. Beides sofort prüfen und fixen.**

---

## SOFORT-PLAN (max 20 Min, Reihenfolge hart)

### 1) Preview = aktueller Commit?
```bash
git log -1 --oneline
npx vercel ls --limit 5
```
Neuester **Preview Ready** muss SHA von `6bad3d4` oder neuer sein. Sonst:
```bash
npx vercel --yes
```
(nur Preview, **kein** `--prod`).

### 2) Wenn nach frischem Preview die 7 noch da: Code kaputt — fixen

**Pflicht-Verhalten:**

1. `AUSGESCHLOSSENE_REFERENZEN` enthält exakt die 7 IDs oben.
2. `applyExclusions()` setzt `excluded_reason` für diese Refs **bei jedem** `refreshExclusions` / Kaltstart (kein `once()`, der neue Zeilen vergisst).
3. `listEnquiries` WHERE = `sqlLeadOperational("l")` inkl. `reference NOT IN (...)`.
4. Danach zusätzlich: `rows.filter(r => !isTestEnquiry(r))`.
5. `toEnquiry` mappt `excludedReason` und `reference` korrekt.

**Wenn UI trotzdem zeigt:** Debug **eine** Server-Log-Zeile in `listEnquiries` (Count vor/nach Filter, **keine** Kundendaten dump). Fix. Log wieder raus.

**Atomare SQL-Absicherung** (über App-Pfad / Neon in Preview-Env, Passwort nur aus `.env.local`, nie echo):

```sql
UPDATE leads
SET excluded_reason = 'Abnahmedatensatz — Testdaten'
WHERE reference IN (
  'CD-260903-3ab0','CD-260903-661b','CD-260903-1ab5','CD-260903-80d9',
  'CD-260902-54ce','CD-260901-23df','CD-260901-0bd1'
)
AND excluded_reason IS NULL;
```

Plus Prefix (kein `%Yilmaz%` allein — trifft echte Prospects):

```sql
UPDATE leads SET excluded_reason = 'Abnahmedatensatz — Testdaten'
WHERE excluded_reason IS NULL
  AND (
    lower(btrim(name)) LIKE 'v11 abnahme%'
    OR lower(btrim(coalesce(business,''))) LIKE 'v11 abnahme%'
    OR lower(btrim(name)) LIKE 'gate4%'
    OR lower(btrim(coalesce(business,''))) LIKE 'gate4%'
    OR lower(btrim(name)) LIKE 'runde2%'
    OR lower(btrim(coalesce(business,''))) LIKE 'runde2%'
    OR lower(btrim(email)) LIKE '%@beispiel.invalid'
  );
```

### 3) Commit + Push (ohne nachzufragen)
```bash
git add lib/vertrieb-bestand.ts lib/neon-client.ts lib/vertrieb-store-neon.ts
git commit -m "fix(vertrieb): Test-Anfragen aus Inbox — Refs markieren und hart filtern"
git push origin feat/system-haus-site
```
Unrelated dirty (`screenshots 2/`, COMPANY-OS, proof-inventory) **nicht** committen.

### 4) Owner-Beweis (30 Sekunden, kein Report)
Neue Preview-URL → Anfragen → die 7 weg. Owner eine Zeile: **PASS** oder **FAIL + welche Ref noch da**.

---

## VERBOTEN

- Lange Analysen, Master-Prompt-Ketten, Screenshot-Ordner, Canvas, „warum Neon vs Supabase“
- Passwort im Chat / Terminal-Output / Commit
- `DELETE FROM leads` nach Name-Muster
- Production mutieren ohne Owner-Satz: `PRODUCTION ACTION APPROVED`
- Impressum / USt / AVV ansprechen
- Scope: Organisationen-UI, Pipeline-Polish, geschätzter Wert, §19 alle 24 Punkte

---

## WENN BLOCKIERT

Nur drei gültige Blocker-Meldungen:

1. `ADMIN_*` fehlt auf Preview → Owner Vercel Env Preview an; dann Redeploy Preview
2. Vercel SSO blockiert Automations-Browser → Owner öffnet URL selbst; Agent liefert Fix + URL
3. `DATABASE_URL` in `.env.local` maskiert → Exclusion **nur** über App-Code + Preview-Laufzeit, lokal keine SQL-Show

Sonst: Code fixen. Nicht warten.

---

## START JETZT

1. SHA + Preview Deploy matchen  
2. 7 Refs ausgeschlossen + Inbox leer von Tests  
3. push  
4. Owner: PASS/FAIL  

**Ende.**
