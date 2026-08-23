# creaDIG — vor dem Live-Flip nötig

*Stand 23.08.2026 · Ende Phase 5 des KOMPLETT-Laufs · Branch `feat/system-haus-site`*

Die Seite ist gebaut. Was hier steht, kann **kein Entwickler erledigen** — es sind
Entscheidungen, Zugangsdaten und Inhalte des Inhabers. Abschnitt A blockiert den
Livegang; B ist am Flip-Tag zu tun; C macht die Seite wahr, hält sie aber nicht auf.

---

## A · HART — ohne das kein Livegang

### A1 Impressum vervollständigen (SEC-1)
Zwei Felder stehen als **markierte Platzhalter** auf der Seite. Sie sind sichtbar
gekennzeichnet, damit die Seite vollständig rendert, ohne etwas zu behaupten —
aber ein Impressum mit Platzhaltern ist abmahnfähig.

Datei `lib/site-data.ts` → `imprintDetails`:

| Feld | Was hinein muss |
|---|---|
| `vatId` **oder** `smallBusiness: true` | USt-IdNr. nach § 27 a UStG **oder** Kleinunternehmer nach § 19 UStG. Nie beides. |
| `taxStatusPending` | auf `false`, sobald eines von beiden steht |
| `phone` | deutsche Rufnummer, z. B. `"+49 541 …"` |
| `phonePending` | auf `false`, sobald die Nummer steht |

Rechtsform (`Einzelunternehmen`) und § 18 Abs. 2 MStV (`Muhammed Emin Akyol`)
liegen bereits vor. Sobald alle Pflichtfelder gefüllt sind, verschwindet der
Pending-Block von selbst — dafür ist kein weiterer Eingriff nötig.

### A2 Auftragsverarbeitungsverträge bestätigen (SEC-2)
Zwei Dienstleister verarbeiten Daten in unserem Auftrag, beide in den USA. Die
Datenschutzerklärung nennt sie mit Namen — und kennzeichnet sie derzeit sichtbar
als *„Bestätigung durch den Inhaber offen"*, weil niemand behaupten darf, ein
Vertrag bestehe, den er nicht abgelegt hat.

1. **Vercel Inc.** — DPA unter <https://vercel.com/legal/dpa> im Dashboard bestätigen und die Bestätigung ablegen.
2. **Resend Inc.** — DPA unter <https://resend.com/legal/dpa> ebenso.
3. Danach in `lib/site-data.ts` → `processors[].dpaConfirmed` je Eintrag auf `true`.
   Der offene Hinweis auf der Seite verschwindet dann automatisch.

### A3 Umgebungsvariablen bei Vercel setzen
**Ohne diese kommt keine einzige Anfrage an.** Die Lead-Route antwortet dann mit
503, und das Formular zeigt ehrlich die anderen Wege statt einen Erfolg zu melden,
den es nicht gab — aber der Lead ist trotzdem weg.

| Variable | Wert |
|---|---|
| `RESEND_API_KEY` | API-Schlüssel aus dem Resend-Dashboard |
| `LEAD_FROM` | Absender einer bei Resend **verifizierten** Domain, z. B. `creaDIG <anfrage@creadig.de>` |
| `LEAD_TO` | `info@creadig.de` (Vorgabewert, kann entfallen) |
| `NEXT_PUBLIC_SITE_URL` | `https://creadig.de` — steuert Canonicals, hreflang, Sitemap und OpenGraph |

### A4 Domain verbinden
1. `creadig.de` im Vercel-Projekt hinterlegen, DNS beim Registrar umstellen.
2. Bei **Resend** dieselbe Domain verifizieren (SPF- und DKIM-Einträge) — sonst
   landet die Bestätigungsmail an den Anfragenden im Spam oder wird abgelehnt.
3. Erst danach `NEXT_PUBLIC_SITE_URL` setzen und einmal neu deployen.

### A5 Preis-Entscheidung
350 / 500 / 1500 bleiben unverändert im Code stehen — die Zahl zu ändern war
gesperrt. Die Entscheidung steht weiterhin aus: bei den heutigen Zahlen bleiben
oder auf 2.400 / 3.900 plus 149 im Monat gehen. Die Darstellung („ab"-Logik,
Retainer sichtbar) trägt beides, es ist eine reine Zahlenfrage in
`lib/site-data.ts` → `packages` und `retainer`.

---

## B · AM FLIP-TAG UND KURZ DANACH

