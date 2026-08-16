# creaDIG — System-Haus-Seite

Next.js 15 (App Router) · TypeScript · Tailwind v4 · framer-motion.
Hell als Default, Gold als Akzent, Poppins, echtes Logo.

> **Haltung:** Die Seite ist kein Portfolio, sondern die sichtbare Form der
> Omurga in [`KIZILELMA-creaDIG.md`](KIZILELMA-creaDIG.md) und
> [`OMURGA.md`](OMURGA.md). Wer hier etwas ändert, liest die beiden zuerst.

---

## Lokal starten

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # Produktions-Build (muss grün sein, bevor gepusht wird)
```

> `npm run dev` und `npm run build` teilen sich den `.next`-Ordner. Wenn der
> Build mit `Cannot find module for page: …` abbricht, läuft noch ein
> Dev-Server — beenden, `rm -rf .next`, neu bauen.

---

## Struktur

| Pfad | Inhalt |
|---|---|
| `app/page.tsx` | Startseite: Hero → Impact → Logo-Wand → Portfolio → Leistungen → meAI → Prozess → Über uns → Pakete → Kontakt |
| `app/termin/` | 4-Schritt-Terminanfrage → WhatsApp |
| `app/impressum/`, `app/datenschutz/` | Rechtsseiten |
| `app/layout.tsx` | Schriften, Metadaten, Nav/Footer/WhatsApp/Chat für alle Routen |
| `lib/site-data.ts` | Produkte, Kundenwerk, Marken, Pakete, Kontaktdaten |
| `lib/dictionary.ts` | Sämtliche Texte, DE + TR (294 Schlüssel, paritätisch) |
| `components/brand/` | Logo-Komponente und Signatur-Motiv |
| `public/brand/` | Echte CI-Assets (Logo, Produktlogos) |
| `_legacy/` | Die alte Vanilla-Seite, vollständig archiviert |

### Marke

- **Farben** — Hintergrund `#FBFBF9`, Flächen `#F5F5F4`, Text `#2A2723`,
  Gold `#BE904E` → `#E4C378`, tiefes Gold `#8F6A33`.
  Dunkle Bänder sind warm-anthrazit `#201E1B` — **nie reines Schwarz.**
- **Schrift** — Poppins (Display + Body), JetBrains Mono nur für Eyebrows.
- **Signatur-Motiv** — `components/brand/signature-motif.tsx`, ein
  Dreiecks-/Pfeil-Raster, nachgebaut aus `corporate_creadig.ai`. Deterministisch
  (fester Seed), damit Server- und Client-Render identisch sind.
- **Logo** — `public/brand/creadig-logo.svg` (hell) und `-light.svg` (für
  dunkle Bänder). Beide sind eng beschnitten; die Höhe kommt per `className`.

### Inhaltliche Regeln

- Eigene Produkte sind **meAI · fibero · CASSAMEA · meahv** — mehr nicht.
- NÛR, Bir Damla Hayır und Rumi's Maison sind **Kundenwerk**, kein Produkt.
- Fremdmarken stehen mit `approved: false` — deshalb neutrale Beschriftung,
  kein fremdes Logo und keine Behauptung einer Kundenbeziehung.
- Keine erfundenen Zahlen, Zitate oder Verknappung.
- Bilder unter `public/works/` sind illustrative Mockups, keine Screenshots.
  Der Hinweis dazu steht sichtbar in der Werkschau.

---

## Deploy

Das Repo ist mit dem Vercel-Projekt **`creadig`** verbunden. Ein Push auf
`main` erzeugt einen Production-Deploy auf `creadig.vercel.app`; jeder andere
Branch bekommt eine Preview-URL.

`vercel.json` setzt `framework: "nextjs"` ausdrücklich, weil das Projekt in
den Vercel-Einstellungen noch aus der statischen Zeit stammt. **Diese Zeile
nicht entfernen**, solange die Projekteinstellung nicht selbst auf Next.js
umgestellt ist.

```bash
npm run build          # muss grün sein
git push origin main   # löst den Production-Deploy aus
```

## creadig.de anbinden

Der Code ist bereits domain-ready — es fehlt nur die Domain selbst.

1. **Vercel** → Projekt `creadig` → *Settings* → *Domains* → `creadig.de`
   und `www.creadig.de` hinzufügen. Vercel zeigt danach die nötigen
   DNS-Einträge an.
2. **Registrar** → die angezeigten Einträge setzen (in der Regel ein
   `A`-Record auf `76.76.21.21` für die Root-Domain und ein `CNAME` auf
   `cname.vercel-dns.com` für `www`). Maßgeblich ist immer, was Vercel anzeigt.
3. **Warten**, bis Vercel das Zertifikat ausgestellt hat (meist Minuten).
4. **Nichts am Code ändern.** `NEXT_PUBLIC_SITE_URL` steht bereits auf
   `https://creadig.de`; Canonicals, OG-URLs und JSON-LD ziehen automatisch nach.

Solange nur `creadig.vercel.app` erreichbar ist, zeigen die Canonicals schon
auf `creadig.de`. Wer das vorher vermeiden will, setzt in den Vercel-Projekt-
Variablen `NEXT_PUBLIC_SITE_URL=https://creadig.vercel.app` und entfernt sie
nach der Domain-Umstellung wieder.

---

## Offen

- Impressum: Pflichtangaben nach § 5 DDG ergänzen (Rechtsform, Anschrift,
  Registereintrag, USt-IdNr.). Die Seite existiert und benennt die Lücke.
- Datenschutz: Fassung juristisch final prüfen lassen.
- Echte Logos für **meAI** und **meahv** → `public/brand/products/`.
  Bis dahin rendert ein Monogramm, kein kaputtes Bild.
- Gründungsjahr bestätigen (`lib/site-data.ts`, `impactSignals`) — die
  KIZILELMA führt es noch als offen.
- Produkt-Mockups durch echte Screenshots ersetzen; danach den
  Mockup-Hinweis in der Werkschau entfernen.
- Social-Profile im Footer verlinken (aktuell nur Platzhalter-Kürzel).
- AI-Chat an eine echte API hängen (`components/ai-assistant.tsx`,
  `TODO: API`). Bis dahin antwortet er regelbasiert und ist als Demo
  gekennzeichnet.
