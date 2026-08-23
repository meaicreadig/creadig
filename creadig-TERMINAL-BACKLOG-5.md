# creaDIG — Terminal-Backlog 5 · Vertriebsfähig machen

**Datum:** 2026-08-22 · **Branch:** `feat/system-haus-site` · **Grundlage:** `KIZILELMA-creaDIG.md` §9

**Warum dieser Backlog:** Die Seite hat in Jahren null Anfragen erzeugt. Nicht wegen Design —
weil sie nicht live ist, kein Formular zustellt, keine deutsche Rufnummer trägt und Preise nennt,
die es nicht mehr gibt. Dieser Backlog macht sie verkaufsfähig. Nichts anderes.

**Reihenfolge ist zwingend:** V1 → V2 → V3 → V4 → V5. V6 erst nach dem ersten Abschluss.
**Ein Paket pro Terminal-Lauf.** Nach jedem Paket: `build` grün, Commit, Ausgabe zurück an den Chat.

---

## V1 · Wahrheit — Daten und Texte in Ordnung bringen

*Kein Layout, kein Design, keine neue Komponente. Nur `lib/` und Löschungen.*

### V1-a · Eigene Projekte sind kein Kundenwerk
- `lib/site-data.ts`: **NÛR** und **Bir Damla Hayır** aus `clientWorks` entfernen.
  NÛR ist Emins eigenes Produkt, Bir Damla Hayır das Projekt seiner Frau und nicht in Nutzung.
  Beide gehören — wenn überhaupt — zu `productWorks`, mit ehrlichem Zustand.
- **Rumi's Maison** bleibt vorerst stehen, bekommt aber `[OWNER-BESTÄTIGUNG AUSSTEHEND]` als Kommentar
  im Code. Nicht löschen, nicht bewerben.
- Wenn `clientWorks` dadurch leer wird: die Sektion rendert `null` — **das ist der ehrliche Zustand.**
  Keine Platzhalter, keine erfundenen Einträge.
- **Acceptance:** Kein eigenes Produkt steht mehr als „Kundenwerk". `build` grün.

### V1-b · Preise auf die neue Leiter
- `lib/site-data.ts` `packages`: die drei Pakete (`€350` / `€500 MON` / `€1.500 MON`) ersetzen durch
  **ein** Projektangebot **„ab 2.400 € netto — Referenzpreis für die ersten zwei Betriebe"**
  und einen Hinweis, dass der Regelpreis danach **3.900 € netto** ist. Beides sichtbar, beides ehrlich.
- `lib/site-data.ts` `retainer`: die vier `null`-Felder füllen —
  `price: "€149"`, `amount: 149`, `description` und `includes` mit den vier realen Leistungen:
  Hosting und Sicherheitsupdates · bis zu 2 Inhaltsänderungen im Monat · Google-Profil aktuell halten ·
  Rückruf am nächsten Werktag. `retainerPublished` muss dadurch `true` werden.
- `lib/dictionary.ts` FAQ-Antwort zum Preis (DE **und** TR) auf die neuen Zahlen ziehen.
- Alle Preisangaben durchgängig **netto, mit „zzgl. 19 % USt."**
- **Acceptance:** `grep -rn "350\|€500\|1.500" lib/` findet keinen alten Preis mehr.
  Der Betreuungsblock rendert sichtbar. `hasOfferCatalog` in `app/layout.tsx` trägt die neuen Werte.

### V1-c · Attrappen-Chat entfernen
- `components/ai-assistant.tsx` löschen, Import in `app/layout.tsx` entfernen,
  `chat`-Block aus `lib/dictionary.ts` (DE und TR) entfernen.
- Grund: Der Chat ist keine KI (`TODO: API — …`, `demoNote: "Demo-Antworten"`), nennt die
  **alten Preise** und verweist auf die **Schweizer Nummer**. Ein Anbieter, der mit KI wirbt und
  eine Attrappe zeigt, beschädigt genau die Kompetenz, für die sie gebaut wurde.
- **Acceptance:** Kein schwebender Chat-Knopf mehr. `build` grün, keine toten Imports.

### V1-d · „Im Aufbau" verschwindet als sichtbarer Zustand
- `lib/site-data.ts` `productWorks`: `outcome: "Im Aufbau"` (3×) durch eine Zustandsaussage ersetzen,
  die nicht nach Baustelle klingt — z. B. `"Eigenes Produkt · meai.run"` bzw. `"Eigenes Produkt"`.
- `/produkte` aus der **Hauptnavigation** nehmen (`lib/site-data.ts` `mainNavLinks`).
  Route und Detailseiten bleiben bestehen — sie sind Kompetenzbeweis für Software-Kunden,
  aber nicht das Erste, was ein Handwerker sieht.