### B1 Messung im Vercel-Projekt aktivieren
Web Analytics und Speed Insights sind im Code verdrahtet und hängen an der
Einwilligung — sie müssen im Vercel-Dashboard aber zusätzlich für das Projekt
eingeschaltet werden, sonst kommen keine Daten an.

### B2 Content-Security-Policy scharf schalten (TECH-7)
Heute läuft sie zweistufig: vier Direktiven sind sofort scharf, die vollständige
Policy nur als Bericht. So kann sie nichts zerlegen, was wir noch nicht kennen.

1. Nach ein paar Tagen echtem Verkehr die Vercel-Runtime-Logs nach `[csp]` filtern.
2. Bleiben sie leer, in `next.config.ts` `CSP_REPORT_ONLY` unter dem Schlüssel
   `Content-Security-Policy` ausliefern (den Report-Only-Header behalten).
3. Melden die Logs etwas, erst die Ursache klären — nicht die Policy aufweichen.

### B3 Google Search Console
1. Property für `creadig.de` anlegen.
2. `https://creadig.de/sitemap.xml` einreichen (enthält beide Sprachen, 36 URLs).
3. Nach ein bis zwei Wochen den hreflang-Bericht prüfen: Deutsch und Türkisch
   müssen wechselseitig aufeinander zeigen, sonst wertet Google keines von beiden.

---

## C · MACHT DIE SEITE WAHR (kein Blocker)

| Was | Wohin | Warum es zählt |
|---|---|---|
| Echte meAI-Oberflächen | `public/works/products/meai/` | Solange keine da sind, zeigt die Produktseite keine Screenshots und die strukturierten Daten führen kein `screenshot`-Feld. Kein Mockup als Beweis. |
| 2–3 schriftliche Case-Freigaben | `caseStudies` in `lib/site-data.ts` | Die Fall-Sektionen sind gebaut und verschwinden spurlos ohne Freigabe. |
| 3–5 echte Google-Reviews | `reviews` in `lib/site-data.ts` | Ohne sie kein `aggregateRating`. Erfundene Sterne sind ein Google-Richtlinienverstoß und kosten die Domain. |
| Erster Insight | `lib/insights.ts` | `/insights` nimmt sich selbst aus dem Index, solange nichts veröffentlicht ist. Danach: Newsletter neu bewerten (GROW-4). |
| maqam: Link, Region, Screenshots | `clientWorks` | Steht heute ohne Link und ohne Bild in der Werkschau. |
| Weitere Kunden-Logos | `public/brand/clients/` | Sonst Monogramm statt Logo. |
| Türkische Projekttexte | `work.what`, `work.sector` | Auf `/tr/arbeiten/…` steht der Projektsatz heute deutsch unter türkischer Oberfläche. Maschinell übersetzen wäre eine Aussage, die niemand geprüft hat. |
| Jahreszahlen der Arbeiten | `work.year` | Im Register steht sonst nichts. Ein geschätztes Jahr ist eine erfundene Angabe. |
| Social-Profile | `socialProfiles` | Nur, wenn sie existieren, uns gehören und gepflegt werden. Sonst leer lassen — der Block erscheint dann gar nicht. |

---

## Was zuletzt geprüft wurde (23.08.2026)

- `npm run build` aus leerem `.next`: grün, **54 statische Seiten**.
- Function-Gate: größte Function 23,5 MB von 200 MB.
- `tsc --noEmit`: fehlerfrei. `next lint`: keine Warnungen.
- Alle 26 Seitenrouten plus `sitemap.xml` und `robots.txt` gegen `next start` geprüft — durchgehend 200; unbekannte Pfade in beiden Sprachbäumen 404.
- `/tr/leistungen` im Server-HTML: `<html lang="tr">`, türkischer Titel, Canonical `/tr/leistungen`, `og:locale tr_TR`, türkisches FAQ-Schema, alle internen Links mit `/tr`-Präfix.
- hreflang de / tr / x-default auf beiden Fassungen, wechselseitig; Sitemap trägt dieselben Angaben.
- Sicherheits-Header live geprüft: CSP scharf + Report-Only, `Reporting-Endpoints`, HSTS, `X-Frame-Options`.

**Offen aus dieser Abnahme:** Der Screenshot-Satz (alle Seiten, hell/dunkel,
mobil und Desktop) konnte nicht erstellt werden — die Chrome-Erweiterung war in
dieser Sitzung nicht verbunden. Die Prüfung oben ist textuell und deckt Struktur,
Auslieferung und Kopfdaten ab, **nicht das Aussehen**. Der visuelle Durchgang
steht damit noch aus.
