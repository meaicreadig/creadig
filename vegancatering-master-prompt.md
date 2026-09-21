# vegancatering.ch — MASTER PROMPT v1.0 (Next.js + Supabase · ein Durchlauf · komplette Seite)

> **Anweisung an V0 / Claude Code:** Baue die **komplette Website in einem Durchlauf** — alle Seiten, der Anfrage-Flow, das Supabase-Backend, der Admin-Bereich. Fertig, kohärent, deploybar. UI-Sprache **Deutsch (Schweiz)**, zweite Sprache Englisch. Qualitätsanspruch: **die beste Catering-Seite der Schweiz** — appetitlich, hochwertig, schnell, ehrlich.
> **Status:** Entwurf 2026-09-21 · Marker: `[BESTÄTIGEN]` = Emins Bestätigung nötig · `[ANNAHME]` = abgeleitet, korrigierbar. Alles ohne Marker ist verbindlich.

---

## 0 · DER EINE SATZ

vegancatering.ch ist ein **Schweizer Catering, das zu 100 % pflanzlich kocht** — für Firmenanlässe, Apéros, Hochzeiten und private Feiern. Die Seite hat **einen Job: Vertrauen und Appetit in eine Offert-Anfrage verwandeln.** Jede Sektion, jeder Button führt dorthin. Kein Shop, kein Login für Gäste — **Anfrage → Menüvorschlag → Offerte → Anlass.**

---

## 1 · OFFENE PUNKTE (vor dem Go-Live bestätigen — der Build startet trotzdem)