- **Acceptance:** Kein „Im Aufbau" mehr im gerenderten HTML. `/produkte` weiter erreichbar, aber nicht im Menü.

### V1-e · Unbelegte Zertifizierungen entfernen (HÖCHSTE PRIORITÄT in V1)

**Owner-Aussage vom 22.08.2026: Es besteht KEINE der vier Mitgliedschaften/Listungen.**
Nicht BAFA, nicht iuk, nicht AVPQ, nicht AGD.

- `lib/site-data.ts` `certifications`: **alle vier Einträge entfernen**, Array auf `[]` setzen.
  Folge demselben Muster und derselben Kommentar-Haltung, mit der go-digital bereits entfernt
  wurde (der Kommentarblock direkt über `export const certifications` ist die Vorlage).
  Neuer Kommentar sinngemäß: *Die vier Einträge standen hier ohne Nachweis. Ein Nachweis, den
  man nicht nachschlagen kann, ist in einer Liste mit der Überschrift „Geprüft. Zugelassen.
  Eingetragen." das Gegenteil dessen, wofür die Liste da ist. Zurück kommt jeder Eintrag
  einzeln — mit Datum der Bestätigung.*
- **Drei Rendering-Stellen prüfen**, alle müssen bei leerem Array sauber verschwinden statt zu brechen:
  1. `components/sections/proof-line.tsx:33` — Nachweis-Leiste auf der Startseite
  2. `components/sections/certifications.tsx:50` — Block auf `/unternehmen`
  3. `app/_routes/unternehmen.tsx:61` — **schema.org `hasCredential`**. Bei leerem Array darf
     kein leeres `hasCredential: []` an Google gehen — Feld ganz weglassen.
- `app/(de)/status/page.tsx:198` prüft `certifications.length > 0`. Diese Prüfung muss ihren
  Sinn behalten: nicht auf „grün" zwingen, sondern als offener Punkt stehen bleiben.
- **Nebenbefund, gleich mitnehmen:** Der iuk-Link ist ohnehin falsch —
  `https://www.iuk-os.de` statt korrekt `https://www.iukos.de`.
- **Acceptance:** `grep -rn "BAFA\|AVPQ\|AGD" lib/ components/ app/` findet keinen Werbe-Claim
  mehr. Startseite und `/unternehmen` rendern ohne Lücke oder Layout-Bruch. Kein `hasCredential`
  im ausgelieferten JSON-LD. `build` grün.

### V1 — Nicht tun
- ❌ Keine Farb-, Typo-, Abstands- oder Button-Änderungen. Design ist in V1–V5 gesperrt.
- ❌ Keine erfundenen Referenzen, Zitate oder Zahlen als Platzhalter.
- ❌ Kein Push nach `main`.

---

## V2 · Erreichbarkeit — der Boden des Trichters

*Ohne dieses Paket ist jeder Euro Werbung verbrannt.*

**Owner liefert vorher:** die **deutsche Rufnummer**. Ohne sie kann V2-a nicht abgeschlossen werden.

### V2-a · Deutsche Rufnummer überall
- `lib/site-data.ts` `contact`: deutsche Nummer ergänzen. Die Schweizer WhatsApp-Nummer
  (`+41 76 504 58 79`) bleibt als WhatsApp-Weg, ist aber **nicht mehr die Hauptnummer**.
- `imprintDetails.phone` füllen (steht heute auf `null`, deshalb rendert der `tel:`-Link nie).
- schema.org `telephone` in `app/kontakt/page.tsx` und `app/layout.tsx` auf die deutsche Nummer —
  heute meldet die Seite `+41…` bei `addressCountry: "DE"`.
- Nummer als `<a href="tel:…">` sichtbar in: Kopfleiste (auch mobil), Kontaktseite, Fußzeile.
- **Acceptance:** Von einem fremden Handy anrufen — es klingelt. `tel:`-Link auf 375 px sichtbar.

### V2-b · Ein Formular, das wirklich zustellt
- `app/api/anfrage/route.ts` anlegen. Felder: Name, Betrieb, **Telefon (Pflicht)**,
  **E-Mail (Pflicht)**, Nachricht. Versand an `info@creadig.de` plus Bestätigungsmail an den Absender.
  Mailweg: Resend oder SMTP über Umgebungsvariablen — **keine Zugangsdaten im Code**.
- `components/sections/contact.tsx`: die fehlenden Felder **E-Mail und Telefon** ergänzen
  (heute nur `name`, `business`, `message`) und `onSubmit` auf den Serverendpunkt umstellen.
  WhatsApp bleibt als **zweiter** Knopf daneben, nicht als einziger Weg.
