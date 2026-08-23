# creaDIG — GESAMTANALYSE

**Stand:** 22.08.2026 · **Branch:** `feat/system-haus-site` · **Commits:** 101

> Diese Datei bündelt **alles**: das technische Produkt-Audit (12 Lanes), das Marketing- &
> Sales-Audit (13 Lanes) und alles, was im Gespräch danach geklärt wurde.
> Sie ersetzt keine der bestehenden Dateien, sondern führt sie zusammen:
> `KIZILELMA-creaDIG.md` (Haltung + Satış-Omurga §9) · `OMURGA.md` (Backbone) ·
> `creadig-TERMINAL-BACKLOG-5.md` (die Arbeitspakete V1–V6).

**Regeln, nach denen diese Analyse entstanden ist:**
Jeder Befund hat **Ort · Beweis · Wirkung · Fix · Aufwand**. Was nicht im Code oder in einer
Owner-Aussage belegbar war, steht als `[ANNAHME]` oder `[UNBEKANNT]` — nichts wurde mit
Plausiblem aufgefüllt. Keine erfundenen Referenzen, Zitate, Zahlen oder Wettbewerbernamen.

**Bewertung:** Score = (Wirkung 1–5 × Dringlichkeit 1–5) ÷ Aufwand in Personentagen (PT).

---

# 0 · DAS URTEIL

| Frage | Antwort |
|---|---|
| Ist die Seite verkaufsfähig? | **Nein** — nicht wegen Design, sondern weil sie nicht live ist |
| Größte Stärke | Zweisprachigkeit DE/TR + Emin ist selbst Unternehmer (Bau/Glasfaser) |
| Größte Schwäche | **Null zeigbare Kundenreferenzen** und kein Kanal, der eine Anfrage zustellt |
| Größtes Risiko | Werbung schalten, bevor Impressum, Rufnummer und Formular stehen |
| Wichtigster nächster Schritt | Live gehen · deutsche Rufnummer · Preise korrigieren — **dann** Vertrieb |

**Die eine Zahl, die alles erklärt:** Der erlaubte Kundenakquisekosten-Wert liegt bei **800 €**,
der erwartete bei **375 €**. Das Budget ist nicht der Engpass.
**Der Engpass ist, dass es keinen Ort gibt, an dem ein Lead landen könnte.**

---

# 1 · KONTEXT & FAKTENBASIS

## 1.1 Technischer Stand (aus dem Repo verifiziert)

| Feld | Wert |
|---|---|
| Stack | Next.js 15 App Router · TypeScript · Tailwind v4 · framer-motion 13 · radix-ui |
| Art | Rein statische Marketing-Site. **Keine API-Routen, keine Datenbank, kein Login** |
| Routen | `/` `/leistungen(+[slug])` `/produkte(+[slug])` `/arbeiten(+[slug])` `/insights` `/kontakt` `/termin` `/unternehmen` `/impressum` `/datenschutz` |
| Daten | Alles in `lib/`: `site-data.ts` · `dictionary.ts` (504 Schlüssel DE+TR) · `insights.ts` · `product-media.ts` · `service-pages.ts` · `consent.ts` |
| Build | `Compiled successfully in 7.1s` · `31/31` Seiten statisch |
| First Load JS | Startseite **203 kB** (198 kB gemessen), geteilter Sockel 103 kB |
| `"use client"` | **52 von 87** tsx-Dateien (60 %) |
| public/ | 7,3 MB · davon `public/works` 6,7 MB (fünf PNG à 1024×1024) |
| Hosting | Vercel, Team-Scope `team_FqD4awCyGrguY68scIPaxKJx`, Node 24.x |

## 1.2 Geschäftlicher Stand (vom Owner bestätigt)

| Feld | Wert |
|---|---|
| Leads über die Website | **0**, seit Jahren |
| Höchster Einzelauftrag je | **unter 2.500 €** · die meisten 50–1.000 € |
| Warmes Netzwerk (Unternehmer) | **unter 10** |
| Lieferkapazität | **4+ Projekte/Monat** |
| Werbebudget bereit | **5.000 €** (bewusst nicht für Coaching) |
| Zielgruppe | Handwerksbetriebe Umkreis Osnabrück · deutsch-türkische KMU |
| Märkte | 1. Deutschland → 2. Schweiz → 3. Europa |
| Zeit | Begrenzt — der Glasfaser-/Baubetrieb läuft nebenher |

## 1.3 Was ungeklärt ist

- `[UNBEKANNT]` **go-digital-Status** — autorisiert, beantragt, oder gar nicht? Bis zur Klärung in keiner Copy.
- `[UNBEKANNT]` **Rumi's Maison** — echter zahlender Kunde?
- `[UNBEKANNT]` **Kleinunternehmer oder Umsatzsteuer-ID?**
- `[UNBEKANNT]` Vercel-Tarif und Rechnungsbetrag · Domain-Registrar · DNS-Ziel von creadig.de
- `[UNBEKANNT]` Zykluszeit vom Erstkontakt bis Unterschrift · Abschlussquote · Website-Traffic (keine Messung im Projekt)

## 1.4 Deaktivierte Lanes

- **A6 Datenbank & Datenmodell** — deaktiviert. Es existiert objektiv keine Datenbank, keine Migration, kein Query. Alle Daten sind statische TypeScript-Objekte in `lib/`.
- **A8 Teilbereich AuthN/AuthZ, Session, SQL-Injection** — deaktiviert. Kein Login, keine API-Route, keine Datenbank. Das reale Risiko liegt vollständig in Rechtstexten, Consent und dem WhatsApp-Übergabepunkt.

---

# 2 · TEIL A — TECHNISCHES AUDIT

## 2.1 Die kritischen Befunde (KRITISCH)

### [A7-1] Produktion zeigt die alte Statik-Seite | KRITISCH
**Klartext:** Was Kunden unter der Vercel-Adresse sehen, ist die alte HTML-Seite von Mitte August — die komplette neue Seite war nie live.
**Ort:** Branch `main` vs. `feat/system-haus-site`; Vercel-Projekt `prj_EXWR97PCtGzzE7R7FlHxpn7CKjkP`
**Beweis:** `git log --oneline main..feat/system-haus-site | wc -l` → **70**, Gegenrichtung **0**. `git show main:package.json` → `fatal: path 'package.json' exists on disk, but not in 'main'`. Auf `main` liegen `index.html`, `termin.html`, `creadig-faz3.js`. Letztes Production-Deployment: `githubCommitRef: "main"`, SHA `ae76ba6`, 16.08.2026. Alle 11 neueren Deployments: `"target": null` (nur Preview).
**Wirkung:** 70 Commits Arbeit erzeugen null Außenwirkung. Kein Datenverlust, aber 100 % Wirkungsverlust.
**Fix:** Erst A7-2 beheben, dann `main` mergen, dann Production Branch in Vercel prüfen.
**Aufwand:** 0,5 PT · W 5 · D 5 · **Score 50**

### [A7-2] Neuestes Deployment scheitert an Funktionsgröße | KRITISCH
**Klartext:** Der letzte Stand baut durch, lässt sich aber nicht ausliefern — ein Teil ist zu groß für Vercel.
**Ort:** Deployment `dpl_VjUWefrKx51XtR4if16KGbn7NTNt` (SHA `285a110`); Ursache: kein `outputFileTracingExcludes` in `next.config.ts`
**Beweis:** `"state": "ERROR"`. Build-Log wörtlich: `The Vercel Function "produkte/[slug]" is 254.69mb uncompressed which exceeds the maximum uncompressed size limit of 250mb.` Vorheriges Deployment (`a291b53`) war noch `READY` — der Fehler entstand mit dem letzten Commit.
**Wirkung:** Der aktuelle Stand ist nicht deploybar. Ein Merge nach `main` macht die Produktion nicht kaputt, aber der Go-Live findet schlicht nicht statt — beliebig lange, weil niemand benachrichtigt wird.
**Fix:** `outputFileTracingExcludes: { "/**": ["./_legacy/**", "./.claude/**", "./design-mockup/**"] }`. Notlösung: `VERCEL_SUPPORT_LARGE_FUNCTIONS=1`.
**Aufwand:** 0,5 PT · W 5 · D 5 · **Score 50**

### [A7-3] creadig.de hängt nicht am Vercel-Projekt | KRITISCH
**Klartext:** Die eigene Domain ist beim Projekt gar nicht eingetragen, während der Code überall creadig.de an Suchmaschinen meldet.
**Ort:** Vercel-Projekt `creadig`, Feld `domains`; `.env.example`; `app/robots.ts`, `app/sitemap.ts`, `app/layout.tsx` + 9 Seiten
**Beweis:** `"domains": ["creadig.vercel.app", "creadig-muhammed-emin-akyols-projects.vercel.app", "creadig-git-main-…"]` — kein `creadig.de`. `"live": false`. Im Code an 12 Stellen `SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://creadig.de"`.
**Wirkung:** Sitemap, robots, alle Canonicals und OG-Bilder liefern eine Adresse aus, die das Projekt nicht bedient. Google indexiert ins Leere; geteilte Links zeigen falsche Vorschaubilder. SEO startet nach dem Domainumzug bei null.
**Fix:** Domain in Vercel anbinden und DNS setzen — oder bis dahin `NEXT_PUBLIC_SITE_URL=https://creadig.vercel.app` in Vercel setzen. Nicht beides offenlassen.
**Aufwand:** 0,5 PT · W 5 · D 5 · **Score 50**

### [A2-1] Jede Anfrage endet in einer Fremd-App | KRITISCH
**Klartext:** Es gibt kein Formular, das eine Nachricht wirklich verschickt — jeder Weg übergibt den Besucher an WhatsApp oder sein Mailprogramm.
**Ort:** `components/sections/contact.tsx:98` und `:237`; `components/termin/termin-wizard.tsx:230`; kein `api/`-Verzeichnis im Projekt
**Beweis:** `window.open(whatsappHref, "_blank", "noopener,noreferrer")` als einziger Submit-Effekt; zweiter Knopf `window.location.href = mailHref`. `find app -name "route.ts"` → **null Treffer**.
**Wirkung:** Wer am Desktop kein eingeloggtes WhatsApp Web und kein konfiguriertes Mailprogramm hat — bei Handwerksbetrieben mit Webmail der Normalfall — landet auf einer QR-Seite oder es passiert nichts. Die getippte Nachricht ist weg. **Das erklärt „null Leads in Jahren" vollständig.**
**Fix:** `app/api/anfrage/route.ts` mit Mailversand an info@creadig.de plus Bestätigung an den Absender. WhatsApp bleibt als zweiter Knopf.
**Aufwand:** 1,5 PT · W 5 · D 5 · **Score 16,7**

### [A2-2] Keine deutsche Rufnummer, nur Schweizer Handy | KRITISCH
**Klartext:** Ein Handwerksmeister, der anrufen will, findet keine anklickbare Telefonnummer — und die einzige ist eine Schweizer Mobilnummer.
**Ort:** `lib/site-data.ts:763-765`, `imprintDetails.phone: null`; `components/legal/legal-page.tsx:91` rendert nie
**Beweis:** `whatsapp: "+41 76 504 58 79"`, `whatsappHref: "https://wa.me/41765045879"`. Die Kontaktseite meldet `telephone: "+41765045879"` an schema.org, während `addressCountry: "DE"`, Osnabrück steht. `grep -rn "tel:"` → ein Treffer, der wegen `phone: null` nie rendert.
**Wirkung:** Telefon ist bei Handwerk der meistgenutzte Erstkontakt. Eine +41-Nummer ohne deutsche Alternative wirkt wie Auslandsanruf und Briefkastenfirma.
**Fix:** Deutsche Nummer (Osnabrück-Vorwahl mit Weiterleitung), eintragen in `contact`, Impressum, schema.org, und als `tel:`-Link in Kopfleiste, Kontaktseite, Fußzeile.
**Aufwand:** 0,5 PT · W 5 · D 5 · **Score 50**

### [A3-1] Dunkle Bänder sind cremefarben, nicht dunkel | KRITISCH
**Klartext:** Die vier Sektionen, die sich als dunkle Bänder absetzen sollen, sind so hell wie der Rest — der Kontrastsprung, der eine Seite teuer aussehen lässt, fehlt.
**Ort:** `app/globals.css:166-192` (`.section-dark`); verwendet in `impact-band.tsx:14`, `meai-spotlight.tsx:16`, `closing-cta.tsx:36`, `site-footer.tsx:14`
**Beweis:** README fordert warm-anthrazit `#201E1B`. `.section-dark` setzt im Hellmodus `--background: #f3f1ec`. Gerechnet: Seitengrund `#fbfbf9` Luminanz 0,9634 · Band `#f3f1ec` 0,8803 → **Flächenkontrast 1,09:1**. Der Sollwert ergäbe **16,05:1**. Nur `.dark .section-dark` (Zeile 199) setzt tatsächlich dunkel.
**Wirkung:** Die Startseite läuft in einem einzigen Helligkeitsband durch — keine Zäsur, keine Fläche, auf der Gold leuchtet. Das ist die Selbstkritik „nicht premium genug" als messbarer Wert.
**Fix:** In `.section-dark` (Hellmodus) den Tokensatz aus `.dark` (Zeile 112-143) übernehmen: `--background: #201e1b`, `--foreground: #fbfbf9`, `--surface: #2a2723`, `--muted-foreground: #a7a099`, `--line: #35312c`, `--gold: #d3a763`, `--card: #2a2723`.
**Aufwand:** 0,5 PT · W 5 · D 5 · **Score 50** — **aber gesperrt bis nach dem Livegang**

### [A5-1] TR-Inhalt existiert, ist aber nicht adressierbar | KRITISCH
**Klartext:** 504 vollständig gepflegte türkische Texte, aber keine einzige türkische Internetadresse.
**Ort:** `components/locale-provider.tsx:35-48`, `app/sitemap.ts:24-61`, `app/layout.tsx:48`
**Beweis:** Schlüsselvergleich: `DE 504 / TR 504 / fehlend 0`. Im gebauten HTML dagegen: `grep -c "sistem evi" .next/server/app/index.html` → **0**; `grep -o 'hreflang="[^"]*"'` → keine Treffer; `<html lang="de">` fest. Umschaltung nur über `?lang=tr` + localStorage. TR-Text liegt im Client-Bundle (68 kB), das **jeder deutsche Besucher mitlädt**.
**Wirkung:** Der explizite Nischenvorteil DE/TR ist für Suchmaschinen unsichtbar und erzeugt null Reichweite. 504 Schlüssel Arbeit ohne Gegenwert.
**Fix:** `app/[locale]`-Segment mit `generateStaticParams(["de","tr"])`, `alternates.languages`, beide Sprachen in der Sitemap.
**Aufwand:** **5 PT** · W 5 · D 5 → **nach Kreuzprüfung abgeschwächt auf D 2, Score 2,7** (siehe §4)

