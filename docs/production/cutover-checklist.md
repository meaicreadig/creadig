# Cutover · Checkliste

> **Authority:** Spec · Gate 4 · Stand 02.09.2026
> **Vor** der Umstellung von `creadig.de` abzuarbeiten.
> Kein Punkt hier ist optional; jeder steht hier, weil er sonst vergessen wird.

---

## 1 · Synthetische Testdatensätze löschen

Bei der Abnahme sind **drei** Anfragen in die echte Neon-Datenbank gelaufen.
Sie sind erkennbar unecht (`@beispiel.invalid`), aber sie stehen in derselben
Tabelle wie später die echten — und ein Vertriebsbericht, der drei erfundene
Anfragen mitzählt, ist ab dem ersten Tag falsch.

| Referenz | Betrieb | Quelle | Sprache |
|---|---|---|---|
| `CD-260901-0bd1` | Gate4 Testbetrieb | kontakt | ar |
| `CD-260901-23df` | Yilmaz Dachtechnik | betriebscheck | tr |
| `CD-260902-54ce` | Runde2 Testbetrieb | kontakt | ar |

```sql
-- Erst ansehen …
SELECT reference, business, email, source, created_at
FROM leads
WHERE email LIKE '%@beispiel.invalid';

-- … dann löschen.
DELETE FROM leads WHERE email LIKE '%@beispiel.invalid';
```

Die Bedingung greift auf die Adresse, nicht auf die Referenzen: Alle drei
tragen `@beispiel.invalid`, eine reservierte Endung, die es real nicht gibt.
Damit kann die Abfrage keinen echten Datensatz erwischen.

**Wann:** vor dem Cutover. Danach steht die Tabelle auf null.

---

## 2 · Preview-Zugangsdaten zurückdrehen

Für die Abnahme des Control Centers wurde das **Preview**-Passwort ersetzt —
das ursprüngliche ist in dieser Umgebung nicht lesbar (alle Secrets kommen
maskiert an), und ohne Anmeldung liess sich der Lesepfad nicht prüfen.

**Owner-Schritt** — Wert nur der Owner kennt:

```
npx vercel env rm ADMIN_PASSWORD preview --yes
printf 'DEIN-PASSWORT' | npx vercel env add ADMIN_PASSWORD preview
npx vercel redeploy <letzte-Preview-URL>
```

Production ist **nicht** betroffen: dort steht das Passwort unverändert.

---

## 3 · Preview-Testvariablen entfernen oder ersetzen

Diese Werte existieren ausschliesslich für die Abnahme:

| Variable | Wert | Was zu tun ist |
|---|---|---|
| `RESEND_API_KEY` (Preview) | **absichtlich ungültig** | ersetzen oder entfernen — sie erzeugt bei jedem Test einen 401 |
| `LEAD_TOKEN_SECRET` (Preview) | generiert | kann bleiben |
| `LEAD_TO` / `LEAD_FROM` (Preview) | echte Adressen | können bleiben |
| `LEAD_STORE=neon` (Preview) | Abnahme | **bleibt** — sonst testet der nächste Durchlauf nichts |

---

## 4 · Production scharfschalten — die Reihenfolge

`LEAD_STORE` steht in Production **nicht**. Das ist Absicht: Solange dort
Legacy läuft, soll nichts gespeichert werden.

Beim Cutover gehören zwei Dinge in **dieselbe** Umstellung:

1. `LEAD_STORE=neon` für Production setzen
2. Deployment mit dem Release-Commit

Der Datenschutztext folgt automatisch — er liest `leadStoreConfigured()`
(`components/legal/legal-page.tsx`). Es gibt deshalb keinen Zustand, in dem
die Datenbank läuft und die Seite noch „Eine Datenbank führen wir nicht"
sagt. **Was NICHT passieren darf:** `LEAD_STORE` in Production setzen,
bevor der neue Release dort liegt — dann stünde der Satz über einer
Anwendung, die es nicht gibt.

`DATABASE_URL` liegt bereits in Production. Ohne `LEAD_STORE` tut sie nichts.

---

## 5 · Nach dem Cutover prüfen

- [ ] `creadig.de` liefert die neue Seite, nicht Legacy
- [ ] `www.creadig.de` liefert dasselbe — **Cloudflare-Cache leeren**, der
      Apex geht direkt zu Vercel, `www` durch den Proxy
- [ ] `/datenschutz` beschreibt in allen vier Sprachen die Datenbank
- [ ] eine echte Testanfrage: Formular → Mail **und** Zeile in Neon
- [ ] `/admin` erreichbar, Anfrage in der Liste
- [ ] die drei Legacy-Weiterleitungen antworten mit 308
- [ ] canonical zeigt auf `creadig.de`, nirgends `vercel.app`

---

## 6 · Rollback

| | |
|---|---|
| Legacy-Commit | `main @ ae76ba6` |
| Legacy-Deployment | `dpl_613YMnSmForNR3EPoNA8fxHHg76o` |
| Aliasse dort | `creadig.de`, `www.creadig.de` |

Rollback heisst: Domain zurück auf dieses Deployment. **Legacy nicht löschen**
— nicht am Cutover-Tag und nicht in der Woche danach.

Bei einem Rollback bleibt die Neon-Datenbank stehen. Anfragen, die zwischen
Cutover und Rollback eingegangen sind, liegen dort und sind nicht verloren;
sie sind nur bis zum nächsten Versuch nicht über `/admin` sichtbar.
