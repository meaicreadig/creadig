# creaDIG · UTM & Attribution — Playbook

> **Authority:** Spec · MP-E · Stand 29.08.2026
> **Client-Status:** **NICHT gebaut.** Der Server nimmt `utm*` entgegen, die
> Seite sendet sie nicht. Grund unten unter „Das Gate".
> **Regel:** Keine PII in Kampagnenfeldern. Nie.

---

## Das Gate — warum heute nur Spec

Die Datenschutzerklärung zählt heute auf, was ein Formular überträgt:

> „Ihre Angaben — **Name, Betrieb, E-Mail, Telefon und Ihre Nachricht** — an
> unser Postfach info@creadig.de"

Kampagnenherkunft steht dort **nicht**. Und einen Satz weiter oben steht:

> „kein Tracking über Websites hinweg, keine Werbe-Cookies, keine
> Profilbildung"

Sobald der Browser Kampagnenparameter speichert und mit dem Lead versendet,
entsteht eine **neue Datenkategorie im Anfragevorgang**. Sie gehört in die
Erklärung, bevor sie in den Code gehört — sonst steht auf der Seite etwas
anderes, als die Seite tut. Das ist kein Formalismus, das ist Prinzip 03.

**Owner-Freigabe nötig:** ein Satz in `lib/dictionary.ts` →
`legal.privacy.…` (DE **und** TR). Vorschlag als Textbaustein am Ende dieses
Dokuments. Erst danach Punkt „Client-Implementierung".

**Was heute schon geht:** Die Route `app/api/lead/route.ts` akzeptiert
`utmSource`, `utmMedium`, `utmCampaign`, `utmTerm`, `utmContent` — optional,
bereinigt (keine Zeilenumbrüche), und schreibt sie als eigenen Block
`Kampagne:` in die interne Mail. Fehlt alles, steht keine Zeile da.

---

## Das Modell — fünf Größen, nicht fünf Parameter

Der Fehler, den fast jeder macht: nur die fünf `utm_*`-Felder speichern und
sie „Attribution" nennen. Das beantwortet nur eine Frage, und zwar die
unwichtigere.

| Größe | Was sie beantwortet | Herkunft |
|---|---|---|
| **first touch** | Wo hat uns dieser Mensch zum **ersten Mal** gesehen? | UTM/Referrer beim **ersten** Seitenaufruf, danach unveränderlich |
| **last touch** | Was lag **unmittelbar vor** dem Lead? | UTM/Referrer der aktuellen Sitzung |
| **landing page** | Welche Seite war der Einstieg? | erste URL der Sitzung, Pfad ohne Query |
| **referrer** | Wer hat verlinkt? | `document.referrer`, nur Host |
| **lead source** | Welches Formular hat ausgelöst? | `source` im Payload — **existiert bereits** |

**Die Frage in sechs Monaten:** *„Wo hat der Kunde uns zuerst gesehen — und
welcher Kontakt hat ihn zum Betriebscheck gebracht?"* Mit nur `last touch`
gewinnt immer der letzte Klick, und das ist meistens die Marke selbst. Dann
sieht jede Kampagne schlecht aus, die am Anfang steht — und genau die wird
abgeschaltet.

---

## Namensschema

`utm_source` = **wo**, `utm_medium` = **wie**, `utm_campaign` = **warum**.
Alles kleingeschrieben, Bindestriche, keine Umlaute, keine Leerzeichen.

| Feld | Erlaubte Werte (Start) |
|---|---|
| `utm_source` | `google` · `bing` · `instagram` · `linkedin` · `whatsapp` · `newsletter` · `qr-fahrzeug` · `qr-flyer` · `partner-<name>` |
| `utm_medium` | `cpc` · `organic-social` · `paid-social` · `email` · `print` · `referral` |
| `utm_campaign` | `handwerk-betriebscheck` · `bfsg-audit` · `website-festpreis` |
| `utm_content` | Variante: `hero-a`, `hero-b`, `flyer-rueckseite` |
| `utm_term` | nur bei Suchanzeigen: das gebuchte Keyword |

**Verboten in jedem Feld:** Name, E-Mail, Telefonnummer, Kundennummer,
Ortsangabe einer Person. Ein UTM-Wert steht im Klartext in der Adresszeile,
im Verlauf des Browsers und in fremden Server-Logs. Wer dort eine Mail-Adresse
hineinschreibt, hat sie veröffentlicht.

**Interne Links bekommen NIE UTM.** Ein interner Klick mit `utm_source` setzt
die Sitzung zurück und macht die eigene Seite zur Quelle ihrer selbst.

---

## Client-Implementierung (erst nach Owner-Freigabe)

Skizze, damit später niemand improvisiert:

1. **Speicher:** `sessionStorage`, nicht `localStorage`, nicht Cookie.
   Sitzungsdauer reicht für die Frage, überlebt keinen Tab-Schluss, ist kein
   geräteübergreifendes Merkmal — und damit kein „Tracking über Websites
   hinweg", das die Erklärung ausschließt.
2. **Zeitpunkt:** einmal beim ersten Seitenaufruf lesen (`location.search`,
   `document.referrer`), `first touch` nur schreiben, wenn noch nichts da ist.
3. **Übergabe:** `useLeadSubmit` hängt die Felder an — eine Stelle, nicht vier
   Formulare.
4. **Kein Consent-Gate nötig?** Doch, prüfen: Die Felder gehören zum
   Anfragevorgang (Art. 6 Abs. 1 lit. a, dieselbe Einwilligung wie das
   Formular), nicht zur Reichweitenmessung. Das ist die Lesart, die der
   ergänzte Datenschutzsatz tragen muss — sonst gehört es hinter
   `hasConsent("statistics")`.
5. **Länge:** Server kappt bei 120 Zeichen je Feld. Client kürzt nicht extra.

---

## Tracking-Ready-Checkliste

Ads erst, wenn **alle** Punkte grün sind. Ein Euro in Anzeigen vor dieser
Liste ist ein Euro, dessen Wirkung niemand nachweisen kann.

| # | Punkt | Status |
|---|---|---|
| 1 | `lead_submitted` feuert bei jedem Formular | ✅ `lib/track.ts` |
| 2 | `cta_click { cta, location, page }` an den Hauptknöpfen | ✅ `magnetic-button.tsx` |
| 3 | `booking_step { step }` im Termin-Assistenten | ✅ 1–4 |
| 4 | `audit_started` / `audit_completed { score_bucket }` | ✅ Betriebscheck |
| 5 | Conversion-Kette manuell abgenommen | ✅ `conversion-acceptance.md`, 12/12 |
| 6 | Landing für die Kampagne existiert | ✅ `/branchen/handwerk` |
| 7 | **Live-Mail-Selftest** durchgeführt | ⬜ **Owner** — `SELFTEST_SECRET` setzen, `/api/selftest?send=1` |
| 8 | **Datenschutzsatz für Kampagnenherkunft** | ⬜ **Owner** — siehe Textbaustein |
| 9 | UTM-Client gebaut | ⬜ blockiert durch 8 |
| 10 | Vercel Web Analytics: Events im Dashboard sichtbar | ⬜ **Owner** — einmal nachsehen |
| 11 | Zielvorhaben definiert: was ist ein Erfolg? | ⬜ **Owner** — Vorschlag: abgeschlossener Betriebscheck **mit** Lead |
| 12 | Budgetrahmen und Abbruchkriterium | ⬜ **Owner** |

**Punkt 11 ist der wichtigste und wird am häufigsten übersprungen.** Ohne
definierten Erfolg misst man Klicks und nennt es Marketing.

---

## Textbaustein für die Datenschutzerklärung — [VORSCHLAG, Owner prüft]

> **Herkunft Ihrer Anfrage.** Rufen Sie unsere Seite über einen
> Werbe- oder Kampagnenlink auf, enthält die Adresse Angaben zur Herkunft
> (z. B. `utm_source=google`). Diese Angaben speichern wir für die Dauer Ihres
> Besuchs im Speicher Ihres Browsers und übermitteln sie zusammen mit Ihrer
> Anfrage, damit wir wissen, worüber Sie zu uns gefunden haben. Sie enthalten
> keine Angaben zu Ihrer Person und werden nicht über Websites hinweg
> zusammengeführt. Rechtsgrundlage ist dieselbe Einwilligung nach Art. 6
> Abs. 1 lit. a DSGVO, die Sie vor dem Absenden erteilen.

TR-Fassung schreibt der Owner oder wird nach Freigabe des deutschen Textes
gebaut — nicht davor. Zwei Sprachen, eine Qualität (Prinzip 06).

**Rechtlich prüfen lassen.** Dieser Baustein ist ein Formulierungsvorschlag,
keine Rechtsberatung (Grundregel 1).


## Conversion-Definition (MP-E · Spez)

| Stufe | Ereignis / Status | Rolle |
|-------|-------------------|--------|
| Diagnostic | `audit_completed` | Check fertig — Qualität der Diagnose |
| **Primary** | `lead_submitted` + `source=betriebscheck` | Marketing-Erfolg |
| Business (später) | Qualified → Proposal → Won | Sales — erst mit Pipeline-Store |

Nur Klicks zählen ist kein Marketing. Nur `audit_completed` ohne Lead ist kein Umsatzpfad. Beides parallel lesen.