### [A8-1] Impressum ohne Pflichtangaben — öffentlich als unfertig markiert | KRITISCH
**Klartext:** Das Impressum lässt Rechtsform, Umsatzsteuer-Status und den Verantwortlichen leer und teilt das dem Besucher schriftlich mit.
**Ort:** `lib/site-data.ts:783-800`, gerendert über `components/legal/legal-page.tsx:110-132`
**Beweis:** `legalForm: null`, `vatId: null`, `smallBusiness: null`, `mstvResponsible: null`, `phone: null` → `imprintComplete === false`. Die Seite zeigt sichtbar: *„Diese förmlichen Angaben ergänzen wir, sobald der Inhaber sie freigegeben hat"* (`dictionary.ts:772`).
**Wirkung:** Fehlende Pflichtangaben nach § 5 DDG sind ein klassischer Abmahngrund; das Eingeständnis liefert den Nachweis frei Haus. `[ANNAHME]` Abmahnkosten im niedrigen bis mittleren vierstelligen Bereich. **Zusätzlich: Meta verlangt ein vollständiges Impressum auf der beworbenen Seite** — ohne das ist jede Anzeige angreifbar.
**Fix:** `legalForm: "Einzelunternehmen"`, `vatId` **oder** `smallBusiness: true`, `mstvResponsible`, `phone` setzen. Der Pending-Block fällt dann automatisch weg.
**Aufwand:** 0,25 PT · W 4 · D 5 · **Score 80**

### [A4-1] Genannte Preise widersprechen dem eigenen Angebot | KRITISCH
**Klartext:** Die Seite verkauft an vier Stellen ein Preismodell, das es nicht mehr gibt.
**Ort:** `lib/site-data.ts:626-637`, `lib/dictionary.ts:356` (FAQ), `:864` (Chat), Route `/leistungen`
**Beweis:** `{key:"identity", price:"€350"}` · `{key:"growth", price:"€500", period:"MON"}` · `{key:"architecture", price:"€1.500", period:"MON"}`. Wörtlich in der FAQ: *„Identity €350 einmalig, Growth Partner €500 pro Monat und Architecture €1.500 pro Monat."* Diese Beträge gehen über `hasOfferCatalog` (`app/layout.tsx:165-187`) als strukturierte Daten an Google. `retainer.price = null`.
**Wirkung:** Der niedrigste sichtbare Preis setzt den Verhandlungsanker. **Faktor 11 gegen den Zielpreis.** Das erklärt die bisherige Preishistorie zwischen 50 und 1.000 €.
**Fix:** Auf die Preisleiter aus KIZILELMA §9.3 umstellen. Alle vier Fundstellen in einem Commit, DE und TR.
**Aufwand:** 0,5 PT · W 5 · D 5 · **Score 50**

### [A4-2] Startseite nennt weder Handwerk noch Preis | KRITISCH
**Klartext:** Ein Dachdecker sieht nirgends, dass es hier Websites für seinen Betrieb gibt und was sie kostet.
**Ort:** `app/page.tsx:57-93`, `lib/dictionary.ts:276-292`
**Beweis:** Hero: *„Wir bauen, / was andere / nicht sehen."* Subline: *„creaDIG entwickelt Marken, digitale Systeme, Automatisierung und eigene Softwareprodukte."* Das Wort „Handwerk" steht dreimal in `dictionary.ts` (Zeilen 414, 419, 529) — **keins davon in einer Sektion, die `app/page.tsx` rendert**. Code-Kommentar `app/page.tsx:41`: „Preise stehen gar nicht mehr hier". Osnabrück erscheint erst in Sektion 8 von 10.
**Wirkung:** 30-Sekunden-Test nicht bestanden: weder Zielgruppe noch Preis noch Weg erkennbar.
**Fix:** Hero-Subline auf Zielgruppe + Ort + Ergebnis. Preiszeile unter die Hero-Chips.
**Aufwand:** 1 PT · W 5 · D 4 · **Score 20**

### [A4-3] Referenzen ohne Ergebnis, ohne Jahr, ohne Handwerk | KRITISCH
**Klartext:** Drei Kundenprojekte, keines aus dem Handwerk, und zu keinem steht, was es gebracht hat.
**Ort:** `lib/site-data.ts:279-317` (`clientWorks`), `:429` (`caseStudies`), `:477` (`reviews`), `lib/service-pages.ts:196`
**Beweis:** `year: null` bei allen sechs Werken · `outcome: "Kundenwerk"` dreimal identisch · `caseStudies: CaseStudy[] = []` · `reviews: Review[] = []` · `aggregateRating: null` · `socialProfiles: []` · die Leistungsseite `website-handwerk` hat `workSlugs: []` · NÛR zusätzlich `image: null`.
**Wirkung:** Der stärkste Kaufauslöser fehlt vollständig. Ein Handwerker, der prüft „hat der schon mal für so einen wie mich gebaut", findet die Antwort **nein**.
**Fix:** Siehe Teil C §5.1 — der Befund hat sich im Gespräch verschärft: es gibt **gar keine** Kundenreferenzen.
**Aufwand:** 2 PT · W 5 · D 5 · **Score 12,5**

### [A11-1] Kein LocalBusiness-Schema, keine Stadt im Titel | KRITISCH
**Klartext:** Wer „Webdesign Osnabrück" googelt, findet die Seite nicht — der Ort steht auf keiner verkaufenden Seite im Titel.
**Ort:** `app/layout.tsx:50` und `:142`; `lib/service-pages.ts:89,128,167,212,260`
**Beweis:** Root-Title `"creaDIG — System-Haus für Marke, Web und KI"`. JSON-LD ist `"@type": "Organization"` statt `LocalBusiness`/`ProfessionalService`; kein `geo`, kein `priceRange`, kein `openingHoursSpecification`. **0 von 5** `metaTitle` in `service-pages.ts` enthalten „Osnabrück". `app/page.tsx` hat gar keine eigene `metadata` und erbt den ortlosen Root-Titel. Nur `/kontakt` und `/unternehmen` tragen den Ort — die zwei Seiten, nach denen niemand kaufbereit sucht.
**Wirkung:** `[ANNAHME]` Ohne LocalBusiness-Markup ist die Teilnahme am lokalen Kartenblock ausgeschlossen — das ist keine Rang-, sondern eine Formatfrage. 5 Leistungsseiten treten ausschließlich gegen bundesweiten Wettbewerb an.
**Fix:** `ProfessionalService` mit `geo`, `priceRange`, `image`, deutscher `telephone`. Eigene `metadata` für `app/page.tsx`. „Osnabrück" in drei `metaTitle`.
**Aufwand:** 1 PT · W 5 · D 5 · **Score 25**

### [A11-3] Preise verankern bei 350 statt 3.900 | KRITISCH
Identisch mit **[A4-1]** — von zwei Lanes unabhängig gefunden. Das erhöht die Sicherheit des Befunds.

## 2.2 Die schweren Befunde (HOCH)

### [A2-3] Terminflow meldet Erfolg ohne gesendete Nachricht | HOCH
**Ort:** `components/termin/termin-wizard.tsx:633`
**Beweis:** `onClick={() => window.setTimeout(() => setStep(5), 800)}` — der Timer läuft unabhängig davon, was im WhatsApp-Tab passiert. Schritt 5 zeigt dann `t.termin.done.title` = „Anfrage steht."
**Wirkung:** Der Besucher hat vier Schritte, Kalenderwahl und sieben Felder investiert, glaubt der Termin sei angefragt, und wartet auf einen Rückruf, der nie kommt. Verlorener Lead **plus** aktiver Vertrauensschaden bei genau dem Interessenten, der am weitesten gegangen ist.
**Fix:** Zusammenfassung zuerst an den Server (A2-1), Schritt 5 erst nach dessen Bestätigung. WhatsApp wird zum Zusatzknopf, der den Erfolgszustand nicht mehr auslöst.
**Aufwand:** 0,5 PT · W 5 · D 5 · **Score 50**

### [A2-4] Auf dem Handy kein Handlungsknopf über der Falz | HOCH
**Ort:** `components/site-nav.tsx:174`; `components/sections/hero.tsx:89-97`; `components/sticky-whatsapp.tsx:14`
**Beweis:** Kopf-CTA trägt `hidden … sm:inline-flex` → unter 640px unsichtbar. Sticky-Button erscheint erst bei `window.scrollY > window.innerHeight * 0.6`. `[ANNAHME]` Hero-CTA liegt bei 375×667 unterhalb der Falz — gerechnet aus `pt-32` + `type-display` clamp-Minimum × 3 Zeilen + Abstände ≈ 650px; nicht im Browser gemessen.
**Wirkung:** Über die Hälfte der Besucher kommt mobil und sieht beim Landen keinen einzigen Weg ins Gespräch.
**Fix:** `hidden`/`sm:` am Kopf-CTA entfernen, kompaktes Gold-Feld ab 375px. Oder Sticky-Button ab `scrollY > 0`.
**Aufwand:** 0,25 PT · W 4 · D 5 · **Score 80**

### [A2-5] Fehlermeldung erscheint außerhalb des Sichtfelds | HOCH
**Ort:** `components/termin/termin-wizard.tsx:165-193` gegen `:288-295`
**Beweis:** `if (next === 4 && !validateForm()) return` — kehrt vor `window.scrollTo({top:0})` zurück. Der Fehler-Absatz sitzt unter der Fortschrittsleiste, oberhalb von acht gestapelten Feldern. Die `required`-Attribute laufen ins Leere, weil der Weiter-Knopf `type="button"` trägt (Zeile 715).
**Wirkung:** Der Klick wirkt kaputt — Knopf gedrückt, nichts passiert. Abbruch im letzten Schritt vor der Anfrage.
**Fix:** Zum ersten ungültigen Feld scrollen, Fokus setzen, `aria-invalid`, Feldmeldung direkt unter das Eingabefeld.
**Aufwand:** 0,5 PT · W 4 · D 4 · **Score 32**

### [A3-2] Sektions-Headline ist größer als der Seitentitel | HOCH
**Ort:** `app/globals.css:310-325`
**Beweis:** `type-h1: clamp(2.25rem, 6vw, 4rem)` gegen `type-h2: clamp(2.25rem, 6vw, 5rem)`. Maximum H2 = 80px, H1 = 64px → **H2 ist 125 % der H1**. Minimum identisch → unter 600px rendern beide pixelgleich 36px. Nutzung: 18× h2, 5× h1.
**Wirkung:** Kein Gefälle; jede Sektion schreit so laut wie der Seitentitel. Das ist die technische Ursache hinter „Typografie zu groß" — nicht die absolute Größe, sondern die fehlende Stufe.
**Fix:** `type-h2` → `clamp(1.875rem, 4.2vw, 3.25rem)`. `type-h3` → `clamp(1.375rem, 2.2vw, 2rem)`.
**Aufwand:** 0,5 PT · W 5 · D 4 · **Score 40** — gesperrt bis nach dem Livegang

### [A3-3] Dreizehn handgebaute Gold-Buttons in sechs Größen | HOCH
**Ort:** `components/ui/magnetic-button.tsx:42-69` + 12 Kopien (`site-nav.tsx:174,241` · `ai-assistant.tsx:91,180` · `contact.tsx:203` · `packages.tsx:130` · `certifications.tsx:133` · `cookie-consent.tsx:207` · `service-page-body.tsx:209` · `termin-wizard.tsx:282,634,717`)
**Beweis:** 13 Treffer für `from-gold-soft to-gold`. Gezählte Polsterungen: `px-5 py-3.5` (2×) · `px-6 py-3` · `px-6 py-4` · `px-7 py-3.5` (5×) · `px-8 py-4` · `px-9 py-5` = **6 Maße**. Hover-Kachel 10× wortgleich. 38 hartkodierte Hex-Werte im Markup umgehen `--primary-foreground`. Parallel existiert `components/ui/button.tsx` mit 6 Varianten × 8 Größen bei nur 4 Verwendungen — ein **totes zweites Button-System**.
**Wirkung:** Uneinheitliche Buttongrößen sind das Erste, was ein geschultes Auge als „selbstgebaut" erkennt. Jede Änderung am Haupt-CTA erfordert 13 Dateien.
**Fix:** `MagneticButton` um `size?: "sm"|"md"|"lg"` erweitern (sm `px-5 py-3`, md `px-7 py-3.5`, lg `px-9 py-5`), alle Kopien ersetzen, `button.tsx` löschen.
**Aufwand:** 1,5 PT · W 4 · D 4 · **Score 10,7** — gesperrt bis nach dem Livegang

### [A3-4] Zweite Schriftgrößen-Skala neben der dokumentierten | HOCH
**Ort:** `app/globals.css:369-373` definiert die Regel; verletzt in `hero.tsx:66,80`, `portfolio.tsx:258`, `certifications.tsx:79,82,96`
**Beweis:** `type-*`-Skala: 203 Verwendungen über 11 Ebenen. Parallel rohe Tailwind-Klassen: `text-sm` **84×**, `text-base` 16×, `text-xl` 12×, `text-lg` 8×, `text-2xl` 7×, `text-xs` 3×, `text-3xl` 2× = **132 Verwendungen**. `globals.css:370` kommentiert `type-body` mit „Fließtext-Boden: nie kleiner als 16px" — `text-sm` (14px) und `text-xs` (12px) verletzen das an **87 Stellen**. Summe tatsächlich gerenderter Grade: **20**.
**Wirkung:** Die Skala existiert nur auf dem Papier. Fließtext bei 14px liest sich mobil billig — das Standardmaß jedes Baukasten-Templates.
**Fix:** `type-ui` (15px) ergänzen, alle rohen Größen ersetzen, `text-xs` ersatzlos löschen.
**Aufwand:** 1,5 PT · W 4 · D 3 · **Score 8** — gesperrt bis nach dem Livegang

### [A5-2] Fehlender TR-Schlüssel bricht den Build nicht | HOCH
**Ort:** `lib/dictionary.ts:1645-1647`, `components/locale-provider.tsx:86`
**Beweis:** `export type Dictionary = (typeof dictionary)["de"]` — der TR-Zweig hat keine Typannotation, der Zugriff castet: `t: dictionary[locale] as Dictionary`. **Empirisch geprüft:** Zeile 1609 (`productsLabel` im TR-Footer) gelöscht → `npx tsc --noEmit` → `EXIT:0`, keine Ausgabe. Gegenprobe mit echtem Typfehler liefert korrekt `TS2322`, der Compiler lief also.
**Wirkung:** Jede TR-Lücke wird erst von einem türkischsprachigen Besucher entdeckt. Bei 504 Schlüsseln ist stiller Drift der Normalfall.
**Fix:** Aufgeweiteten Formtyp aus dem DE-Zweig ableiten, TR als `const tr: DictionaryShape = {…}`, `as Dictionary`-Cast entfernen.
**Aufwand:** 1 PT · W 4 · D 5 · **Score 20**