| # | Punkt | Annahme im Prompt | Brauche von Emin |
|---|---|---|---|
| 1 | Markenname / Wortmarke | `[ANNAHME]` Arbeitsname **vegancatering** (Kleinschreibung, Wortmarke) | echter Name, Logo (SVG) oder „Wortmarke reicht" |
| 2 | Wessen Projekt | `[ANNAHME]` **Kundenwerk unter creaDIG** (wie Rumi's Maison) | eigenes Produkt oder Kunde? → Impressum + Footer „Gebaut von creaDIG" |
| 3 | Region / Liefergebiet | `[ANNAHME]` **Zürich + ca. 50 km** (ZH, AG, ZG, SZ, SG-West) | Stadt/Kanton, Lieferradius, PLZ-Liste |
| 4 | Firmendaten (Impressum) | Platzhalter | Firma, Rechtsform, Adresse, UID (CHE-…), MwSt-Nr., E-Mail, Telefon |
| 5 | Kunden-Kontakt | `[ANNAHME]` WhatsApp `+41 76 504 58 79` (Emins CH-Nummer) | eigene Nummer des Betriebs? |
| 6 | Sprachen | `[ANNAHME]` **DE (CH) + EN**; FR als Option vorbereitet, nicht befüllt | FR ja/nein |
| 7 | Formate + Preise | `[ANNAHME]` Apéro ab CHF 18.– p.P. · Business-Lunch ab CHF 24.– · Buffet/Event ab CHF 45.– · Min. **10 Personen** · Vorlauf **5 Werktage** | echte Zahlen oder „Preis auf Anfrage" |
| 8 | Leistungsumfang | `[ANNAHME]` Lieferung + Aufbau; Personal, Geschirr, Getränke als Extras | was ist inklusive, was Zusatz |
| 9 | Fotos | Platzhalter-Slots; KI-Bilder nur gekennzeichnet | eigene Food-/Event-Fotos (das Wichtigste für Conversion) |
| 10 | Zahlung | `[ANNAHME]` Rechnung (30 Tage), TWINT, Karte; Anzahlung 30 % ab CHF 2'000.– | Konditionen, Storno-Fristen (→ AGB) |
| 11 | Social | leer | Instagram / LinkedIn Handles |
| 12 | Domain-E-Mail | `[ANNAHME]` `offerte@vegancatering.ch` als Absender (nur Versand via Resend) | Mailbox gewünscht? → Mail-Hosting wählen |

---

## 2 · DESIGN-DNA (verbindlich)

**Wirkung:** frisch, appetitlich, hochwertig, **schweizerisch präzise.** Kein Öko-Klischee — keine Blätter-Icons, kein Hanf-Beige, kein Comic-Gemüse. Eine **moderne, editorial-elegante Food-Marke**: wie ein sehr gutes Restaurant, das auch Catering macht. Die Fotografie ist der Star, die Typografie trägt sie, die Farbe hält sich zurück.

**Farben — hell, warm, natürlich:**
- Basis: **warmes Off-White** `#F7F4EE` · Flächen `#EFEAE1`.
- Tinte: **tiefes Grünschwarz** `#101A15` für Text.
- Primär: **Waldgrün** `#1E4B3A` (Nav-Akzente, Links, sekundäre Buttons).
- Akzent: **Aprikose/Terracotta** `#D9683E` — **nur für den Haupt-CTA „Offerte anfragen"** und kleine Marker. Appetit-Farbe, sparsam.
- Highlight: **Zitrus** `#E6B94F` — sehr sparsam (Tags, Hover-Details).
- Dunkle Kontrast-Sektionen: **Waldgrün-Tiefe** `#0F2A21` mit Off-White-Text (CTA-Band, Prozess).
- **Kein Dark-Mode-Toggle** (Food-Site bleibt hell); die dunklen Bänder setzen Akzente.

**Typografie — editorial, warm, gross:**
- Headlines: **editoriale Serif** (z. B. **Fraunces**, Instrument Serif, Newsreader) — gross (`clamp` bis ~6rem), ruhig, leichtes negatives Tracking. Wirkt wie eine Speisekarte eines guten Hauses, nicht wie ein SaaS.
- Body/UI: **klare Sans** (Inter oder Geist), 17–18px Body, hohe Lesbarkeit.
- Zahlen/Preise: tabellarische Ziffern (`font-variant-numeric: tabular-nums`).

**Bild:** grosse, natürliche Food-Fotos (Tageslicht, Textur, echte Teller, Hände, Tische). Bild-Slots unter `public/food/…` und `public/events/…` mit `TODO`-Kommentar. **Keine Plastik-Stock-Optik.** Bis echte Fotos da sind: neutrale Platzhalter mit Aspect-Ratio, kein Fremdmaterial als „unsere Küche".

**Layout & Scale:** viel Weissraum, grosse Bildflächen, klares 12er-Grid, Karten mit 16px Radius, feine 1px-Linien in Grün-10 %. **Mobile first** — Anfragen kommen vom Handy: CTA unten sticky, Formular mit grossen Touch-Zielen.

**Motion (dezent, 60fps, `prefers-reduced-motion` sicher):** Scroll-Reveals (Fade + 12px), sanfter Bild-Zoom bei Hover (1.03), Marquee „Für jeden Anlass" langsam, Accordion smooth. **Nie Kirmes, nie Parallax-Show.** Die Bilder machen die Bewegung.

---

## 3 · SEITEN & SEKTIONEN (komplett)

**Routen:** `/` · `/angebot` · `/menue` · `/anfrage` · `/anfrage/danke` · `/ueber-uns` · `/galerie` · `/faq` · `/kontakt` · `/impressum` · `/datenschutz` · `/agb` · `/admin/*` · EN unter `/en/…` (DE ohne Prefix).

**Sticky-Nav:** Wortmarke · Angebot · Menü · Über uns · Galerie · FAQ · Kontakt · Sprach-Toggle **DE/EN** · **CTA „Offerte anfragen"** (Akzent) · WhatsApp-Icon. Transparent über dem Hero → Off-White solide beim Scrollen. Mobil: Vollbild-Drawer, CTA bleibt sichtbar.

### Home `/`
1. **HERO (Vollbild-Foto):** Headline **„Pflanzlich. Festlich. Schweizerisch."** `[ANNAHME]` (Alternativen: „Catering, das allen schmeckt. Zu 100 % pflanzlich." · „Grosser Geschmack. Kein Tier.") · Subline: *„Vegan Catering für Firmenanlässe, Apéros, Hochzeiten und private Feiern — frisch gekocht in Zürich, geliefert in der ganzen Region."* `[BESTÄTIGEN: Ort]` · CTAs: **„Offerte anfragen"** (Akzent) + „Menü entdecken" (Ghost) · Trust-Zeile ohne erfundene Zahlen: **„100 % pflanzlich · saisonal & regional · Allergene klar deklariert · Lieferung & Aufbau inklusive"** `[BESTÄTIGEN]`.
2. **ANLÄSSE (4 Karten, gross, Foto):** **Business & Firmenanlass** (Znüni, Lunch, Apéro riche, Seminar) · **Apéro & Empfang** (Fingerfood, Häppchen, Stehlunch) · **Hochzeit & Fest** (Buffet oder serviertes Menü) · **Privat & Familie** (Geburtstag, Taufe, Gartenfest). Je: 1 Satz + **„ab CHF … p.P."** `[BESTÄTIGEN]` + Link → `/anfrage?typ=…` (Typ vorausgewählt).
3. **MENÜ-HIGHLIGHTS:** 6–8 Gerichte aus Supabase (`is_featured`): Bild, Name, 1 Zeile, Allergen-Icons, Tags (glutenfrei · nussfrei · saisonal). Button „Zum ganzen Menü".
4. **SO FUNKTIONIERT'S (dunkles Band, 3 Schritte):** **1 · Anfrage** — 2 Minuten, ohne Verpflichtung · **2 · Menüvorschlag & Offerte** — innert 24 h `[BESTÄTIGEN]` · **3 · Wir kommen** — liefern, richten an, räumen ab. Brücke: *„Sie feiern. Wir kochen."*
5. **WARUM VEGANCATERING (4 Werte):** **Geschmack zuerst** (auch für Nicht-Veganer gebaut) · **Saisonal & regional** (Lieferanten mit Namen `[BESTÄTIGEN]`) · **Allergene transparent** (jedes Gericht deklariert, Spuren-Hinweis) · **Wenig Abfall** (Mehrweg, Mengenplanung) `[BESTÄTIGEN: Mehrweg-Claim]`.
6. **GALERIE-BAND:** Masonry aus Supabase Storage (`gallery_images`), Hover: Anlass-Tag. Leer → Sektion ausblenden, nie Platzhalter zeigen.
7. **STIMMEN & FIRMENKUNDEN:** **nur echte, freigegebene** Zitate/Logos — sonst Sektion **weglassen** (im Code vorhanden, per Setting `show_testimonials=false`). **Nichts erfinden.**
8. **FAQ-AUSZUG:** 5 Fragen als Accordion → „Alle Fragen".
9. **CTA-BAND (dunkelgrün):** „Bereit für Ihren Anlass?" — Datum-Chip („Wann?"), Gäste-Chip → springt in die Anfrage. Daneben WhatsApp.