- Einfacher Spam-Schutz: verstecktes Honeypot-Feld. **Kein Captcha.**
- **Acceptance:** Testabsendung von einem fremden Gerät → Mail liegt in `info@creadig.de`,
  Bestätigung kommt beim Absender an. Bei abgeschaltetem Netz erscheint eine Fehlermeldung, kein Erfolg.

### V2-c · Keine falsche Erfolgsmeldung mehr
- `components/termin/termin-wizard.tsx`: Der Erfolgsschritt wird heute per
  `setTimeout(() => setStep(5), 800)` gezeigt — unabhängig davon, ob WhatsApp geöffnet oder
  gesendet wurde. Der Interessent glaubt, er habe angefragt, und wartet auf einen Rückruf,
  der nie kommt. **Erfolgsschritt erst nach Bestätigung des Serverendpunkts aus V2-b.**
- Denselben Datenschutz-Baustein wie in `contact.tsx` (Pflicht-Checkbox `privacyOk` + `handoffNote`)
  in den Wizard einsetzen — die Wörterbuch-Einträge existieren bereits in DE und TR, sie werden nur nicht benutzt.
- Validierungsfehler: zum ersten ungültigen Feld scrollen und dort fokussieren
  (heute steht die Meldung am Seitenanfang, weit über dem Knopf — der Klick wirkt kaputt).
- **Acceptance:** Wizard ohne Serverantwort zeigt keinen Erfolg. Fehlermeldung ist ohne Scrollen sichtbar.

### V2 — Nicht tun
- ❌ Kein Captcha, keine Registrierung, kein Login.
- ❌ Keine Mail-Zugangsdaten im Repo — nur Umgebungsvariablen.
- ❌ WhatsApp nicht entfernen. Nur entthronen.

---

## V3 · Livegang — die Seite muss erreichbar sein

*Ohne dieses Paket sind V1, V2 und V4 unsichtbar.*

**Owner liefert vorher:** Rechtsform · **Kleinunternehmer oder Umsatzsteuer-ID** ·
Verantwortlicher nach § 18 Abs. 2 MStV · deutsche Rufnummer (aus V2).

### V3-a · Deployment-Fehler beheben
- Das aktuelle Deployment steht auf **ERROR**: `The Vercel Function "produkte/[slug]" is 254.69mb
  uncompressed which exceeds the maximum uncompressed size limit of 250mb.`
- In `next.config.ts` `outputFileTracingExcludes` ergänzen für `./_legacy/**`, `./.claude/**`,
  `./design-mockup/**`. Danach die tatsächliche Funktionsgröße prüfen.
- Zusätzlich: `git rm -r --cached _legacy && echo "_legacy/" >> .gitignore` —
  6,5 MB versionierter Altbestand, von keiner Quelldatei importiert, ESLint schließt ihn ohnehin aus.
  Der Ordner bleibt lokal erhalten.
- **Acceptance:** Preview-Deployment auf `feat/system-haus-site` steht auf **READY**, nicht ERROR.

### V3-b · Impressum vollständig
- `lib/site-data.ts` `imprintDetails`: `legalForm`, `vatId` **oder** `smallBusiness`,
  `mstvResponsible`, `phone` füllen. Solange sie `null` sind, ist `imprintComplete === false`
  und die Seite schreibt sichtbar: *„Diese förmlichen Angaben ergänzen wir, sobald der Inhaber
  sie freigegeben hat."* Das ist ein Abmahnrisiko nach § 5 DDG mit mitgeliefertem Nachweis —
  und Meta verlangt ein vollständiges Impressum auf der beworbenen Seite.
- Abschnitt Verbraucherstreitbeilegung ergänzen (§ 36 VSBG):
  *„Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
  Verbraucherschlichtungsstelle teilzunehmen."* **Keinen Link zur EU-ODR-Plattform setzen** —
  die wurde zum 20.07.2025 eingestellt.
- Datenschutzerklärung: Speicherdauer ergänzen (fehlt komplett, Art. 13 Abs. 2 lit. a DSGVO) —
  Server-Logs 30 Tage · Anfragen 6 Monate nach letztem Kontakt, bei Vertrag die handels- und
  steuerrechtlichen Fristen. DE **und** TR.
- **Acceptance:** Der Pending-Hinweis ist verschwunden. Alle Pflichtangaben stehen.

### V3-c · Nach `main` und auf die eigene Domain
- `feat/system-haus-site` nach `main` mergen und pushen. **Erst nach V3-a**, sonst geht der Merge ins Leere.
- In Vercel: `creadig.de` als Domain hinzufügen, DNS beim Registrar setzen.
  **Solange die Domain nicht hängt:** `NEXT_PUBLIC_SITE_URL=https://creadig.vercel.app` in Vercel setzen,
  sonst liefern Sitemap, robots, Canonicals und OG-Bilder eine Adresse aus, die das Projekt nicht bedient.