### [A5-3] Werkschau ist strukturell einsprachig | HOCH
**Ort:** `lib/site-data.ts:72-100` gegen `lib/service-pages.ts:46-71`
**Beweis:** `Work` trägt `what: string`, `built: string`, `outcome: string`, `sector: string`. `ServicePage` und `ProductWorld` nutzen im selben Verzeichnis konsequent `Localized = { de: string; tr: string }`. **Zwei konkurrierende Inhaltsmodelle in derselben Datei.**
**Wirkung:** Auf türkischer Oberfläche stehen alle Projektbeschreibungen deutsch — der sichtbarste Beweisteil.
**Fix:** Die vier Felder auf `Localized` heben; der Compiler zeigt danach jede Fundstelle.
**Aufwand:** 3 PT · W 4 · D 4 → nach Kreuzprüfung **zurückgestellt** (siehe §4)

### [A5-4] Weder Fehlerseite noch eigene 404-Seite | HOCH
**Ort:** `app/` — Dateien fehlen
**Beweis:** `find app -name "error.tsx" -o -name "not-found.tsx" -o -name "loading.tsx" -o -name "global-error.tsx"` → **keine Treffer**. Der ausgelieferte Ersatz enthält `404` / `This page could not be found`. Da jede Route ihren Inhalt an eine `"use client"`-Komponente delegiert, fällt bei einer Ausnahme der **gesamte** Seiteninhalt aus.
**Wirkung:** Der teuerste Moment — ein toter Link aus einem QR-Code oder altem Flyer — endet in englischem Systemtext ohne Navigation und ohne Kontaktweg.
**Fix:** `app/not-found.tsx` und `app/global-error.tsx` im Seitendesign, deutsch, mit Links auf Startseite und Kontakt.
**Aufwand:** 1 PT · W 4 · D 4 · **Score 16**

### [A7-4] Kein Alarm, wenn die Seite ausfällt | HOCH
**Ort:** `package.json`, gesamtes `app/`, `lib/`, `components/`
**Beweis:** `grep -rniE "sentry|@vercel/analytics|speed-insights|posthog|plausible|umami|logrocket|bugsnag"` → **keine Treffer**. `lib/consent.ts:7` bestätigt: „es gibt kein Analytics, keine Maps, keine Werbe-Tags". Der ERROR-Zustand des Deployments steht seit 22.08.2026 04:49 unbemerkt.
**Wirkung:** Belegte Ausfallzeit bereits jetzt: der Go-Live-Stand liegt seit 6 Tagen tot im Preview, ohne dass es auffiel. Bei echtem Ausfall erfährt es der Betreiber erst durch einen Anruf.
**Fix:** (1) Vercel → Notifications → „Deployment Failed" per E-Mail. (2) UptimeRobot, kostenloser Tarif, HTTP-Monitor auf `https://creadig.de/` im 5-Minuten-Takt. Zusammen unter einer Stunde, ohne Code.
**Aufwand:** 0,2 PT · W 4 · D 5 · **Score 100**

### [A7-5] Kein Build-Check vor dem Livegang | HOCH
**Ort:** Repository-Wurzel — `.github/` fehlt vollständig
**Beweis:** `ls -la .github` → `No such file or directory`. `package.json` kennt nur `dev`, `build`, `start`, `lint` — kein `test`, kein `typecheck`. `vercel.json` ohne `github`-Konfiguration.
**Wirkung:** Genau der in A7-2 belegte Fall: ein Commit macht den Stand undeploybar und es fällt 6 Tage nicht auf.
**Fix:** `.github/workflows/build.yml` mit `checkout` → `setup-node@v4` (Node 24, weil Vercel `"nodeVersion": "24.x"` meldet) → `npm ci` → `npx tsc --noEmit` → `npm run lint` → `npm run build`. Danach Branch-Schutzregel für `main`.
**Aufwand:** 0,5 PT · W 4 · D 4 · **Score 32**

### [A7-6] Unersetzliche Dateien liegen nur auf dem Mac | HOCH
**Ort:** `.gitignore` Zeilen `*.pdf`, `*.zip`; Dateien im Projektstamm
**Beweis:** `git status --porcelain --ignored | grep '^!!'` listet `creadig_flyer.pdf` (5.600.728 B), `ICO_Bewerbungsbogen_Büro ICO.pdf` (988.403 B), `Archiv_creadig.zip` (12.289.375 B). Time-Machine/Cloud-Sicherung: `[UNBEKANNT]`. Der Code selbst ist gesichert: `origin https://github.com/meaicreadig/creadig.git`, beide Branches synchron.
**Wirkung:** Festplattenschaden = Totalverlust der Flyer-Druckdatei und des ICO-Bogens. Die Redundanz ist nur in eine Richtung intakt.
**Fix:** Drei Dateien heute in einen synchronisierten Cloud-Ordner kopieren. Zusätzlich die 2FA-Wiederherstellungscodes von GitHub offline ablegen — **ein einziges Konto kontrolliert Code und Deployment gleichzeitig.**
**Aufwand:** 0,2 PT · W 3 · D 4 · **Score 60**