**Footer:** Wortmarke + 1 Satz · Nav · Kontakt (Mail, Tel, WhatsApp) · Liefergebiet (Kurzliste) · Social-Slots · Impressum · Datenschutz · AGB · „Gebaut von creaDIG" `[BESTÄTIGEN]` · © 2026.

### Menü `/menue`
Filterleiste (sticky): **Kategorie** (Apéro & Fingerfood · Vorspeisen & Salate · Hauptgänge · Bowls & Lunch · Desserts · Getränke) · **Tags** (glutenfrei · nussfrei · sojafrei · roh · saisonal) · **Suche**. Karten: Bild, Name, Kurztext, **Preis p.P. („ab CHF 6.50")**, Min-Personen, **Allergen-Icons mit Tooltip**. **„Merken"** → Merkliste (localStorage, Zähler in der Nav) → wandert als Wunschliste in die Anfrage. Hinweis oben: *„Alle Gerichte 100 % pflanzlich. Menüs stellen wir für jeden Anlass individuell zusammen — die Karte zeigt, was möglich ist."*

### Angebot `/angebot`
Die vier Formate im Detail, je: **für wen · Ablauf · Umfang** (Lieferung / Aufbau / Personal / Geschirr / Abholung) · **Preislogik** („ab CHF … p.P., inkl. MwSt. `[BESTÄTIGEN]`, exkl. Personal") · **Beispiel-Menü** (3 Gänge aus der Karte) · CTA. Zusätzlich: **Znüni & Zvieri für Teams** (wiederkehrend, Firmen) `[ANNAHME]`.

### Anfrage `/anfrage` → Sektion 4.

### Über uns `/ueber-uns`
Geschichte (kurz, ehrlich), **die Küche / wer kocht** `[BESTÄTIGEN: Name, Foto]`, Werte, Region, Lieferanten. Echte Fotos; falls KI-generiert → sichtbar „KI-generiert". **Keine erfundene Teamgrösse.**

### Galerie `/galerie` · FAQ `/faq` · Kontakt `/kontakt`
Galerie: Masonry + Filter nach Anlass. FAQ: 12 Fragen (Sektion 6). Kontakt: Kurzformular (Name, E-Mail, Nachricht → `messages`), WhatsApp, E-Mail, Telefon, Liefergebiet, Karte optional (ohne Google-Cookies → statisches Bild oder Link).

### Rechtliches (CH)
**Impressum** (UWG Art. 3 lit. s: Firma, Adresse, E-Mail, UID) · **Datenschutzerklärung** nach **revDSG** (Verantwortlicher, Zwecke, Auftragsbearbeiter: Supabase (Region Zürich/EU), Vercel, Resend; Rechte; keine Tracking-Cookies) · **AGB** (Offerte, Anzahlung, Storno-Fristen, Allergene/Haftung, Zahlung). Alle drei als **strukturierte Platzhalter mit `[BESTÄTIGEN]`** — keine Rechtsberatung, vor Go-Live prüfen lassen.

---

## 4 · DER ANFRAGE-FLOW (Herzstück · Conversion)

**Route `/anfrage`**, Multi-Step, Server Actions, Fortschrittsleiste, **Autosave in localStorage** (Abbruch = nichts verloren), zurück-navigierbar, DE/EN.

**Schritt 1 · Anlass:** Typ (4 Karten, aus `?typ=` vorausgewählt) · Datum (Picker, min = heute + Vorlauf `[ANNAHME: 5 Werktage]`, Hinweis bei kürzer: „Kurzfristig? Rufen Sie an.") · Uhrzeit (von/bis) · **Gäste** (Stepper, min 10 `[BESTÄTIGEN]`, „ungefähr reicht") · **Ort**: PLZ + Ort → **Liefergebiet-Check** gegen `site_settings.service_plz` → grün „Wir liefern zu Ihnen" / neutral „Ausserhalb — wir prüfen das gerne".
**Schritt 2 · Wünsche:** Format (Apéro / Buffet / Menü serviert / Lunchboxen) · Budget p.P. (Chips: bis 25 · 25–40 · 40–60 · 60+ · offen) · **Merkliste** aus dem Menü (optional, editierbar) · **Allergien & Unverträglichkeiten** (Chips: Gluten · Nüsse · Erdnüsse · Soja · Sesam · Sellerie · Senf · Sulfite · Lupinen + Freitext) · Extras (Personal · Geschirr & Besteck · Getränke · Aufbau/Abbau · Mehrweg).
**Schritt 3 · Kontakt:** Name · Firma (optional) · E-Mail · Telefon · Nachricht · **Datenschutz-Checkbox** (Pflicht, Link) · Honeypot-Feld · **Cloudflare Turnstile** `[ANNAHME]` (unsichtbar).
**Schritt 4 · Zusammenfassung → Absenden.**
**Danke-Seite `/anfrage/danke`:** Referenz **„VC-2026-0001"**, „Wir melden uns innert 24 h" `[BESTÄTIGEN]`, Zusammenfassung, **WhatsApp-Button mit vorausgefülltem Text** (Referenz + Datum + Gäste), „Zurück zur Startseite".

**Serverseitig nach Absenden:** zod-Validierung → Insert in `inquiries` (**Service-Role, nur server-seitig**) → E-Mail an Kunde (Bestätigung + Zusammenfassung) + E-Mail an Betrieb (alle Felder + Link `/admin/anfragen/[id]`) via **Resend** `[ANNAHME]` → Redirect. **Fällt die Mail aus, bleibt der Datensatz** — Admin sieht ihn, Kunde sieht die Danke-Seite. Spam: Honeypot + Rate-Limit (IP, 5/Std, Upstash oder In-Memory-Fallback) + Turnstile. Fehler inline, nie als Alert.

**Kurzformular Kontakt:** Name, E-Mail, Nachricht → `messages`, gleiche Schutzmechanik, Mail an Betrieb.

---

## 5 · SUPABASE (Schema · RLS · Storage · Auth · E-Mail)

**Projekt:** Region **Zürich `eu-central-2`** `[ANNAHME]`, sonst Frankfurt. Migrations unter `supabase/migrations/`, Seed unter `supabase/seed.sql`, Typen via `supabase gen types` nach `lib/supabase/types.ts`.

```sql
-- 0001_init.sql (Skizze — vollständig ausarbeiten)
create type inquiry_status as enum ('neu','in_bearbeitung','offeriert','bestaetigt','abgelehnt','erledigt');
create type event_type     as enum ('business','apero','hochzeit','privat','sonstiges');

create table public.inquiries (
  id             uuid primary key default gen_random_uuid(),
  seq            bigint generated always as identity,
  ref            text unique,                       -- VC-2026-0001 (Trigger)
  created_at     timestamptz not null default now(),
  status         inquiry_status not null default 'neu',
  locale         text not null default 'de',
  event_type     event_type not null,
  event_date     date not null,
  time_from      time, time_to time,
  guests         int not null check (guests > 0),
  plz            text, city text, address text,
  in_service_area boolean,
  format         text,                              -- apero | buffet | menu | lunchbox
  budget_pp      text,                              -- '<25' | '25-40' | '40-60' | '60+' | 'offen'
  wishlist       jsonb not null default '[]',       -- [{menu_item_id, name}]
  allergies      text[] not null default '{}',
  allergies_note text,
  extras         text[] not null default '{}',
  message        text,
  name           text not null, company text, email text not null, phone text,
  consent_at     timestamptz not null,
  source         text not null default 'web',
  admin_notes    text,
  updated_at     timestamptz not null default now()
);

create or replace function public.set_inquiry_ref() returns trigger language plpgsql as $$
begin
  new.ref := 'VC-' || to_char(new.created_at, 'YYYY') || '-' || lpad(new.seq::text, 4, '0');
  return new;
end $$;
create trigger inquiries_ref before insert on public.inquiries
  for each row execute function public.set_inquiry_ref();

create table public.messages (
  id uuid primary key default gen_random_uuid(), created_at timestamptz default now(),
  name text not null, email text not null, message text not null, handled boolean default false
);

create table public.menu_categories (
  id uuid primary key default gen_random_uuid(), slug text unique not null,
  name_de text not null, name_en text, sort int default 0, is_active boolean default true
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.menu_categories on delete set null,
  slug text unique not null, name_de text not null, name_en text,
  description_de text, description_en text,
  price_pp_chf numeric(8,2), min_persons int default 10,
  allergens text[] not null default '{}',   -- gluten, nuesse, erdnuesse, soja, sesam, sellerie, senf, sulfite, lupinen
  tags text[] not null default '{}',        -- glutenfrei, nussfrei, sojafrei, roh, saisonal, bio, klassiker
  image_path text, is_featured boolean default false, is_active boolean default true, sort int default 0,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table public.gallery_images (
  id uuid primary key default gen_random_uuid(), image_path text not null,
  alt_de text, alt_en text, event_type event_type, sort int default 0, is_active boolean default true
);

create table public.site_settings (key text primary key, value jsonb not null);
-- keys: min_persons, lead_days, service_plz (array), contact (jsonb), show_testimonials, prices_from (jsonb)
```

**RLS (alle Tabellen aktiviert):**
- `menu_categories`, `menu_items`, `gallery_images`, `site_settings`: `select` für `anon` + `authenticated` **nur wo `is_active = true`** (Settings: alle); `insert/update/delete` nur `authenticated`.
- `inquiries`, `messages`: **keine `anon`-Policy** — Inserts laufen ausschliesslich über die Server Action mit **Service-Role-Key** (nie im Client). `authenticated`: `select`, `update`.
- Vegan heisst: Milch, Ei, Fisch, Krebstiere, Weichtiere sind per Definition ausgeschlossen — die Allergen-Liste enthält nur die pflanzlich relevanten.

**Storage:** Buckets `menu` und `gallery`, **public read**, Upload/Delete nur `authenticated`. Bilder via `next/image` mit Supabase-Loader, AVIF/WebP, feste Aspect-Ratios (4:3 Food, 3:2 Events).

**Auth:** E-Mail + Passwort **nur für den Admin**. In Supabase **„Allow new users to sign up" = aus**; der eine Admin-User wird manuell angelegt. Site URL `https://vegancatering.ch`, Redirects: `https://vegancatering.ch/**`, `https://vegancatering-*-muhammed-emin-akyols-projects.vercel.app/**`, `http://localhost:3000/**`.

**Admin `/admin` (schlicht, shadcn, mobil brauchbar):** Login · **Anfragen** (Tabelle: Ref, Datum des Anlasses, Typ, Gäste, Ort, Status-Chip, Eingang; Detail-Sheet mit allen Feldern, Status ändern, Notizen, „Per Mail antworten"-Link, CSV-Export) · **Menü** (CRUD, Bild-Upload, Drag-Sortierung, aktiv/featured-Toggle, Allergene/Tags als Chips) · **Galerie** (Upload, Sortierung, Anlass-Tag) · **Einstellungen** (`site_settings` als Formular: Mindestpersonen, Vorlauf, PLZ-Liste, Preise „ab", Kontakt, Testimonials an/aus).

**E-Mail:** Resend `[ANNAHME]`, Absender `offerte@vegancatering.ch` (Domain bei Resend verifizieren → SPF/DKIM/DMARC bei Hostpoint). Templates (react-email): **Kunde** — „Danke, wir haben Ihre Anfrage VC-… erhalten" + Zusammenfassung + Ansprechpartner; **Betrieb** — alle Felder, Merkliste, Allergien fett, Link ins Admin. Supabase-Auth-Mails nur für Passwort-Reset des Admins (Default-SMTP reicht).

**Env (Vercel: Production + Preview + Development):**
```
NEXT_PUBLIC_SITE_URL=https://vegancatering.ch
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=          # neuer Name: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=              # nur Server — nie NEXT_PUBLIC_
RESEND_API_KEY=
INQUIRY_NOTIFY_EMAIL=                   # Postfach des Betriebs
TURNSTILE_SITE_KEY= / TURNSTILE_SECRET_KEY=   # optional
```

**Seed:** 6 Kategorien + ~20 Beispielgerichte (Sektion 6), im Admin als „Beispiel" erkennbar, `[BESTÄTIGEN: echte Karte]`.

---

## 6 · CONTENT (CH-Deutsch — genau so verwenden, EN sinngemäss übersetzen)

**Schreibweise Schweiz:** **„ss" statt „ß"** (gross, Strasse, schliessen) · **CHF 24.–** · **12.10.2026** · **+41 76 504 58 79** · **innert** (nicht „innerhalb") · **Offerte** (nicht „Angebot" im Sinn von Preisvorschlag) · **Anlass** (nicht „Event") · **Apéro**, **Znüni**, **Zvieri** · Sie-Form `[ANNAHME]`.

**Positionierung:** *„Vegan Catering, das allen schmeckt."* · *„Pflanzlich. Festlich. Schweizerisch."* · *„Sie feiern. Wir kochen."*

**CTA-Labels:** „Offerte anfragen" · „Menü entdecken" · „Per WhatsApp anfragen" · „Merken" · „Anfrage abschicken".

**Anlass-Karten:**
- **Business & Firmenanlass** — *„Znüni, Lunch, Apéro riche oder Seminar-Verpflegung: pflanzlich, sättigend, pünktlich. Auch für Teams, in denen niemand vegan lebt."*
- **Apéro & Empfang** — *„Fingerfood und Häppchen, die man ohne Teller isst — und über die man am Tag danach noch spricht."*
- **Hochzeit & Fest** — *„Buffet oder serviertes Menü. Wir planen mit Ihnen Gang für Gang — inklusive Kinder und Allergien."*
- **Privat & Familie** — *„Geburtstag, Taufe, Gartenfest. Sie laden ein, wir bringen das Essen — und räumen wieder auf."*

**Werte (Kurzform):** Geschmack zuerst · Saisonal & regional · Allergene transparent · Wenig Abfall.

**Beispiel-Karte (Seed — Namen mit Schweizer Handschrift):**
- *Apéro & Fingerfood:* Randen-Hummus-Tartelettes · Mini-Rösti mit Pilz-Tatar · Zucchini-Röllchen mit Cashew-Ricotta · Falafel-Bites mit Zitronen-Tahini · Bruschetta mit Tomate & Basilikum · Dattel-Nuss-Kugeln.
- *Vorspeisen & Salate:* Kürbis-Ingwer-Suppe · Linsensalat mit geröstetem Blumenkohl · Fenchel-Orangen-Salat · Wildkräutersalat mit Baumnüssen.
- *Hauptgänge:* Älplermagronen vegan (Cashew-Sauce, Apfelmus) · Linsen-Bolognese mit hausgemachten Tagliatelle · Ofengemüse mit Tahini-Zitrone · Pilz-Stroganoff mit Kartoffelstock · Gemüse-Curry mit Basmati.
- *Bowls & Lunch:* Buddha-Bowl (Quinoa, Röstgemüse, Edamame) · Mezze-Lunchbox · Thai-Bowl mit Erdnuss-Sauce.
- *Desserts:* Schoggi-Mousse mit Aquafaba · Apfel-Zimt-Crumble · Zitronen-Tarte · Saisonfrüchte.
- *Getränke:* Hausgemachte Eistees · Holunder-Spritz (alkoholfrei) · Kaffee & Tee.
Je Gericht: 1 Satz Beschreibung, Allergene, Tags, Preis-Platzhalter `[BESTÄTIGEN]`.

**FAQ (12):** Mindestbestellung? · Wie viel Vorlauf? · Wohin liefern Sie? · Wie gehen Sie mit Allergien um? („Jedes Gericht ist deklariert; unsere Küche verarbeitet Nüsse, Gluten und Soja — Spuren sind nicht ausgeschlossen.") · Kommt Personal mit? · Geschirr, Besteck, Gläser? · Was kostet es? („ab CHF … p.P., Offerte innert 24 h") · Wie bezahle ich? · Storno-Fristen? · Was passiert mit Resten? · Ist alles wirklich vegan? („Ja — keine Tierprodukte, kein Honig.") · Ist das Essen auch für Nicht-Veganer? („Dafür kochen wir.")

---

## 7 · TECHNIK

**Next.js 15 (App Router) + TypeScript + Tailwind v4 + shadcn/ui + framer-motion (dezent)** · `@supabase/ssr` + `@supabase/supabase-js` · `zod` + `react-hook-form` · `resend` + `react-email` · **i18n `next-intl`** `[ANNAHME]` (DE ohne Prefix, `/en`, Dictionaries `messages/de.json`, `messages/en.json`) · `next/image` mit Supabase-Loader.

**Struktur:** `app/(site)/…` · `app/(admin)/admin/…` · `app/api/…` (nur wo Server Actions nicht reichen) · `components/{ui,site,admin}` · `lib/supabase/{client,server,admin}.ts` · `lib/inquiry/{schema,actions}.ts` · `emails/` · `supabase/{migrations,seed.sql}` · `messages/`.

**SEO:** Metadata pro Route (DE/EN, `hreflang`) · OG-Bild (`/opengraph-image`) · `sitemap.ts`, `robots.ts` · JSON-LD `LocalBusiness` + `FoodService` (`servesCuisine: "Vegan"`, `areaServed`, `priceRange: "CHF"`) · saubere H1-Hierarchie · Bilder mit `alt`.

**Datenschutz-freundlich:** Vercel Analytics (cookielos) `[ANNAHME]` → **kein Cookie-Banner nötig**; keine Google-Fonts-Laufzeit (Fonts via `next/font` self-hosted); keine Embeds mit Fremd-Cookies.

**Qualität:** Accessibility WCAG AA (Kontrast, Fokus, Tastatur, `aria`, Formular-Labels, Fehlertexte) · Performance: LCP < 2,5 s mobil, Lighthouse ≥ 90 · Tests minimal (zod-Schemas, Inquiry-Action, PLZ-Check) · ESLint/Prettier · `README.md` mit Setup (Supabase CLI, Env, Seed, Admin anlegen).

---

## 8 · DEPLOY (Vercel + Supabase + Hostpoint)

1. Repo **`meaicreadig/vegancatering`** → Vercel-Projekt **`vegancatering`** (Team „Muhammed Emin Akyol's projects") → Domain **`vegancatering.ch`** + `www` als Redirect.
2. **Hostpoint DNS** (Domain ohne Hosting, Status nicht ändern): `A @ → 76.76.21.21` · `CNAME www → Wert aus dem Vercel-Panel`. Alternative Nameserver `ns1/ns2.vercel-dns.com` nur mit **DNSSEC vorher aus**.
3. **Supabase-Projekt** (Zürich) → Migrations + Seed → Keys in Vercel-Env → Auth URL-Config → Admin-User anlegen, Sign-ups aus.
4. **Resend:** Domain verifizieren → SPF/DKIM/DMARC-TXT bei Hostpoint („E-Mail-Sicherheit").
5. **Go-Live-Gate:** Impressum/Datenschutz/AGB bestätigt · echte Preise & PLZ-Liste · Testanfrage durchgelaufen (Mail bei Kunde **und** Betrieb, Eintrag im Admin) · Lighthouse mobil ≥ 90 · echte Fotos mindestens im Hero + 4 Anlass-Karten.

---

## 9 · TON & EHRLICHKEIT

Warm, klar, appetitlich — **Premium ohne Pose.** Kurze Sätze, konkrete Nomen (Randen, Rösti, Baumnüsse), keine Buzzwords („kulinarische Reise", „Erlebnis"). **Keine erfundenen Zahlen, Referenzen, Logos, Bewertungen, Auszeichnungen.** Beweis = Essen (Fotos) + Klarheit (Preise, Allergene, Ablauf). KI-Bilder kennzeichnen. Allergene nie als „frei von" versprechen ohne Küchen-Bestätigung — Spuren-Hinweis Standard. **Halal-konform:** transparente Preise, keine versteckten Gebühren, keine Dark-Pattern-Dringlichkeit („nur noch 2 Termine!").

## 10 · NICHT TUN

❌ Öko-Klischee (Blätter, Hanfbeige, Comic-Gemüse, „grün = gesund"-Optik) · ❌ generisches Restaurant-/SaaS-Template · ❌ Stock-Fotos als „unsere Küche" · ❌ erfundene „500+ Anlässe" oder Fake-Stimmen · ❌ Anfrage hinter Login oder in mehr als 4 Schritten · ❌ Service-Role-Key im Client, `anon`-Insert-Policy auf `inquiries` · ❌ Cookie-Banner ohne Grund · ❌ „ß" · ❌ Preise ohne „ab" und MwSt-Hinweis · ❌ Motion, die vom Essen ablenkt.

---

**Endergebnis:** eine **helle, warme, editoriale Food-Marke** mit grossen Fotos und Serif-Headlines, einem **4-Schritte-Anfrage-Flow**, der auf dem Handy in zwei Minuten durch ist, einem **Supabase-Backend** (Anfragen, Menü, Galerie, Settings, RLS sauber) und einem **schlichten Admin**, in dem der Betrieb Anfragen und Karte selbst pflegt. Schweizer Schreibweise, ehrliche Inhalte, deploybar auf Vercel unter vegancatering.ch. **Komplett, in einem Durchlauf.**