- Vercel → Settings → General → Framework Preset explizit auf **Next.js**.
- Vercel → Notifications → „Deployment Failed" per E-Mail an `info@creadig.de`.
- **Acceptance:** `creadig.de` lädt im Inkognito-Fenster die neue Seite, nicht die alte HTML-Version.

### V3 — Nicht tun
- ❌ Kein Force-Push.
- ❌ Nicht mergen, solange das Preview-Deployment auf ERROR steht.
- ❌ Keine erfundene Umsatzsteuer-ID. Wenn Kleinunternehmer, dann der Kleinunternehmer-Hinweis.

---

## V4 · Nische — die Seite spricht endlich mit dem Handwerker

### V4-a · Startseite sagt Zielgruppe, Ort und Preis
- Hero-Subline in `lib/dictionary.ts` (DE/TR/EN): heute
  *„creaDIG entwickelt Marken, digitale Systeme, Automatisierung und eigene Softwareprodukte."*
  → ein Satz, der **Handwerk + Osnabrück + Ergebnis** nennt. Vorlage aus KIZILELMA §9.4.
- **Preiszeile direkt unter die Hero-Chips:** „ab 2.400 € netto · in 4 Wochen online".
  Der Code-Kommentar in `app/page.tsx` sagt heute „Preise stehen gar nicht mehr hier" —
  für diese Zielgruppe ist das ein Verkaufshindernis, kein Positionsgewinn.
- **Bewerber-Winkel** als zweiter Nutzenblock: „Ihre Seite ist die erste, die ein Bewerber anschaut."
- **Acceptance:** 30-Sekunden-Test — ein fremder Leser nennt Zielgruppe, Preis und nächsten Schritt.

### V4-b · Lokal auffindbar
- `app/layout.tsx`: JSON-LD von `Organization` auf **`ProfessionalService`** heben,
  mit `geo`, `priceRange`, `image`, `openingHoursSpecification` und deutscher `telephone`.
- `app/page.tsx` bekommt eine **eigene `metadata`** (erbt heute den ortlosen Root-Titel):
  Title „Webdesign für Handwerksbetriebe in Osnabrück — creaDIG".
- `lib/service-pages.ts`: **„Osnabrück" in `metaTitle`** von `webdesign`, `corporate-design`
  und `website-handwerk` (heute 0 von 5).
- **Acceptance:** `grep -c "Osnabrück" lib/service-pages.ts` ≥ 3. JSON-LD validiert.

### V4-c · Fehlerseiten auf Deutsch
- `app/not-found.tsx` und `app/global-error.tsx` anlegen — im Seitendesign, deutscher Text,
  Links auf Startseite und Kontakt. Heute zeigt ein Tippfehler das englische
  „This page could not be found" ohne Navigation und ohne Kontaktweg.
- **Acceptance:** `/gibtsnicht` zeigt eine deutsche Seite mit Kontaktweg.

---

## V5 · Landing + Messung — erst wenn V1–V4 stehen

- `app/angebot/website-handwerk/page.tsx`: **ein** Angebot, **ein** Formular, keine Navigation.
  Copy liegt im Chat-Report vor. Impressumslink im Fuß (Meta-Pflicht).
- `@vercel/analytics` installieren und an die Kategorie `statistics` in `lib/consent.ts` hängen —
  die Kategorie existiert bereits und ist heute leer. Danach `CONSENT_VERSION` hochzählen.
- Meta-Pixel auf der Landing, Ereignis **„Anfrage"** beim erfolgreichen Formularversand.
- **Acceptance:** Eigene Testanfrage erscheint innerhalb von 30 Minuten im Ads-Manager.

---

## V6 · Türkische Route — NICHT vor dem ersten Abschluss

504 TR-Schlüssel sind gepflegt, aber über keine URL erreichbar (`?lang=tr` + localStorage,
`<html lang="de">` fest, null `hreflang`, null TR-URLs in der Sitemap). Der Vorteil ist echt,
der Ausbau kostet ~3 Personentage — **für eine Zielgruppe ohne einen einzigen gemessenen Besucher.**
Erst wenn Kunde 1 unterschrieben hat: `app/[locale]`-Segment, `alternates.languages`, TR in der Sitemap.

---

## Start

Lies diese Datei und `KIZILELMA-creaDIG.md` §9. Arbeite **genau ein Paket** ab,
in der Reihenfolge V1 → V2 → V3 → V4 → V5.
Nach jedem Teilschritt: `npm run build` muss grün sein. Ein Commit pro Teilschritt (V1-a, V1-b, …).
**Nicht nach `main` pushen** — außer in V3-c, und dort erst nach grünem Preview-Deployment.
Am Ende des Pakets: kurze Zusammenfassung, was geändert wurde und was nicht ging.