### [A8-3] Terminflow schickt Kontaktdaten ohne Einwilligung an Meta | HOCH
**Ort:** `components/termin/termin-wizard.tsx:210-230` und `:625-647`
**Beweis:** `` const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMessage)}` `` mit `waMessage` aus `form.name`, `form.org`, `form.city`, `form.email`, `form.phone`, `form.note`. **Kein Treffer für „Datenschutz" in der gesamten Datei.** Zum Vergleich `contact.tsx:161-190`: Pflicht-Checkbox `privacyOk` **plus** `handoffNote`.
**Wirkung:** Der Wizard erhebt deutlich mehr personenbezogene Daten als das Kontaktformular und informiert schlechter — Art. 13 DSGVO wird am datenintensivsten Punkt verfehlt.
**Fix:** Denselben Baustein wie in `contact.tsx` einsetzen. **Die Wörterbuch-Einträge existieren bereits in DE und TR — es fehlt nur die Verwendung.**
**Aufwand:** 0,5 PT · W 4 · D 5 · **Score 40**

### [A10-1] Rohes img-Tag auf 1,16-MB-PNG, heute stummgeschaltet | HOCH
**Ort:** `components/sections/case-studies.tsx:60`; Werte aus `lib/site-data.ts:303,316`
**Beweis:** Gemessen gegen `next start`: `curl /works/meai.png` → `1.160.554 Bytes | image/png`; dieselbe Datei über `next/image` → `40.996 Bytes | image/webp`. **Faktor 28,3.** Heute inaktiv, weil `approvedCaseStudies` leer ist (`case-studies.tsx:21`).
**Wirkung:** Am Tag der ersten Kundenfreigabe **+1,12 MB** auf der Startseite pro Fall. `[ANNAHME]` bei 1,6 Mbit/s rund +5,6 s. Die Regression wäre unsichtbar, weil sie durch eine Inhaltsänderung ausgelöst wird, nicht durch Code.
**Fix:** `<Image … fill sizes="(max-width: 1024px) 100vw, 33vw" />` — identisch zu `selected-work.tsx:72`, das es bereits richtig macht.
**Aufwand:** 0,25 PT · W 4 · D 4 · **Score 64**

### [A11-4] Wiederkehrender Umsatz ist im Code abgeschaltet | HOCH
**Ort:** `lib/site-data.ts:653-663`
**Beweis:** `export const retainer = { price: null, amount: null, description: null, includes: null }` → `retainerPublished` wertet zu `false`, der Block in `packages.tsx:189` rendert nie. Der eigene Kommentar (`:643-647`) nennt ihn „das, was wiederkehrenden Umsatz trägt".
**Wirkung:** 149 €/Monat × 12 = **1.788 €** pro Kunde und Jahr, die nicht einmal angeboten werden. Bei 10 Kunden: **17.880 €** jährlich. **Vier `null`-Zeilen blockieren das gesamte Erlösmodell.**
**Fix:** `price: "€149"`, `amount: 149`, `description` und `includes` mit den vier realen Leistungen füllen, DE und TR.
**Aufwand:** 0,5 PT · W 4 · D 5 · **Score 40**

### [A11-6] Keine Anzeigen-Landingpage, kein Pixel, keine Messung | HOCH
**Ort:** Routen-Inventar `app/`; `app/termin/page.tsx:5-10`
**Beweis:** `grep` nach `gtag|fbq|Pixel|plausible|@vercel/analytics|SpeedInsights|umami|matomo` → **0 Treffer** (einziger Treffer ist das Wort „Pixel" in einem CSS-Kommentar). `lib/consent.ts:35` kennt die Kategorie `statistics` — die Einwilligung wird eingeholt, aber **nichts gemessen**. Keine Route mit genau einem Angebot und genau einem Ziel.
**Wirkung:** `[ANNAHME]` Ein Meta-Test mit 300 € erzeugt ohne Pixel und ohne Conversion-Ereignis **0 verwertbare Daten** — das Geld ist zu 100 % verloren, unabhängig von der Anzeigenqualität. Ohne Landing-Route landet bezahlter Traffic auf einer Startseite, die sich laut eigenem Code-Kommentar als „Verteiler" versteht.
**Fix:** `app/angebot/website-handwerk/page.tsx` mit einem Angebot und einem Formular ohne Navigation. `@vercel/analytics` an die `statistics`-Kategorie hängen.
**Aufwand:** 2,5 PT · W 4 · D 4 · **Score 6,4**

### [A11-7] Alle Beweisflächen sind leere Arrays | HOCH
**Ort:** `lib/site-data.ts:422`, `:469`, `:700-732`, `:279-315`
**Beweis:** `caseStudies: CaseStudy[] = []` · `reviews: Review[] = []` → `case-studies.tsx:22` rendert `null`. Alle **fünf** Zertifizierungen haben `logoPath: null`; `ls public/badges` enthält nur `README.md`. Alle drei Kundenwerke tragen `outcome: "Kundenwerk"` und `year: null`.
**Wirkung:** Ein Betrieb, der 3.900 € ausgeben soll, findet **null** überprüfbare Ergebnisse.
**Fix:** Siehe Teil C §5.1 — der Befund hat sich verschärft.
**Aufwand:** 1 PT + Wartezeit · W 5 · D 4 · **Score 20**

### [A4-4] /insights ist gebautes Nichts | HOCH
**Ort:** `lib/insights.ts` (57 Z.) · `insights-page-body.tsx` (101 Z.) · `insights-teaser.tsx` (70 Z.) · `site-data.ts:554` · `app/sitemap.ts:50`
**Beweis:** `export const insights: Insight[] = []` mit dem eigenen Kommentar „LEER, und das ist der ehrliche Zustand. TODO (Owner): erste Notiz." Drumherum: Typ mit sechs Pflichtfeldern, zweisprachiger Leerzustand, Navigationsfilter, Sitemap-Gate, Teaser-Sektion — zusammen **~230 Zeilen plus Wörterbucheinträge in DE und TR für null Inhalt**. Zusätzlich `[A5-5]`: es gibt **keine** `[slug]`-Route, ein Beitrag könnte gar nicht geöffnet werden.
**Wirkung:** Reine Bauzeit ohne eine einzige Anfrage. Selbst gefüllt bringt ein Blog bei einem Ein-Personen-Betrieb keine Anfrage, die ein Telefonat nicht schneller bringt.
**Fix:** Löschen — Datei, beide Komponenten, Route, Footer-Link, Navigationsfilter, Sitemap-Zweig, `insightsPage`-Blöcke DE/TR. Das Gerüst ist bei Bedarf in zwei Stunden zurück.
**Aufwand:** 0,5 PT · W 3 · D 4 · **Score 24**

### [A4-5] Vier Produktseiten zeigen nur „Im Aufbau" | HOCH
**Ort:** `lib/site-data.ts:103-158`, `:213-256`; `produkt-page-body.tsx` (433 Z.); `lib/product-media.ts`; `public/works/products/`
**Beweis:** `outcome: "Im Aufbau · live unter meai.run"` (meAI), `"Im Aufbau"` (CASSAMEA), `"Im Aufbau"` (meahv) — **3 von 4**. `story: null` bei allen vier. `public/works/products/` enthält ausschließlich eine README, `productScreens()` liefert für jeden Slug `[]`. Zwei von vier Produktlogos fehlen.
**Wirkung:** Dreimal „Im Aufbau" liest sich als „der ist mit anderen Sachen beschäftigt". 433 Zeilen Template plus Ring-Navigation und Gated-Media-Maschine, die zur Kernzielgruppe nichts beitragen.
**Fix (nach Kreuzprüfung abgeschwächt):** Nicht löschen. `outcome` auf eine Zustandsaussage ohne Baustellen-Klang ändern und `/produkte` aus der **Hauptnavigation** nehmen. Routen bleiben als Kompetenzbeweis für Software-Kunden.
**Aufwand:** 0,5 PT · W 3 · D 3 · **Score 18**

### [A4-6] Anfragetrichter endet in Schweizer WhatsApp | HOCH
Deckungsgleich mit **[A2-1] + [A2-2]** — von zwei Lanes unabhängig gefunden. Zusätzlicher Beleg: Der `/termin`-Assistent umfasst **742 Zeilen** und hat exakt **einen** Ausgang, ohne E-Mail-Fallback.

### [A9-1] Kein Lead wird irgendwo festgehalten | HOCH
**Ort:** Prozessschritt „Lead-Eingang"; `contact.tsx:98`, `termin-wizard.tsx:230`
**Beweis:** Kein CRM, keine Datenbank, keine gespeicherte Anfrage. Der einzige Effekt ist `window.open`.
**Wirkung:** Ohne Spur gibt es kein Nachfassen. `[ANNAHME]` Der Großteil der Abschlüsse im lokalen B2B fällt beim zweiten oder dritten Kontakt — dieser Teil ist heute komplett verschenkt.
**Fix:** **Kein CRM kaufen.** Eine Tabelle mit sechs Spalten: Name · Betrieb · Telefon · Anlass · letzter Kontakt · nächster Kontakt. Sortiert nach „nächster Kontakt". Montags 20 Minuten. Ein CRM lohnt erst ab ~20 Leads/Monat.
**Aufwand:** 0,25 PT · W 4 · D 5 · **Score 80**

## 2.3 Die übrigen Befunde (MITTEL / NIEDRIG)

| ID | Titel | Ort | Beweis (Kern) | Fix | PT |
|---|---|---|---|---|---|
| A2-6 | Zurück-Geste wirft aus dem Wizard | `termin-wizard.tsx:62,68` | Schritt nur im React-State, kein `pushState`, kein `sessionStorage` | Schritt in die URL spiegeln, Formularstand in `sessionStorage` | 0,5 |
| A2-7 | Kontaktseite lenkt vor dem Formular ab | `kontakt-page-body.tsx:33-38,72-112` | 4 gleich große Kacheln, zwei führen zurück ins Blättern; Formular erst ab `:118` | Formular nach oben, „Produkte"/„Arbeiten" als Textzeile darunter | 0,25 |
| A2-8 | Kalender erlaubt Sonntage und vergangene Uhrzeiten | `termin-wizard.tsx:126-163,444-462` | Gesperrt wird nur `date < today`; `SLOTS_INITIAL` ohne Uhrzeitvergleich → um 18:00 ist „09:00 heute" wählbar | Wochenenden und Feiertage sperren, Slots < jetzt+2 h filtern | 0,5 |
| A3-5 | 176 Elemente auf 11px Mono-Versalien | `globals.css:391-404`; `page-header.tsx:63` | `eyebrow` + `text-meta` beide `0.6875rem`; 115 + 33 + 28 = 176 Elemente, **inklusive anklickbarer Brotkrumen** | `eyebrow` → 12px, `text-meta` → 13px, Brotkrumen auf `type-small` | 1 |
| A3-6 | Hover-Übergänge dauern eine halbe Sekunde | verteilt über `components/` | `duration-500` **114×**, dazu 4 weitere Werte = 172 Verwendungen ohne Token; 125 `<Reveal>` à 0.9 s + delay bis 0.24 | `--ease-brand`, `--duration-hover: 200ms` definieren; Hover auf 200 ms, Reveal auf 0.5 s | 0,5 |
| A3-7 | Signatur-Motiv drückt Hero-Text unter AA | `architectural-field.tsx:34,117-118` | `motif-feature` `opacity: 0.5`; gerechnet **4,48:1** für 18px-Subline (AA verlangt 4,5:1); der Schleier ist dort am dünnsten, wo Text steht. `[ANNAHME]` Restdeckung nicht im Browser gemessen | `opacity: 0.34` + zusätzliche `bg-background/70`-Fläche über dem Textbereich | 0,5 |
| A3-8 | Vier Eckenradien trotz dokumentiertem Einzelwert | `globals.css:54-57,95` | `--radius: 0.125rem` deklariert; im Markup `rounded-sm/md/xs/r/l` = 4 nicht-runde Radien aus unangepassten shadcn-Primitiven | Alle auf `rounded-sm` vereinheitlichen | 0,25 |
| A5-5 | Insights-Gerüst ohne Detailroute | `app/insights/` | Kein `[slug]`; `entry.slug` nur als React-`key`; `readLabel` hat **0 Verwendungen** | Entfällt — `/insights` wird gelöscht (A4-4) | — |
| A5-6 | Jede Route liefert Inhalt als Client-Komponente | `locale-provider.tsx:1`, alle `*-page-body.tsx` | **52 von 78** tsx mit `"use client"`; alle zehn Page-Bodies, weil sie `useLocale()` brauchen. First Load JS `/` 203 kB | Wörterbuch aus dem Client-Kontext lösen, Sprache über das Routensegment | 4 |
| A5-7 | `productWorlds` koppelt über ungeprüften Schlüssel | `site-data.ts:213`; `tsconfig.json` | `Record<string, ProductWorld>`; ohne `noUncheckedIndexedAccess` gilt der Zugriff nie als `undefined` → **stille leere Seite** statt Build-Fehler | Schlüssel typisieren, `noUncheckedIndexedAccess: true` | 0,5 |
| A5-8 | Totes Altsystem und neun Prompt-Dateien im Repo | `_legacy/`, Repo-Wurzel | `git ls-files _legacy` (Zählung) → **28**, 6,6 MB; größte Blobs 2,1 MB und 1,99 MB; `.git` = 21 MB. **Korrektur:** `Archiv_creadig.zip`, `creadig_flyer.pdf` und `tsconfig.tsbuildinfo` sind **nicht** versioniert | `git rm -r --cached _legacy`, `_legacy/` in `.gitignore`; Prompt-Dateien nach `docs/` | 0,5 |
| A4-7 | KI-Assistent gibt hartcodierte Fake-Antworten | `ai-assistant.tsx:16`; `layout.tsx:244`; `dictionary.ts:848-872` | `TODO: API — …` (Handler existiert nicht) · `demoNote: "Demo-Antworten"` · **nennt die alten Preise** · Fallback verweist auf die Schweizer Nummer | Widget entfernen; Platz unten rechts für einen Anruf-Button | 0,25 |
| A8-2 | Kein Hinweis zur Verbraucherschlichtung | `legal-page.tsx:53-133` | Kein Treffer für „Schlichtung"/„VSBG" in `dictionary.ts`. **Hinweis:** Ein ODR-Link wäre falsch — die EU-Plattform wurde zum 20.07.2025 eingestellt | § 36 VSBG-Abschnitt ergänzen | 0,25 |
| A8-4 | Datenschutzerklärung nennt keine Speicherdauer | `dictionary.ts:776-800` (DE), `:1545-1570` (TR) | Kein Treffer für „Speicherdauer"/„Löschfrist"/„gelöscht". Sonst überdurchschnittlich sauber: Vercel als US-Auftragsverarbeiter, SCC, Betroffenenrechte korrekt benannt | Server-Logs 30 Tage · Anfragen 6 Monate · Vertragsfälle nach HGB/AO. DE **und** TR | 0,25 |
| A8-5 | Ablehnen-Button optisch schwächer als Annehmen | `cookie-consent.tsx:204-225` | Akzeptieren gefüllt (`from-gold-soft to-gold` + Hover-Wipe), Ablehnen nur Outline. **Sonst vorbildlich:** Ablehnen auf derselben Ebene, Widerruf im Footer, Boot-Skript liest Einwilligung *vor* jedem Zugriff | Beide Knöpfe gleich gewichten | 0,25 |
| A8-6 | Consent-Kategorie „Statistik" ohne Dienst | `consent.ts:35`; `cookie-consent.tsx:188-192` | Banner rendert `notInUse` — „Derzeit nicht im Einsatz". Ein sichtbar leerer Schalter kostet Conversion | `statistics` entfernen, bis Analytics wirklich kommt — **oder** mit A11-6 gleich befüllen | 0,25 |
| A8-7 | Keine CSP, kein X-Frame-Options | `next.config.ts:3-8` | Vier Header vorhanden, `Content-Security-Policy` und `X-Frame-Options` fehlen, HSTS ohne `includeSubDomains`. Ohne Login kein klassisches Clickjacking-Ziel — reales Risiko ist Marken-Missbrauch per iframe | Zwei Zeilen sofort: `X-Frame-Options: SAMEORIGIN`, HSTS `includeSubDomains`. CSP als eigener Schritt | 0,5 |
| A8-8 | Personenbezogene Dokumente im Projektverzeichnis | `.gitignore:2,24`, Projektwurzel | `git check-ignore -v` bestätigt die Regeln. **Repository ist sauber** — einzige historisch hinzugefügte Datei ist `.env.example` ohne Secrets. Restrisiko: `git add -f`, Editor-Plugin, Cloud-Backup | Dateien aus dem Arbeitsverzeichnis in eine getrennte Ablage | 0,1 |
| A10-2 | Startseite lädt 552 KB, davon 198 KB JS | `app/page.tsx` | Build wörtlich: `┌ ○ / 6.25 kB 203 kB` + `shared 103 kB`. Eigene Messung: 12 Chunks, **198,4 KB gzip**; HTML 37.694 B, Schriften 96.552 B, Bilder 227.820 B. **Kosten: 0 €** — alles statisch | `Reveal` als einzige Client-Insel legen statt ganze Sektionen zu markieren | 1,5 |
| A10-3 | framer-motion kostet 40 KB in der Startseiten-Kette | `reveal.tsx:3` + 6 weitere | Gemessen: `40.0 KB gzip` in `chunks/419-….js`, laut Build-Manifest unter `/page` = **20 %** der Startseite | `Reveal` auf IntersectionObserver + CSS-Transition; Rest per `next/dynamic` | 1 |
| A10-4 | Zehn Schriftdateien blockieren den ersten Aufbau | `layout.tsx:20-37` | 6 Schnitte × 2 Subsets = 12 Dateien, 10 als `preload`. **42.936 B allein für JetBrains Mono.** Positiv: `next/font` self-hosted, **kein Google-Request → kein DSGVO-Problem** | Mono auf `weight: ["400"]`, `preload: false` | 0,25 |
| A10-5 | 6,7 MB PNG-Quellen für 378 KB Bedarf | `public/works/*.png` | Fünf PNG à 1024×1024. Mit sharp gemessen: `1741 KB → 126 KB WebP (×13,9)`. **Laufzeit ist nicht betroffen** — `next/image` liefert bereits WebP aus. Betroffen sind Klon und Deploy | Quellen konvertieren, Pfade in `site-data.ts` ziehen | 0,5 |
| A10-6 | 328 KB Bilder, die kein Code aufruft | `public/brand/creadig-logo.png`, `products/cassamea.png` | Keine Referenz im Code; Dimensionen 6967×3917 bzw. 5425×1500 für eine Anzeigehöhe von 28 px | `git rm` | 0,1 |
| A10-8 | Laufende Kosten: keine versteckten Dienste | `package.json`, `.vercel/repo.json` | Keine API-Route, keine DB, kein Zahlungs-/Mail-Dienst, kein Drittskript im HTML. `"orgId": "team_…"` = **Team-Scope, kein persönlicher Account**. Tarif `[UNBEKANNT]` | Vercel → Billing prüfen; bei Ein-Personen-Team Tarif hinterfragen | 0,25 |
| A7-7 | Laufende Kosten nicht aus dem Repo belegbar | `.vercel/repo.json` | Wie A10-8. Belegbar ist nur, was **nicht** kostet | Tarif und letzten Rechnungsbetrag notieren | 0,2 |
| A7-8 | Vercel kennt das Framework nicht | Vercel-Projekteinstellungen | `"framework": null`; `vercel.json` existiert nur auf dem noch nicht gemergten Branch. **Nebenbefund: Git-Hygiene ist sauber** — einziger Treffer ist `.env.example` | Nach dem Merge Framework Preset explizit auf Next.js | 0,1 |
| A11-8 | Startseite wiederholt dreimal denselben Aufruf | `hero.tsx:90`, `closing-cta.tsx:62`, `site-nav.tsx:173,240` | 3× identisches Label „Projekt starten", alle nach `/kontakt`. Dazu **zwei** schwebende Knöpfe gleichzeitig (WhatsApp grün links, Chat gold rechts). `/termin` erscheint auf der Startseite in **0** Sektionen | Hero-Knopf auf `/termin` mit „Termin sichern"; Chat entfernen (A4-7) | 0,5 |

---

# 3 · TEIL B — MARKETING & SALES AUDIT

## 3.1 Angebot, Positionierung, Preis

### [M4-1] Es gibt keinen Positionierungssatz | KRITISCH
**Klartext:** „System-Haus für Marke, Web und KI" sagt nicht, für wen du was tust — nur, dass du vieles kannst.
**Ort:** `app/layout.tsx:50`, Hero `dictionary.ts:276`
**Beweis:** **Gegenteil-Test:** Kein seriöser Wettbewerber würde behaupten, er sei *kein* System-Haus für Marke, Web und KI. Die Aussage ist leer und fliegt raus.
**Wirkung:** Austauschbarkeit ist bei 3.900 € tödlich. Wer nicht unterscheidbar ist, wird über den Preis verglichen — und da verlierst du gegen 29 €/Monat.
**Fix — der Satz (besteht den Gegenteil-Test):**
> *Für Handwerksbetriebe im Umkreis von 60 km um Osnabrück, deren Aufträge und Bewerber bisher nur über Empfehlung kommen, ist creaDIG die Digitalwerkstatt vor Ort: In vier Wochen steht eine Website, über die Anfragen und Bewerbungen tatsächlich eingehen — Texte, Fotos und Google-Profil macht ein Mensch aus Osnabrück selbst, und derselbe Mensch geht danach ans Telefon. Anders als bei Baukasten und Abo-Anbieter gehört die Seite Ihnen, und anders als bei der Werbeagentur reden Sie nicht mit einem Projektmanager.*

Zweiter Satz für die TR-DE-Nische, `[ANNAHME]` separat testen:
> *Für deutsch-türkische Unternehmer, die zwischen deutschen Ämtern und türkischen Kunden stehen, ist creaDIG das Digitalbüro, das beide Seiten ohne Dolmetscher bedient.*

**Aufwand:** 0,25 PT · W 5 · D 5 · **Score 100**

### [M6-1] Kein Risikoumkehr-Element — der Kunde trägt alles | HOCH
**Ort:** Angebotsstruktur, `lib/site-data.ts:626-663`
**Beweis:** `packages` enthält weder Festpreiszusage noch Termin noch Zahlungsstruktur. `retainer` komplett `null`.
**Wirkung:** Wer schon einmal für nichts gezahlt hat, kauft nicht wieder auf Zuruf. Bei einem Preissprung ist Risikoumkehr das billigste Abschlussargument — es kostet nichts, solange geliefert wird.
**Fix — drei Zusagen, alle haltbar:** Festpreis für den vereinbarten Umfang · fester Livetermin 4 Wochen ab Materialeingang · **Zahlung 50 % bei Start, 50 % bei Freigabe des Kunden** · Seite und Zugänge gehören dem Kunden ab Tag eins.
**Aufwand:** 0,25 PT · W 5 · D 5 · **Score 100**

### [M6-3] Preisbegründung fehlt — die Zahl steht nackt da | MITTEL
**Fix — drei Argumente in dieser Reihenfolge:** (1) **Der Kunde rechnet:** „Was ist ein durchschnittlicher Auftrag bei Ihnen wert? … Dann hat sich die Seite nach zwei Aufträgen bezahlt." (2) **Bewerber:** eine Neueinstellung über den Personaldienstleister kostet ein Vielfaches — `[BEWEIS EINSETZEN: reale Vermittlungskosten aus einem Kundengespräch]`. (3) **Eigentum:** 149 € statt 300 € Abo, und die Seite gehört Ihnen.
**Aufwand:** 0,25 PT · W 4 · D 4 · **Score 64**

### Empfohlene Angebotsstruktur

| Baustein | Preis | Zweck |
|---|---|---|
| Digital-Check, 30 Min | **0 €** | Einstieg. Kein Verkaufsgespräch — ein Befund |
| **Website-Paket Handwerk** | **2.400 €** (Kunde 1+2) → **3.900 €** ab Kunde 3 | Website · Karriere-Unterseite · Google-Profil · Texte · Fotoauswahl · Formular, das ankommt |
| Betreuung | **149 €/Monat** | Wiederkehrender Umsatz, Bindung, Zusatzverkäufe |
| Zusatz Fahrzeug/Print | ab 890 € | Kernkompetenz Design, hohe Marge, leichter Nachverkauf |
| Zusatz türkische Fassung | +690 € | Nur bei TR-Kunden. Echter Aufpreis, echte Leistung |

## 3.2 Zielgruppe

### [M2-3] Der stärkste Kaufgrund fehlt komplett: BEWERBER | HOCH
**Ort:** `lib/service-pages.ts` (5 Leistungsseiten), gesamte Copy
**Beweis:** Null Treffer für „Bewerber", „Karriere", „Stellenanzeige" im gesamten Wörterbuch. `[ANNAHME]` Fachkräftemangel als dominanter Engpass im Handwerk — aus der Marktlage abgeleitet, nicht aus eigenen Daten belegt.
**Wirkung:** Du bietest Aufträge an einen Betrieb, der die Aufträge schon hat und niemanden findet, der sie ausführt. **Dein Angebot beantwortet die falsche Frage.** Und: ausgelastete Betriebe sind genau die, die 3.900 € zahlen können.
**Fix:** Zweiter Nutzenstrang: „Ihre Seite ist die erste, die ein Bewerber anschaut." Karriere-Unterseite **im Paket**, nicht als Aufpreis. Gleichzeitig das Preisargument.
**Aufwand:** 0,5 PT · W 5 · D 4 · **Score 40**

### [M2-2] Kein einziges Trigger Event adressiert | HOCH
**Beweis:** Keine Treffer für Übergabe, Nachfolge, Azubi, Bewerber, Fahrzeug, Umfirmierung, Jubiläum.
**Wirkung:** Ohne Anlassbezug ist jede Ansprache „irgendwann mal". Mit Anlassbezug ist sie „jetzt".
**Fix — sechs Anlässe in Anruf, Anzeige und Landing verankern:** Betriebsübergabe · Bewerbersuche · neue Fahrzeugflotte/Rebranding · Konkurrent hat neue Seite · Google-Profil falsch oder fehlt · Betrieb wächst über die Empfehlung hinaus.
**Aufwand:** 0,5 PT · W 4 · D 4 · **Score 32**

### [M2-1] Kaufentscheider ist eine Person, die Seite ist für ein Gremium gebaut | HOCH
**Beweis:** `[ANNAHME]` Betriebe mit 3–20 Mitarbeitern haben kein Marketing-Gremium. Die Seite bietet zehn Sektionen zur anonymen Selbstinformation und einen einzigen Weg ins Gespräch.
**Fix — Haltung, kostet 0 PT:** Die Seite ist ab sofort **Beweisstück für das Gespräch**, nicht Verkäufer. Im Anruf: „Ich schick Ihnen den Link, schauen Sie zwei Minuten drauf, dann reden wir Donnerstag."
**Aufwand:** 0 PT · W 4 · D 5 · **Sofort**

## 3.3 Beweis

### [M3-1] Es gibt kein einziges echtes Kundenwort | KRITISCH
**Ort:** `lib/site-data.ts:469`; keine Anfrage-Historie, kein CRM
**Beweis:** `reviews: Review[] = []`, `caseStudies = []`, `socialProfiles: []`. Keine gespeicherte Anfrage — das Formular speichert nichts.
**Wirkung:** Jede Zeile Werbetext beruht auf Vermutung. Copy aus Vermutung konvertiert schlechter als Copy aus Originalzitaten, und man merkt nie, warum.
**Fix:** In den ersten 10 Telefonaten **eine** Frage stellen und wörtlich mitschreiben: *„Wenn Sie mir in einem Satz sagen müssten, was an Ihrem jetzigen Internetauftritt nervt — was wäre das?"* Nach 10 Antworten die Headline neu schreiben.
**Aufwand:** 0 PT (läuft nebenher) · W 4 · D 5 · **Sofort**

### Rohmaterial — 18 Formulierungen · `[ANNAHME]`, alle unbestätigt

> „Die Seite hat mein Neffe gemacht, vor sechs Jahren." · „Auf dem Handy sieht das aus wie nix." · „Wir kriegen alles über Empfehlung, aber die Alten gehen in Rente." · „Ich find mich bei Google gar nicht." · „Da steht noch die alte Nummer drin." · „Ich hab keine Zeit, mich da reinzusetzen." · „Was soll das denn kosten — ich will keine böse Überraschung." · „Ich hab schon mal 2.000 gezahlt und nix gekriegt." · „Bewerber schauen sich das an und melden sich dann nicht." · „Meine Frau macht das Büro, die hat auch keine Zeit." · „Der ruft nie zurück, so einer." · „Ich brauch keine Schnickschnack-Seite, die soll funktionieren." · „Kann ich das später selbst ändern?" · „Der Wettbewerb aus dem Nachbarort hat jetzt was Neues." · „Bei Google steht was Falsches über uns und ich krieg das nicht weg." · „Ich will einen, den ich anrufen kann." · „Wir sind seit 30 Jahren hier, das soll man auch sehen." · „Erst zahlen und dann sehen wir mal — nicht mit mir."

## 3.4 Wettbewerb

### [M5-1] Der größte Wettbewerber heißt „nichts tun" | HOCH
**Beweis:** `[ANNAHME]` Bei einem über Empfehlung ausgelasteten Betrieb ist Untätigkeit die rationale Wahl — solange kein Trigger Event vorliegt.
**Fix:** Im ersten Anruf auf den Anlass qualifizieren. **Kein Anlass = Wiedervorlage in 6 Monaten, kein Angebot.** Das spart mehr Zeit als jede Automatisierung.
**Aufwand:** 0 PT · W 4 · D 5 · **Sofort**

### [M5-2] Angriffsflächen der echten Alternativen sind ungenutzt | HOCH

| Alternative | Verspricht | Angreifbar bei | Konter (wörtlich) |
|---|---|---|---|
| Baukasten selbst (IONOS/Jimdo/Wix-Klasse) | günstig, sofort, selbst in der Hand | kostet die Zeit des Chefs; Texte und Fotos bleiben liegen; Google-Profil macht niemand | „Der Baukasten kostet 20 € im Monat und drei Wochenenden von Ihnen. Was ist Ihr Samstag wert?" |
| Website-Abo, monatlich | kein Anfangsbetrag | die Seite gehört dem Betrieb nicht; Kündigung = Seite weg | „Fragen Sie, wem die Seite gehört, wenn Sie kündigen. Bei mir gehört sie Ihnen ab Tag eins." |
| Regionale Full-Service-Agentur | Rundum-Betreuung | teurer, langsamer, Ansprechpartner wechselt | „Sie reden mit mir. Nicht mit einem Projektmanager, der nächstes Jahr woanders ist." |
| Neffe / Bekannter | kostenlos | wird nie fertig, keine Verantwortung | „Der macht das nebenbei. Ich habe einen Termin und eine Rechnung — beides bindet mich." |
| Nichts tun | kostet nichts | Bewerber und Kunden prüfen trotzdem | „Ihr nächster Bewerber googelt Sie, bevor er anruft. Was findet er?" |

*Keine erfundenen Firmennamen, keine erfundenen Wettbewerberpreise — nur Anbietertypen.*

## 3.5 Trichter, Kanäle, Prozess

### [M7-3] Es gibt keine Wiedervorlage | HOCH
Identisch mit **[A9-1]**. Fix: die Sechs-Spalten-Tabelle, kein CRM.

### [M8-1] Kanalrangfolge — LinkedIn ist der falsche Kundenkanal | HOCH
**Beweis:** `[ANNAHME]` Aus der Zielgruppendemografie abgeleitet. Handwerksmeister sind nicht auf LinkedIn; wer dort für Handwerk wirbt, redet mit anderen Agenturen.

| Rang | Kanal | Aufwand/Woche | Erwartung `[ANNAHME]` | Startschritt |
|---|---|---|---|---|
| 1 | **Vorab-Entwurf + Telefon** | 5 h (50 Wählversuche) | 3–5 Termine/Woche | Liste 100 Betriebe |
| 2 | **Google-Unternehmensprofil** | 2 h einmalig | Grundlage lokaler Auffindbarkeit | Profil anlegen, 5 echte Fotos |
| 3 | **Partner / Empfehlung** | 2 h | 1–2 Empfehlungen/Monat ab Monat 2 | Steuerberater, Baustoffhändler, Fahrzeugbeschrifter, iuk |
| 4 | **Meta-Ads lokal** | 1 h nach Setup | 15–35 Leads/Monat bei 600 € | erst nach V1–V5 |
| 5 | **TR-Community** | 2 h | `[UNBEKANNT]` | persönlich, nicht digital |
| 6 | **LinkedIn** | 1 h | **Partner, keine Kunden** | Profil-Headline + 1 Post/Woche |
| — | **Kalt-E-Mail** | — | **GESPERRT** | siehe M12-1 |

### [M10-2] Preisnennung ist der ungeübteste Moment | KRITISCH
**Beweis:** Belegte Preishistorie unter 2.500 €.
**Wirkung:** Zögern bei der Preisnennung kostet den Abschluss oder den Preis. Beides gleich teuer.
**Fix:** Den Preissatz auf eine Karte schreiben und neben das Telefon legen. **Regel: Nach dem Preis nichts mehr sagen, bis er antwortet — auch wenn es 15 Sekunden dauert.**
**Aufwand:** 0,1 PT · W 5 · D 5 · **Score 250**

### [M11-2] Unit Economics — alle Werte `[ANNAHME]`, Rechnung offen

| Größe | Wert | Herkunft |
|---|---|---|
| Jahr-1-Wert je Kunde | 3.900 + (149 × 12) = **5.688 €** | Zielpreis |
| Deckungsbeitrag | ~90 % (nur Zeit, kein Material) | Solo-Betrieb |
| Lieferaufwand je Projekt | 5–8 PT `[ANNAHME]` | aus Paketumfang |
| **Erlaubter CAC** | bis **800 €** | konservativ 15 % vom Jahr-1-Umsatz |
| Telefon: Wählversuche je Abschluss | ~50 `[ANNAHME]` | 50 → 15 erreicht → 5 Termine → 1 Abschluss |
| Meta CPL lokal B2B | 15–45 € `[ANNAHME]` | Erfahrungsband, nicht gemessen |
| Abschlussquote Anfänger | 5–15 % `[ANNAHME]` | steigt nach ~30 Gesprächen |
| **CAC über Meta (30 € CPL, 8 %)** | **375 €** | deutlich unter 800 € |
| Kapazitätsgrenze | 4 × 3.900 = **15.600 €/Monat** | Owner-Angabe |
| 5.000 € Ads über 5 Monate | 110–330 Leads → **6–16 Abschlüsse** | 23.400–62.400 € Projektumsatz |

## 3.6 Recht (kein Anwalt, keine Rechtsberatung)

### [M12-1] Kalt-E-Mail an Betriebe ist der riskanteste Kanal — nicht starten | KRITISCH
**Beweis:** § 7 Abs. 2 UWG behandelt E-Mail-Werbung ohne ausdrückliche vorherige Einwilligung als unzumutbare Belästigung — **auch im B2B**; die Bestandskunden-Ausnahme (§ 7 Abs. 3) greift bei Neukunden nicht. Für Telefonwerbung gegenüber sonstigen Marktteilnehmern genügt nach § 7 Abs. 2 Nr. 1 UWG die **mutmaßliche** Einwilligung — ein niedrigerer Maßstab als bei Verbrauchern.
**Wirkung:** Abmahnung plus Unterlassungserklärung. `[ANNAHME]` Größenordnung vierstellig. Für einen Ein-Personen-Betrieb der teuerste Fehler im Plan.
**Fix — Reihenfolge umdrehen:** Telefon zuerst. E-Mail **erst** nach ausdrücklicher Zusage im Gespräch („Darf ich Ihnen das per Mail schicken?"), Datum notieren. Postbrief ist der dritte sichere Weg.
**Aufwand:** 0 PT (Verzicht) · W 3 · D 5 · **Sofort**

### [M12-3] Zertifizierungs-Aussagen ohne Nachweis | HOCH
**Beweis:** Alle fünf Zertifizierungen `logoPath: null`; `public/badges` enthält nur eine README.
**Wirkung:** Zwei Richtungen. Eine nicht mehr aktive Berechtigung zu behaupten ist irreführende Werbung. Gleichzeitig: BAFA #190949, iuk, AVPQ und AGD sind **echt und überprüfbar** und stehen trotzdem ohne Logo da — verschenkter Beweis.
**Fix:** **Vor der ersten Anzeige** jeden Status prüfen, vor allem go-digital. Was aktiv ist: Logo hinterlegen. Was nicht: aus der Copy streichen, nicht abschwächen.
**Aufwand:** 0,5 PT · W 4 · D 5 · **Score 40**

### [M12-4] Preisangabe im B2B | NIEDRIG
**Fix:** Immer „3.900 € netto, zzgl. 19 % USt." Nie „3.900 €" allein, nie „ab ca."
**Aufwand:** 0,1 PT · W 2 · D 3 · **Score 60**

## 3.7 Kreuzprüfung — Roter Agent (M13 / A12)

| ID | Urteil | Begründung |
|---|---|---|
| A7-1/2/3, A2-1/2, A4-1/2, A11-1, A8-1, M4-1, M6-1, M10-2, M12-1 | **BESTÄTIGT** | Beweise stehen im Code oder im Gesetz, nicht interpretierbar |
| M2-3 (Bewerber) | **BESTÄTIGT, hochgestuft** | Angriff „Handwerk sucht Kunden, nicht Bewerber" kippt bei ausgelasteten Betrieben — und genau die zahlen 3.900 €. **Bester Verkaufswinkel des ganzen Audits** |
| A4-5 (Produkte löschen) | **ABGESCHWÄCHT** | Löschen zu hart. Produkte sind Kompetenzbeweis für Software-Kunden. Neu: nur `outcome` ändern + aus der Hauptnavigation nehmen. Routen bleiben |
| A5-1 / M2-4 (TR-Route) | **ABGESCHWÄCHT** | Vorteil echt, Lösung verfrüht. 3–5 PT für eine Zielgruppe ohne einen gemessenen Besucher, während der deutsche Kanal nicht live ist. **Dringlichkeit auf 2, nach dem ersten Abschluss** |
| A5-3 (Work-Typ zweisprachig) | **ZURÜCKGESTELLT** | Hängt an A5-1. Ohne TR-Route wertlos |
| A11-6 / M8-2 (Landing + Ads) | **ABGESCHWÄCHT** | Landing erst in Welle 3 — vorher gibt es keinen bezahlten Traffic, der landen müsste. Pixel-Teil bleibt früh, kostet 20 Minuten |
| A4-4 (`/insights` löschen) | **BESTÄTIGT** | Gegenargument „organische Sichtbarkeit" verliert: 230 Zeilen für null Inhalt, und ein Blog bringt bei 4 Projekten Kapazität keine Anfrage, die ein Telefonat nicht schneller bringt |
| Alle A3-Befunde (Design) | **BESTÄTIGT, aber nachrangig** | siehe unten |

### Widersprüche und ihre Auflösung

1. **Landing + Ads gegen „Formular, das ankommt".** Das Formular gewinnt. Eine Landingpage mit einem Formular, das nichts zustellt, ist eine teurere Version desselben Fehlers.
2. **TR-Ausbau gegen Welle 1.** Welle 1 gewinnt. Drei bis fünf Personentage für eine unbelegte Zielgruppe, während der Hauptkanal nicht live ist — das ist Bauflucht.
3. **„Produkte löschen" gegen die Selbstdefinition als System-Haus.** Kompromiss: Produkte bleiben, verlieren aber Hauptnavigation und den Zustand „Im Aufbau". Identität bleibt, der Handwerker sieht sie nicht zuerst.

### Der am meisten überschätzte Befund

**Alles, was mit dem Aussehen zu tun hat.** Die Design-Mängel sind real und gemessen — 1,09:1 Kontrast, H2 > H1, 13 Buttons in 6 Größen. Sie sind alle nachrangig.

> **Die Seite hat null Leads erzeugt, weil sie nicht live ist und kein Formular hat — nicht weil die Typografie eine Stufe zu groß ist.** Wer in den nächsten 30 Tagen einen Tag an Farben und Abständen arbeitet, für den hat dieses Audit geschadet.

### Die schwächste Stelle des gesamten Vorhabens

Ein Verkaufsproblem wird als Bauproblem behandelt. 101 Commits, 70 davon auf einem Branch, der nie live ging. In derselben Zeit: null Verkaufsgespräche. Es liegen bereits `creadig-TERMINAL-BACKLOG-2/3/4.md` im Repo — **ein weiteres Backlog ist kein Fortschritt, nur ein weiterer Beleg.**

---

# 4 · TEIL C — WAS IM GESPRÄCH GEKLÄRT WURDE

*Dieser Teil enthält Erkenntnisse, die in keinem Code stehen. Sie stammen direkt vom Owner und
korrigieren mehrere Befunde aus Teil A und B.*

## 4.1 Die Referenz-Wahrheit — der härteste Punkt der gesamten Analyse

**Owner-Aussage vom 22.08.2026:**
- **NÛR** — Emins **eigene Plattform**. Kein Kundenprojekt.
- **Bir Damla Hayır** — Projekt **seiner Frau**, im Aufbau, vom „Kunden" nicht in Nutzung.
- **Rumi's Maison** — `[UNBEKANNT]`, vom Owner noch nicht bestätigt.

> **Damit hat creaDIG faktisch NULL zeigbare Web-/Design-Kundenreferenzen.**

**Folge 1 — Code:** In `lib/site-data.ts` stehen alle drei als `clientWorks` = „Kundenwerk".
Das ist sachlich falsch und muss raus. Nicht aus Rechtsgründen, sondern weil es gegen das
Ehrlichkeitsprinzip verstößt: **Wer keine Referenz hat, sagt das, statt eigene Projekte als
fremde auszugeben.**

**Folge 2 — Plan:** Der Befund `[A4-3]` / `[A11-7]` empfahl „ruf die drei Referenzkunden an und
hol Ergebnisse". Diese Maßnahme ist **hinfällig** — es gibt niemanden anzurufen.

**Folge 3 — die eigentlichen Beweise liegen woanders, und sie sind stark:**

| Beweis | Warum er trägt |
|---|---|
| **FIBERO** — reale Auftraggeber/Partner: Deutsche Telekom, Glasfaser NordWest, 1&1, Drillisch | Der belastbarste Nachweis im ganzen Haus |
| **Emin ist selbst Unternehmer** — Bau-/Glasfaserbetrieb mit Subunternehmer | Für einen Handwerksmeister mehr wert als jedes Design-Portfolio. **Der Glasfaser-Job ist kein Nebenschauplatz — er ist die Glaubwürdigkeit** |
| **Verbände (real, prüfbar):** BAFA-Unternehmensberater #190949 · iuk-Netzwerk Osnabrück · AVPQ · AGD | Kostet nichts, steht heute ohne Logo da |
| **go-digital** | `[UNBEKANNT]` — bis zur schriftlichen Klärung in **keiner** Copy |

**Der Verkaufssatz, der daraus folgt:**
> „Ich bin nicht der Werbefritze. Ich hab selber einen Betrieb — Glasfaser, mit einem Subunternehmer. Ich weiß, wie das ist, wenn morgens keiner auf der Baustelle steht. Deswegen bau ich Seiten, die Anfragen und Bewerber bringen, und nicht Seiten, die schön aussehen."

Das kann keine Agentur in Osnabrück sagen. **Das ist die echte Positionierung, nicht „System-Haus".**

## 4.2 Die Preisleiter — korrigiert nach Owner-Widerspruch

Die erste Empfehlung lautete **3.900 € ab sofort**. Der Owner hat widersprochen, und zu Recht:
höchster Auftrag je unter 2.500 €, die meisten zwischen 50 und 1.000 €. Ein Sprung auf 3.900 €
ohne eine einzige Referenz ist kein Preisschritt, sondern eine andere Person.

**Korrigierte Leiter (gesperrt):**

| Stufe | Preis | Bedingung |
|---|---|---|
| Kunde 1 | **2.400 € netto** | „Referenzprojekt", offen benannt: Zitat + Nennung + 2 Fotos als Gegenleistung |
| Kunde 2 | **2.400 € netto** | dito |
| ab Kunde 3 | **3.900 € netto** | erst mit zwei echten Referenzen in der Hand |

**Warum 2.400:** Das hat Emin schon einmal bekommen. Für die ersten zwei Abschlüsse gibt es damit
**gar keinen Preissprung** — der kommt beim dritten. Die Leiter passt zum Menschen, nicht zum
Wunschdenken.

**Der Tausch, wörtlich:**
> „Ich sage Ihnen ehrlich, wie ich rechne: Ich bin gerade dabei, meine Referenzen im Handwerk aufzubauen. Deswegen mache ich die ersten zwei Betriebe für 2.400 € statt 3.900 €. Dafür brauche ich von Ihnen drei Dinge, wenn Sie zufrieden sind: ein paar Sätze, die ich zitieren darf, die Erlaubnis, Ihren Betrieb zu zeigen, und zwei Fotos. Wenn Sie nicht zufrieden sind, kriege ich nichts davon."

**Nicht kostenlos.** Kostenlos entwertet. Ein offen benannter Tausch entwertet nicht.

## 4.3 Der Vorab-Entwurf (Spec-Bau) — die einzige erlaubte Bauflucht

Weil es keine Referenzen gibt, ersetzt ein **selbst gebauter Entwurf für den konkreten Betrieb**
die fremde Referenz — und schlägt sie sogar, weil der Inhaber **seine eigene** Firma sieht.

**Verfahren:** Drei Betriebe aus der 100er-Liste. Je **eine einzige Bildschirmseite** mit ihrem
Namen, ihren Leistungen, ihrer echten Nummer. **Maximal 4 Stunden pro Stück.** Dann Anruf:

> „Usta, ich mach was Ungewöhnliches: Ich hab mir Ihren Betrieb angeschaut und mal gebaut, wie Ihre Seite aussehen könnte. Kein Auftrag, keine Rechnung, ich schick Ihnen einfach den Link. Schauen Sie zwei Minuten drauf, und wenn's Ihnen nichts sagt, ist gut. Darf ich?"

> **Die Regel:** Bauen ist erlaubt — **nur für einen Menschen, dessen Namen und Telefonnummer du hast.** Alles andere Bauen ist Flucht.

## 4.4 v0 — wo es hilft und wo es schadet

| v0 ist stark bei | v0 richtet Schaden an bei |
|---|---|
| **Einzelseiten**, von null — Landing, Demo, Kampagnenseite | Übernahme einer 200-Dateien-Codebasis |
| Layout-Varianten aus Prompt oder Bild | Dem eigenen Tokensystem (`--gold`, `.section-dark`) — v0 zieht auf shadcn-Default |
| Neue isolierte Komponente | 504-Schlüssel-Wörterbuch DE/TR + Consent-Logik |
| Ideenvarianten (drei Hero-Entwürfe) | Markenkonsistenz — Poppins, Gold, Signatur-Motiv |

**Entscheidung:** v0 wird **nicht** eingesetzt, um die bestehende Seite „premium zu machen" —
das ist Wochenarbeit mit dem Ergebnis einer zweiten halben Seite.
v0 wird eingesetzt für **(a) die drei Vorab-Entwürfe** und **(b) die Landingpage
`/angebot/website-handwerk`.** Beides isolierte Einzelseiten, beides direkt verkaufswirksam.

Präzedenz im Repo: `creadig-v0-prompt.md`, `bir-damla-hayir-v0-prompt.md` — der Weg ist etabliert,
er muss nur auf das richtige Ziel zeigen.

## 4.5 Welche Produkte sind verkaufbar?

**A) Dienstleistung — bereits entschieden, keine offene Frage:**
Ein Angebot wird beworben: **Website-Paket Handwerk.** Corporate Design, Medien und Software
bleiben im Portfolio, aber **nicht in der Werbung.**

**B) Die vier eigenen Produkte — hier war tatsächlich nichts entschieden:**

| Produkt | Verkaufbar? | Begründung |
|---|---|---|
| **fibero** (Rechnungs-/Einsatzplanung) | **Einziger echter Kandidat** | Domänenwissen vorhanden · echter, schmerzhafter Bedarf · **Zugang zur Zielgruppe besteht bereits** (andere Glasfaser-/Bau-Subunternehmer) · kein Großanbieter in dieser Nische |
| **meAI** | Heute nein | Horizontales KI-Produkt im Feld der Großanbieter. `[UNBEKANNT]` welchem Käufer es welches Problem löst |
| **CASSAMEA** (Kasse) | Heute nein | Kassensoftware in Deutschland unterliegt TSE/KassenSichV — Zertifizierungsaufwand übersteigt einen Ein-Personen-Betrieb |
| **meahv** (Hausverwaltung) | `[UNBEKANNT]` | Vom Owner nie beschrieben |

> **Aber nicht jetzt.** Kapazität sind 4 Projekte/Monat und aktuell **null** Kunden.
> Zwei Geschäfte gleichzeitig heißt: keines. **fibero wird als „nächste Front" notiert und nach
> den ersten drei Web-Kunden geöffnet** — nicht vorher.

## 4.6 Empfehlungen, die der Owner zurückgewiesen hat — und warum das richtig war

| Ursprüngliche Empfehlung | Owner-Einwand | Bewertung |
|---|---|---|
| „Sag den Preis zehnmal laut" | „Bin ich verrückt?" | **Berechtigt.** Der Kern (nicht stottern) bleibt, die Form war albern. Ersatz: Preissatz auf eine Karte neben das Telefon |
| „Impressum heute ausfüllen" als eigener Punkt | „Die Seite ist noch nicht live" | **Berechtigt.** Das Impressum ist kein eigener Task, es gehört in V3 zum Livegang. Was unabhängig davon geklärt werden muss: Kleinunternehmer oder USt-ID, und die Rufnummer |
| „Ruf die drei Referenzkunden an" | „Das sind gar keine Kunden" | **Berechtigt und folgenschwer.** Siehe §4.1 — der Befund hat den halben Plan gekippt |

## 4.7 Der Arbeitszyklus (vom Owner festgelegt)

| Schritt | Wer | Was |
|---|---|---|
| 1 | Chat | Gibt **ein einziges Paket** aus (V1, dann V2 …). Nie alles auf einmal |
| 2 | Owner | Fügt es ins Terminal ein, Terminal arbeitet |
| 3 | Owner | Klebt die Terminal-Ausgabe zurück in den Chat |
| 4 | Chat | **Türkische Quittung in drei Blöcken:** `Ne yapıldı` · `Şu an durum` · `Sıradaki adım`. Erst danach das nächste Paket |

**Wissen, das bleiben muss:** `KIZILELMA-creaDIG.md` (§9 Satış-Omurga) und diese Datei.
**Arbeit:** `creadig-TERMINAL-BACKLOG-5.md`, Pakete V1–V6.

---

# 5 · PRIORISIERTE GESAMTTABELLE

Score = (Wirkung × Dringlichkeit) ÷ Personentage. Technische und Vertriebsbefunde gemeinsam sortiert.

| # | ID | Befund | PT | W | D | Score | Paket |
|---|---|---|---|---|---|---|---|
| 1 | M10-2 | Preisnennung nicht stottern (Karte ans Telefon) | 0,1 | 5 | 5 | **250** | sofort |
| 2 | M4-1 | Positionierungssatz setzen | 0,25 | 5 | 5 | **100** | V4 |
| 3 | M6-1 | Risikoumkehr: Festpreis, Termin, 50/50 | 0,25 | 5 | 5 | **100** | sofort |
| 4 | A7-4 | Deployment-Alarm + UptimeRobot | 0,2 | 4 | 5 | **100** | V3 |
| 5 | A8-1 | Impressum vollständig | 0,25 | 4 | 5 | **80** | V3 |
| 6 | A2-4 | Mobiler CTA über der Falz | 0,25 | 4 | 5 | **80** | V4 |
| 7 | A9-1/M7-3 | Wiedervorlage-Tabelle (kein CRM) | 0,25 | 4 | 5 | **80** | sofort |
| 8 | A4-7 | Attrappen-Chat entfernen | 0,25 | 4 | 5 | **80** | **V1** |
| 9 | A10-1 | `next/image` in `case-studies.tsx` | 0,25 | 4 | 4 | **64** | V1 |
| 10 | M6-3 | Preisbegründung, drei Argumente | 0,25 | 4 | 4 | **64** | sofort |
| 11 | A7-6 | Unersetzliche Dateien sichern | 0,2 | 3 | 4 | **60** | sofort |
| 12 | M12-4 | Netto-Preisangabe | 0,1 | 2 | 3 | **60** | V1 |
| 13 | A7-1 | Nach `main` mergen | 0,5 | 5 | 5 | **50** | V3 |
| 14 | A7-2 | Deployment-Fehler 254 MB | 0,5 | 5 | 5 | **50** | **V3 zuerst** |
| 15 | A7-3 | Domain creadig.de anbinden | 0,5 | 5 | 5 | **50** | V3 |
| 16 | A2-2 | Deutsche Rufnummer | 0,5 | 5 | 5 | **50** | V2 |
| 17 | A2-3 | Falsche Erfolgsmeldung | 0,5 | 5 | 5 | **50** | V2 |
| 18 | A4-1/A11-3 | Preise im Code korrigieren | 0,5 | 5 | 5 | **50** | **V1** |
| 19 | A3-1 | Dunkle Bänder wirklich dunkel | 0,5 | 5 | 5 | **50** | nach V3 |
| 20 | M2-3 | Bewerber-Winkel | 0,5 | 5 | 4 | **40** | V4 |
| 21 | A11-4 | Betreuungsmodell füllen | 0,5 | 4 | 5 | **40** | **V1** |
| 22 | A8-3 | Datenschutz-Baustein im Wizard | 0,5 | 4 | 5 | **40** | V2 |
| 23 | M12-3 | Zertifikate prüfen, Logos setzen | 0,5 | 4 | 5 | **40** | V4 |
| 24 | A3-2 | H2 kleiner als H1 | 0,5 | 5 | 4 | **40** | nach V3 |
| 25 | A2-5 | Fehlermeldung im Sichtfeld | 0,5 | 4 | 4 | **32** | V2 |
| 26 | M2-2 | Trigger Events verankern | 0,5 | 4 | 4 | **32** | V4 |
| 27 | M5-2 | Wettbewerbs-Konter | 0,5 | 4 | 4 | **32** | sofort |
| 28 | A7-5 | Build-Check per GitHub Action | 0,5 | 4 | 4 | **32** | V3 |
| 29 | A11-1 | LocalBusiness + Osnabrück in Titeln | 1,0 | 5 | 5 | **25** | V4 |
| 30 | A4-4 | `/insights` löschen | 0,5 | 3 | 4 | **24** | V1 |
| 31 | A4-2 | Startseite auf Nische + Preis | 1,0 | 5 | 4 | **20** | V4 |
| 32 | A5-2 | TR-Schlüssel typsicher | 1,0 | 4 | 5 | **20** | später |
| 33 | A11-7 | Beweisflächen füllen | 1,0 | 5 | 4 | **20** | laufend |
| 34 | A4-5 | Produkte entschärfen | 0,5 | 3 | 3 | **18** | **V1** |
| 35 | A2-1/A11-2 | Formular, das zustellt | 1,5 | 5 | 5 | **16,7** | **V2** |
| 36 | A5-4 | Deutsche Fehler-/404-Seiten | 1,0 | 4 | 4 | **16** | V4 |
| 37 | A4-3 | Referenzen mit Ergebnis | 2,0 | 5 | 5 | **12,5** | siehe §4.1 |
| 38 | A3-3 | 13 Buttons vereinheitlichen | 1,5 | 4 | 4 | **10,7** | nach V3 |
| 39 | A3-4 | Zweite Schriftskala auflösen | 1,5 | 4 | 3 | **8** | nach V3 |
| 40 | A11-6 | Landingpage + Pixel + Analytics | 2,5 | 4 | 4 | **6,4** | V5 |
| 41 | A5-1/M2-4 | TR-Route | 3–5 | 5 | 2 | **2,7** | **V6, nach Abschluss 1** |
| — | M2-1, M3-1, M5-1, M11-1, M12-1 | Haltungs- und Verzichtsbefunde | 0 | — | 5 | **Sofort** | — |

## TOP 5 — der Arbeitsvorrat

> **1 · A7-2 → A7-1 → A7-3** — Deployment-Fehler beheben, mergen, Domain anbinden. **Ohne das ist alles andere unsichtbar.**
> **2 · A2-1 + A2-2** — Ein Formular, das zustellt, und eine deutsche Rufnummer. Ohne das ist jeder Euro Werbung verbrannt.
> **3 · A4-1** — Preise auf die Leiter. Solange 350 € dasteht, verhandelst du gegen dich selbst.
> **4 · §4.1** — Eigene Projekte raus aus „Kundenwerk". Ehrlichkeit vor Politur.
> **5 · §4.3** — Drei Vorab-Entwürfe bauen. Das ersetzt die fehlenden Referenzen.

---

# 6 · UMSETZUNG — die Pakete V1–V6

Vollständige Arbeitsanweisungen stehen in `creadig-TERMINAL-BACKLOG-5.md`.
**Reihenfolge zwingend.** Ein Paket pro Terminal-Lauf.

| Paket | Inhalt | Blockiert durch Owner? |
|---|---|---|
| **V1 · Wahrheit** | Eigene Projekte raus aus `clientWorks` · Preise auf die Leiter · `retainer` füllen · Attrappen-Chat löschen · „Im Aufbau" ersetzen · `/produkte` aus der Hauptnavigation · `/insights` löschen | **Nein — startklar** |
| **V2 · Erreichbarkeit** | Deutsche Rufnummer überall · `app/api/anfrage/route.ts` mit Mailversand · E-Mail- und Telefonfeld ergänzen · falsche Erfolgsmeldung · Datenschutz-Baustein im Wizard · Fehlermeldung im Sichtfeld | Ja — **Rufnummer** |
| **V3 · Livegang** | `outputFileTracingExcludes` · `_legacy` aus der Versionierung · Impressum + § 36 VSBG + Speicherdauer · Merge nach `main` · Domain · Framework Preset · Deployment-Alarm | Ja — **Kleinunternehmer/USt-ID, Rufnummer** |
| **V4 · Nische** | Hero auf Handwerk + Ort + Preiszeile · Bewerber-Winkel · `ProfessionalService`-JSON-LD · Osnabrück in Titeln · deutsche 404-/Fehlerseiten · Zertifikats-Logos | Ja — **Zertifikatsstatus** |
| **V5 · Landing + Messung** | `app/angebot/website-handwerk` · `@vercel/analytics` an `statistics` · Meta-Pixel + Ereignis „Anfrage" | Nein |
| **V6 · TR-Route** | `app/[locale]`-Segment · `alternates.languages` · TR in der Sitemap · `Work`-Typ auf `Localized` | **Erst nach dem ersten Abschluss** |
| **Design-Nachlauf** | A3-1 dunkle Bänder · A3-2 Typo-Stufen · A3-3 Buttons · A3-4 zweite Skala · A3-5 Eyebrows · A3-6 Übergänge · A3-7 Motiv-Kontrast · A3-8 Radien | **Gesperrt bis V3 abgeschlossen** |

## Vertriebs-Wellen (parallel zu V1–V5)

**Welle 1 — sofort, ≤ 1 Tag:** Risikoumkehr festlegen · Preiskarte ans Telefon · Wiedervorlage-Tabelle anlegen · Zertifikatsstatus prüfen · **Liste 100 Handwerksbetriebe** (Name, Telefon, Inhaber, **Anlass**) · unersetzliche Dateien in die Cloud sichern

**Welle 2 — diese Woche:** V1 + V2 abarbeiten · Google-Unternehmensprofil anlegen · **3 Vorab-Entwürfe bauen** (je max. 4 h) · **50 Anrufe** → Ziel 3 Termine

**Welle 3 — dieser Monat:** V3 (Livegang) · V4 · V5 · 3 Partnergespräche (Steuerberater, Baustoffhändler, Fahrzeugbeschrifter) · 150 weitere Anrufe · Meta-Kampagne 20 €/Tag → **Ziel: 1 unterschriebener Auftrag**

---

# 7 · VERTRIEBS-ASSETS (fertig, versandbereit)

## 7.1 Elevator Pitch, 30 Sekunden

> „Ich bin Emin Akyol von creaDIG in Osnabrück. Ich baue Websites für Handwerksbetriebe — und zwar so, dass darüber tatsächlich Anfragen und Bewerbungen reinkommen, nicht nur eine schöne Seite entsteht. Ich mache das allein: Texte, Fotoauswahl, Google-Profil, alles. In vier Wochen ist die Seite online, zum Festpreis, und danach bin ich der, der ans Telefon geht. Ich spreche außerdem Türkisch — für Betriebe mit türkischen Kunden oder Mitarbeitern ist das oft der eigentliche Grund, warum sie mich nehmen."

## 7.2 Messaging-Haus

**Kernbotschaft:** *Ihre neue Seite ist in vier Wochen online — zum Festpreis, gebaut von einem Menschen aus Osnabrück, der danach erreichbar bleibt.*

| Strang | Inhalt | Entkräftet den Einwand |
|---|---|---|
| **1 · Nähe und Verantwortung** | Ein Ansprechpartner, kein Projektmanager. Sitz im ICO Osnabrück. Rückruf am nächsten Werktag, schriftlich zugesagt | „Die melden sich nie wieder" |
| **2 · Kalkulierbarkeit** | Festpreis. Fester Livetermin. 50 % bei Start, 50 % bei Ihrer Freigabe. Die Seite gehört Ihnen ab Tag eins | „Ich hab schon mal gezahlt und nichts gekriegt" |
| **3 · Handwerk und Herkunft** | Ich führe selbst einen Bau-/Glasfaserbetrieb · Projekte für Telekom und Glasfaser NordWest · BAFA #190949 · iuk · AGD · Deutsch und Türkisch | „Kann der das überhaupt?" |

## 7.3 Fünf Einwand-Antworten (wörtlich)

**„Zu teuer."**
> „Verstehe ich. Zu teuer im Vergleich wozu? … Ganz offen: Es gibt Anbieter für 1.500 €, die bekommen Sie auch. Dafür bekommen Sie eine Vorlage, in die Sie Ihre Texte selbst eintragen. Bei mir schreibe ich die Texte, wähle die Fotos aus und bringe Ihr Google-Profil in Ordnung. Was ist ein durchschnittlicher Auftrag bei Ihnen wert? … Dann hat sich das nach [seine Zahl] Aufträgen bezahlt."

**„Ich muss überlegen."**
> „Klar, sollten Sie auch. Damit ich nicht nerve: Was genau müssen Sie noch klären — den Preis, den Zeitpunkt, oder ob Sie mir das zutrauen?"

**„Wir kriegen alles über Empfehlung."**
> „Das ist die beste Ausgangslage, die es gibt. Eine Frage dazu: Wenn Ihnen jemand empfohlen wird, schaut der Sie vorher im Internet an — und ein Bewerber erst recht. Was findet der gerade?"

**„Ich hab keine Zeit dafür."**
> „Deswegen rufe ich an. Ich brauche von Ihnen 90 Minuten insgesamt: einmal 30 Minuten für den Check, einmal eine Stunde für Fotos und Texte. Den Rest mache ich. Wenn ich mehr brauche, war es mein Planungsfehler, nicht Ihrer."

**„Mein Neffe macht das."**
> „Dann lassen Sie ihn — im Ernst, wenn er es fertig macht, sparen Sie Geld. Darf ich fragen, seit wann er dran ist? … Ich habe einen Termin und eine Rechnung. Beides bindet mich. Ihren Neffen bindet nichts."

## 7.4 Telefonleitfaden

**Opener (auswendig, nicht ablesen):**
> „[Name] von [Firma]? Guten Morgen, hier ist Emin Akyol von creaDIG aus Osnabrück. Ich weiß, Sie sind mitten im Tagesgeschäft — haben Sie 60 Sekunden?"
> *(warten)*
> „Ich baue Websites für Handwerksbetriebe hier aus der Region — und ich hab selber einen Betrieb, Glasfaser. Ich hab mir Ihren Auftritt kurz angeschaut, und mir ist aufgefallen, dass [**ein** konkreter Punkt]. Ich mache dazu einen kostenlosen Check: 30 Minuten, ich zeige Ihnen, was Ihnen an Anfragen und Bewerbungen durchgeht. Passt Ihnen Donnerstag früh besser oder Freitag nachmittag?"

**Mit Vorab-Entwurf (stärkere Variante):**
> „…Ich mach was Ungewöhnliches: Ich hab mir Ihren Betrieb angeschaut und mal gebaut, wie Ihre Seite aussehen könnte. Kein Auftrag, keine Rechnung, ich schick Ihnen einfach den Link. Schauen Sie zwei Minuten drauf, und wenn's Ihnen nichts sagt, ist gut. Darf ich?"

**Qualifizierung — drei Fragen, bevor Zeit investiert wird:**
1. „Wie kommen Kunden aktuell zu Ihnen?"
2. „Gibt es gerade einen Anlass — Übergabe, neue Leute gesucht, neue Fahrzeuge?" → **Kein Anlass = Wiedervorlage in 6 Monaten, kein Termin.**
3. „Entscheiden Sie das allein oder redet noch jemand mit?"

**Discovery im Check (30 Min):** 8 Min Situation (nur zuhören) · 7 Min Schmerz beziffern — *„Was ist ein durchschnittlicher Auftrag bei Ihnen wert?"* / *„Wie lange suchen Sie schon einen Gesellen?"* (**er rechnet, nicht du**) · 5 Min Befund mit genau **drei** Punkten · 5 Min Angebot und Preis · 5 Min Abschluss

**Preisnennung (wörtlich):**
> „Was ich Ihnen empfehle, ist mein Website-Paket: neue Seite, Karriere-Unterseite, Google-Profil, Texte und Fotoauswahl von mir. Das kostet **zweitausendvierhundert Euro netto**, Festpreis — das ist mein Referenzpreis für die ersten zwei Betriebe. Die Hälfte bei Start, die Hälfte, wenn Sie die Seite freigeben. In vier Wochen ist sie online."
>
> **Dann schweigen. Bis er antwortet. Auch bei 15 Sekunden.**

**Abschlussfrage:**
> „Wenn Sie sagen, das passt, schicke ich Ihnen heute noch das Angebot und wir starten am [Datum]. Wollen wir das so machen?"

## 7.5 Landingpage-Copy (`/angebot/website-handwerk`)

**Headline:** *Ihre neue Website. In vier Wochen online. Festpreis.*
**Subline:** *Für Handwerksbetriebe im Umkreis Osnabrück. Texte, Fotos und Google-Profil mache ich — Sie brauchen 90 Minuten Ihrer Zeit.*

**Nutzenblock 1 — Anfragen, die wirklich ankommen**
> Ihre Seite bekommt ein Formular, das Ihnen die Anfrage direkt per Mail schickt — mit Rückrufnummer. Dazu ein Google-Unternehmensprofil, das Ihre echten Öffnungszeiten und Ihre echte Nummer zeigt. Wer Sie sucht, findet Sie und erreicht Sie.

**Nutzenblock 2 — Die Seite, die Ihr nächster Bewerber zuerst sieht**
> Jeder Bewerber googelt Ihren Betrieb, bevor er sich meldet. Sie bekommen eine Karriere-Unterseite mit echten Fotos von Ihrer Mannschaft und Ihren Fahrzeugen — keine Katalogbilder. Im Paket enthalten, nicht extra.

**Nutzenblock 3 — Ein Mensch, kein Ticketsystem**
> Sie reden mit mir. Ich führe selbst einen Betrieb, ich sitze im ICO in Osnabrück, ich baue die Seite selbst, und ich gehe danach ans Telefon. Auf Deutsch oder Türkisch.

**Beweis:** `[BEWEIS EINSETZEN]` — siehe §8

**FAQ:**
> **Was kostet es genau?** Festpreis für den vereinbarten Umfang, netto zzgl. 19 % USt. 50 % bei Start, 50 % wenn Sie die Seite freigeben.
> **Wie lange dauert es?** Vier Wochen ab dem Tag, an dem Sie mir Logo, Fotos und Zugänge gegeben haben.
> **Was muss ich tun?** 30 Minuten Gespräch, eine Stunde für Fotos und Texte. Mehr nicht.
> **Wem gehört die Seite?** Ihnen. Ab Tag eins, mit allen Zugängen.
> **Was, wenn ich später etwas ändern will?** Kleinigkeiten machen Sie selbst. Oder Sie nehmen die Betreuung für 149 € im Monat — dann mache ich bis zu zwei Änderungen monatlich, halte alles aktuell und bin unter einer festen Nummer erreichbar.
> **Warum nicht ein Baukasten für 20 € im Monat?** Können Sie machen. Der kostet Sie zusätzlich drei Wochenenden, und Texte und Google-Profil bleiben trotzdem liegen.

**CTA:** *Kostenloser Digital-Check, 30 Minuten. Ich schaue mir Ihren jetzigen Auftritt an und sage Ihnen, was Ihnen an Anfragen durchgeht. Wenn nichts dabei ist, sage ich Ihnen das auch.*

## 7.6 Nachfass-Rhythmus

| Tag | Kanal | Inhalt |
|---|---|---|
| 0 | Telefon → Mail | Termin bestätigen |
| 1 nach Check | Mail | Drei Befunde + Angebot |
| **3** | **Telefon** | „Ist es durchgegangen?" — **hier fallen die meisten Abschlüsse** |
| 7 | Mail | Nachhaken, Ausstieg anbieten |
| 14 | Telefon | Letzter aktiver Versuch |
| 21 | Mail | Sauberer Abschluss: „Ich lasse Sie in Ruhe" |
| +6 Mon. | Telefon | Wiedervorlage, neuer Anlass |

**Wichtig:** Jede Mail setzt eine **ausdrückliche Zusage im Telefonat** voraus („Darf ich Ihnen das per Mail schicken?"), mit Datum notiert. Siehe M12-1.

## 7.7 Meta-Anzeigen — 3 Hooks × 2 Winkel

| | **Winkel A — Kunden** | **Winkel B — Bewerber** |
|---|---|---|
| **Hook 1: Direkt** | „Handwerksbetrieb im Raum Osnabrück? Neue Website in vier Wochen, Festpreis. Texte, Fotos und Google-Profil mache ich." | „Ihr nächster Geselle googelt Sie, bevor er anruft. Was findet er? Karriereseite inklusive, vier Wochen, Festpreis." |
| **Hook 2: Frage** | „Wann haben Sie zuletzt geprüft, ob bei Google die richtige Nummer von Ihnen steht?" | „Seit wann suchen Sie schon jemanden? Und wie sieht die Seite aus, auf der er landet?" |
| **Hook 3: Video (30 s, Handykamera)** | „Ich bin Emin aus Osnabrück. Ich hab selber einen Betrieb, Glasfaser. Ich baue Websites für Handwerksbetriebe — kein Abo, kein Baukasten. Festpreis, vier Wochen, und danach gehe ich ans Telefon." | „Ich bin Emin aus Osnabrück. Die meisten Betriebe, die ich anrufe, haben genug Aufträge — aber keine Leute. Ihre Website ist das Erste, was ein Bewerber sieht." |

**Zielgruppe:** Osnabrück + 60 km · 30–60 Jahre · **keine engen Detail-Targetings**.
**Startbudget:** 20 €/Tag, 14 Tage. **Budgetplan:** Test 600 € → Ausbau ~1.050 €/Mon → Skalierung ~1.350 €/Mon. **Nicht 5.000 € in einem Monat.**

## 7.8 Angebots-One-Pager (Struktur)

> **Kopf:** creaDIG · Muhammed Emin Akyol · ICO InnovationsCentrum Osnabrück · [Telefon] · info@creadig.de · Angebot Nr. [X] · gültig bis [+21 Tage]
> **1 Ausgangslage** — zwei Sätze **aus seinen Worten**, aus dem Check
> **2 Was ich baue** — Website (5 Seiten) · Karriere-Unterseite · Formular mit Mailzustellung · Google-Profil · Texte · Fotoauswahl vor Ort
> **3 Was Sie tun** — 30 Min Gespräch · 1 Std Fotos und Texte · 1 Freigabe
> **4 Termin** — Start [Datum], online spätestens [+4 Wochen] ab Materialeingang
> **5 Preis** — netto, zzgl. 19 % USt. Festpreis. 50/50. Seite und Zugänge gehören Ihnen ab Tag eins
> **6 Danach (optional)** — Betreuung 149 €/Monat, monatlich kündbar
> **7 Nicht enthalten** — Fotoshooting durch einen Fotografen · Übersetzungen über DE/TR hinaus · Onlineshop
> **Zusage** — Sollte die Seite aus einem Grund, den ich zu verantworten habe, nach vier Wochen nicht online sein, verschiebt sich die zweite Rate, bis sie es ist.

---

# 8 · MESSUNG & ABNAHME

| Maßnahme | Was messen | Wo | Erfolg ab | Stopp bei |
|---|---|---|---|---|
| Telefon | Wählversuche · Erreicht · Termine · Angebote · Abschlüsse | eigene Tabelle, 1 Zeile/Woche | 3 Termine je 50 Anrufe | < 1 Termin je 50 nach 150 Anrufen → Opener ändern, **nicht** aufhören |
| Vorab-Entwurf | Wie viele öffnen den Link | Link-Aufrufe | ≥ 2 von 3 schauen | 0 von 3 → Ansprache ändern |
| Formular | Mails in info@creadig.de | Postfach | ≥ 1 in 14 Tagen live | — |
| Google-Profil | Anrufe über das Profil | Profil-Statistik | ≥ 2 im ersten Monat | — |
| Meta-Ads | Kosten pro Lead | Ads-Manager | CPL < 60 € in 14 Tagen | CPL > 100 € nach 300 € → Creative tauschen, Budget halten |
| Meta-Ads | Anteil erreichbarer Leads | eigene Tabelle | ≥ 40 % ans Telefon | < 20 % → Formularfelder prüfen |
| Preis | Wie oft der Preis genannt wurde | Strichliste | 10 Nennungen in 30 Tagen | < 5 → **das** ist das Problem, nicht der Markt |
| **Gesamtziel 30 Tage** | **1 unterschriebener Auftrag** | Rechnung | erreicht | — |

**Abnahme technisch (für Nicht-Techniker prüfbar):**
- V1: `grep -rn "350" lib/` findet keinen alten Preis · kein schwebender Chat-Knopf mehr
- V2: Von fremdem Handy anrufen → es klingelt · Testabsendung → Mail liegt im Postfach
- V3: `creadig.de` im Inkognito-Fenster lädt die **neue** Seite · Impressum ohne Pending-Hinweis
- V4: Ein Fremder liest 30 Sekunden und nennt Zielgruppe, Preis, nächsten Schritt
- V5: Eigene Testanfrage erscheint binnen 30 Min im Ads-Manager

---

# 9 · OFFENE BEWEIS-PLATZHALTER

Nichts davon geht raus, bevor es gefüllt ist:

1. `[BEWEIS EINSETZEN]` **Rumis Maison** — echter zahlender Kunde? Wenn ja: Ergebnissatz + Jahr + Freigabe
2. `[BEWEIS EINSETZEN]` **FIBERO-Auftraggeber** — welche darf er öffentlich nennen? (Telekom, Glasfaser NordWest, 1&1, Drillisch — Nennung freigegeben?)
3. ~~`[BEWEIS EINSETZEN]` BAFA #190949~~ — **GEKLÄRT: besteht nicht.** Registrierung wäre erwerbbar und hätte echten Verkaufswert (geförderte Beratung für Kunden) — aber erst behaupten, wenn eingetragen
4. `[BEWEIS EINSETZEN]` **go-digital** — aktiv ja/nein, mit Datum. **Bis dahin in keiner Copy**
5. ~~`[BEWEIS EINSETZEN]` iuk-Netzwerk, AVPQ, AGD~~ — **GEKLÄRT 22.08.2026: keine davon besteht.**
   Owner ist bei **keinem** der vier gelistet oder Mitglied (auch BAFA nicht). Alle vier fliegen
   in **V1-e** aus dem Code — inklusive schema.org `hasCredential`. Neue offene Frage: welche
   erwirbt er wirklich, in welcher Reihenfolge (siehe `KIZILELMA-creaDIG.md` §9.9)
6. `[BEWEIS EINSETZEN]` **Reale Vermittlungskosten** einer Handwerks-Neueinstellung, aus einem Kundengespräch
7. `[BEWEIS EINSETZEN]` **Zahl aus den ersten 50 Anrufen** — wie viele Betriebe haben eine falsche Google-Nummer
8. `[BEWEIS EINSETZEN]` **Erste zwei Referenzprojekte** — Zitat, Nennung, 2 Fotos
9. `[DEUTSCHE NUMMER EINSETZEN]` — Landing, One-Pager, Mails, Impressum, schema.org

---

# 10 · GESPERRTE ENTSCHEIDUNGEN (Black Lock)

1. **Keine Fake-Beweise.** Keine erfundenen Zitate, Reviews, Zahlen, Wettbewerbernamen. **Eigene Projekte werden nie als Kundenwerk ausgegeben.**
2. **go-digital bleibt aus jeder Copy**, bis der Status schriftlich geklärt ist.
3. **Keine Kalt-E-Mail.** Telefon und Post.
4. **Design-Feinschliff ist gesperrt**, solange die Seite nicht live ist und kein Formular zustellt. Die A3-Befunde sind real — und nachrangig.
5. **Ein Angebot wird beworben.** Corporate Design, Software, Medien bleiben im Portfolio, nicht in der Werbung.
6. **Preisleiter 2.400 → 2.400 → 3.900** wird nicht übersprungen und nicht unterboten.
7. **v0 baut nur Einzelseiten** — Vorab-Entwürfe und Landing. Kein Umbau der bestehenden Seite.
8. **fibero wird nicht vor den ersten drei Web-Kunden geöffnet.**
9. **Bauen ist nur erlaubt für einen Menschen, dessen Namen und Telefonnummer du hast.**
10. **Ein Paket pro Terminal-Lauf.** Kein Force-Push. Kein Merge bei rotem Preview-Deployment.

---

# 11 · ZUSTANDS-BLOCK

```
ZUSTANDS-BLOCK v1 — creaDIG Gesamtanalyse — 22.08.2026

Umgesetzt: keine (Erstlauf). Dokumentiert: KIZILELMA §9, TERMINAL-BACKLOG-5, diese Datei.

Ergebnisse: Anfragen/Monat 0 · Abschlussquote [UNBEKANNT] · höchster Auftrag je unter 2.500 EUR
  · Website seit Projektbeginn nicht live · letztes Deployment ERROR seit 22.08.2026 04:49

Offen (Top 5): A7-2 Deployment-Fehler (50) · A7-1 Merge nach main (50) · A7-3 Domain (50)
  · A2-1 Formular das zustellt (16,7) · A2-2 deutsche Rufnummer (50)
  Vollständige Liste: §5, 41 Positionen.

Verworfen: "Preis zehnmal laut sagen" (Owner-Einwand berechtigt, Kern bleibt als Karte am Telefon)
  · "Ruf die drei Referenzkunden an" (es gibt keine Kunden)
  · "Impressum als eigener Sofort-Task" (gehört in V3 zum Livegang)

Abgeschwächt: A4-5 Produkte (nicht löschen, nur entschärfen) · A5-1/M2-4 TR-Route (D auf 2)
  · A5-3 Work-Typ (zurückgestellt, hängt an A5-1) · A11-6 Landing (nach V4)

Offene Beweis-Platzhalter: 9 Stück, §9

Neue Annahmen:
  - NULL zeigbare Web-Kundenreferenzen; echte Beweise liegen in FIBERO und in Emins
    eigener Unternehmerschaft (Bau/Glasfaser)
  - Recruiting ist bei ausgelasteten Handwerksbetrieben der stärkere Kaufgrund als
    Neukundengewinnung [ANNAHME, in den ersten 10 Anrufen prüfen]
  - Preisleiter 2.400 -> 2.400 -> 3.900 statt Sofortsprung auf 3.900
  - Erlaubter CAC 800 EUR bei 5.688 EUR Jahr-1-Umsatz je Kunde
  - Kalt-E-Mail B2B gesperrt (§ 7 UWG); Telefon und Post sind die Erstkontakte
  - v0 nur für Einzelseiten (Vorab-Entwürfe, Landing)
  - fibero ist das einzige eigene Produkt mit echter Verkaufschance — aber erst nach
    den ersten drei Web-Kunden

Nächster Fokus: V1 im Terminal abarbeiten. Parallel: 100er-Liste bauen und die vier
  Owner-Fragen beantworten (Rumi's Maison · Kleinunternehmer oder USt-ID · Rufnummer · go-digital).
```

---

*Quellen: Repo-Analyse `feat/system-haus-site` @ 22.08.2026 (12 technische Lanes, davon A6 und Teile von A8 objektiv nicht vorhanden) · Marketing-/Sales-Analyse (13 Lanes) · Kreuzprüfung durch den Roten Agenten · Owner-Aussagen aus dem Gespräch vom 18.–22.08.2026.*
*Verwandte Dateien: `KIZILELMA-creaDIG.md` §9 · `OMURGA.md` · `creadig-TERMINAL-BACKLOG-5.md`*
