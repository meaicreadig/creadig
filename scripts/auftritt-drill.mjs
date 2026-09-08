#!/usr/bin/env node
/**
 * G14 · AUFTRITT-DRILL — die Haelfte, die nur der Browser weiss.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WARUM NICHT AUS DEM QUELLTEXT
 *
 * Alle vier G14-Zeilen der Sichtschuld handeln von etwas, das im Quelltext
 * NICHT steht. Ein Knopf hat keinen Radius, weil eine Klasse so heisst — er
 * hat einen, weil eine Kaskade aus Utility, Variante und Ueberschreibung am
 * Ende eine Zahl ergibt. Zwei Elemente kollidieren nicht, weil jemand es
 * geschrieben hat, sondern weil ein Umbruch bei 320 px anders faellt. Und
 * ein Logo ist genau dann verzerrt, wenn das gerenderte Rechteck ein
 * anderes Verhaeltnis hat als die Datei.
 *
 * Ein Gate, das das aus Klassennamen erschliessen wollte, wuerde die
 * ABSICHT pruefen. Dieser Lauf prueft das ERGEBNIS.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS ER NICHT PRUEFT
 *
 * Ob es gut aussieht. Ein Auftritt kann fehlerfrei gemessen und trotzdem
 * langweilig sein. Dafuer bleibt `npm run shots` und das Auge — der Lauf
 * hier stellt nur sicher, dass nichts BRICHT und nichts VERZERRT ist.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * AUFRUF
 *   npm run build && npm run auftritt-drill
 *   npm run auftritt-drill -- --json
 */
import { spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

import {
  BEWEGUNG_MAX_PX_S,
  MASSE_SPREIZUNG,
  TAKT_SKALA_REM,
  ausserTakt,
  VERHAELTNIS_TOLERANZ,
  ERLAUBTE_RADIEN,
  flaeche,
  optischeHoehe,
  spreizung,
  ueberlappt,
  radiusErlaubt,
} from "../lib/auftritt.ts"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const PORT = Number(process.env.AUFTRITT_PORT ?? 4327)
const BASE = `http://127.0.0.1:${PORT}`

/* Dieselben Breiten wie `mobile.mjs` — die Raender, nicht die Mitte. */
const BREITEN = [320, 360, 390, 430, 768, 1024, 1440]

/**
 * Die oeffentlichen Seiten, auf denen der Auftritt entschieden wird. Das
 * Control Center bleibt draussen: Es ist kein Auftritt, es ist Werkzeug,
 * und seine Tabellen wuerden jede Rhythmus-Messung zu Recht sprengen.
 */
const SEITEN = [
  { name: "start", pfad: "/", rolle: "Haus" },
  { name: "leistungen", pfad: "/leistungen", rolle: "Leistungen" },
  { name: "produkte", pfad: "/produkte", rolle: "Produkte" },
  { name: "arbeiten", pfad: "/arbeiten", rolle: "Arbeiten" },
  { name: "unternehmen", pfad: "/unternehmen", rolle: "Unternehmen" },
  { name: "kontakt", pfad: "/kontakt", rolle: "Kontakt" },
  { name: "termin", pfad: "/termin", rolle: "Termin" },
  { name: "start-tr", pfad: "/tr", rolle: "Haus" },
]

const seed = (dunkel) => `try{
  localStorage.setItem('creadig_consent', JSON.stringify({
    functional: true, statistics: false, version: 5, decidedAt: '2026-01-01T00:00:00.000Z'
  }));
  localStorage.setItem('creadig-theme', ${dunkel ? "'dark'" : "'light'"});
}catch(e){}`

/* ═══════════════════════════════════════════════════════════════════════════
 * DIE SONDE — laeuft IM Browser, gibt nur Zahlen zurueck
 * ═══════════════════════════════════════════════════════════════════════════ */

const SONDE = `(() => {
  const out = { radien: [], kollisionen: [], zeichen: [], rhythmus: [], takt: [], fusszeile: null, h1: null };

  const sichtbar = (el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const name = (el) => {
    const cls = typeof el.className === 'string' && el.className
      ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.')
      : '';
    return el.tagName.toLowerCase() + cls;
  };

  /* ─── A · RADIEN ────────────────────────────────────────────────────────
     Bedienelemente, und nur die. Ein Radius an einer Karte ist eine
     Kachel-Entscheidung; hier geht es um das, was man ANFASST. */
  const BEDIEN = 'button, [role="button"], input:not([type="hidden"]), select, textarea, a[class*="cta-"], a[class*="rounded"]';
  for (const el of document.querySelectorAll(BEDIEN)) {
    if (!sichtbar(el)) continue;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    /* Ein Prozentwert ist eine Pille, keine Zahl — der Browser loest ihn
       beim Rendern auf. getComputedStyle liefert ihn aufgeloest in px,
       ausser bei Prozent; dann rechnen wir ihn selbst um. */
    const roh = s.borderTopLeftRadius;
    const px = roh.endsWith('%')
      ? (parseFloat(roh) / 100) * r.width
      : parseFloat(roh) || 0;
    out.radien.push({
      radius: Math.round(px * 10) / 10,
      w: Math.round(r.width),
      h: Math.round(r.height),
      name: name(el),
      text: (el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ').slice(0, 30),
    });
  }

  /* ─── B · KOLLISION ─────────────────────────────────────────────────────
     Nur der NORMALE FLUSS. Ein Cookie-Banner, die feste Kopfzeile und der
     WhatsApp-Knopf liegen mit Absicht ueber der Seite — das ist eine
     Schicht, keine Kollision. Gesucht ist die Stelle, an der zwei Elemente
     desselben Flusses uebereinander geraten, weil der Platz nicht reicht. */
  const imFluss = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.position === 'fixed' || s.position === 'sticky' || s.position === 'absolute') return false;
      if (s.transform !== 'none') return false;
    }
    return true;
  };

  const ziele = [];
  for (const el of document.querySelectorAll('button, a[href], input:not([type="hidden"]), select, textarea, summary')) {
    if (!sichtbar(el) || !imFluss(el)) continue;
    const r = el.getBoundingClientRect();
    ziele.push({ el, r: { x: r.x, y: r.y, w: r.width, h: r.height }, n: name(el),
      t: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 24) });
  }
  for (let i = 0; i < ziele.length; i++) {
    for (let j = i + 1; j < ziele.length; j++) {
      const a = ziele[i], b = ziele[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      out.kollisionen.push({ a: { ...a.r, n: a.n, t: a.t }, b: { ...b.r, n: b.n, t: b.t } });
    }
  }

  /* ─── C · MARKENZEICHEN ─────────────────────────────────────────────────
     Das gerenderte Rechteck gegen die Datei, die Hoehe gegen die Formel,
     der Filter gegen die Deklaration. */
  for (const el of document.querySelectorAll('[data-zeichen]')) {
    if (!sichtbar(el)) continue;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    out.zeichen.push({
      marke: el.getAttribute('data-zeichen'),
      soll: Number(el.getAttribute('data-verhaeltnis')),
      dunkel: el.getAttribute('data-dunkel'),
      w: r.width,
      h: r.height,
      basis: parseFloat(s.getPropertyValue('--zeichen-basis')) || 0,
      filter: s.filter,
      objectFit: s.objectFit,
      opazitaet: Number(s.opacity),
    });
  }

  /* ─── D · RHYTHMUS ──────────────────────────────────────────────────────
     DIE LUFT, DIE EIN ABSCHNITT SELBST MITBRINGT — als CSS-Wert, nicht als
     Abstand zwischen zwei Rechtecken.

     Vier Anlaeufe. Die ersten drei waren falsch, und jeder war es anders:

       1 · Abstand zwischen den Rechtecken. Ueberall Null: Die Abschnitte
           stossen aneinander, ihre Luft sitzt innen.
       2 · Dazu die Innenabstaende der <section>. Auch fast Null: Die Luft
           sitzt an einem Behaelter DARIN (section-shell, section-seam).
       3 · Die Strecke von Inhalt zu Inhalt. Richtig gemessen, aber ein
           PROXY — und ein verrauschter: Zeilenhoehe, Unterlaengen und
           Haarlinien verschieben ihn um bis zu sechs Pixel. Mit einer
           Toleranz, die das auffaengt, findet die Regel nichts mehr; mit
           einer engeren meldet sie Schriftmetrik als Designfehler. Ein Gate,
           das dreizehn Befunde meldet und bei elf davon irrt, wird nach
           einer Woche ignoriert — und findet dann auch die zwei echten
           nicht mehr.

     Also: der Behaelter, der die Luft TRAEGT, und sein gerechneter
     padding-block. Das ist keine Annaeherung, das ist der Wert selbst.
     Gesucht wird er von aussen nach innen; der erste Behaelter mit
     nennenswertem Innenabstand ist die Sektionshuelle. */
  const huelle = (wurzel) => {
    const lauf = document.createTreeWalker(wurzel, NodeFilter.SHOW_ELEMENT);
    let el = wurzel;
    while (el) {
      if (sichtbar(el)) {
        const s = getComputedStyle(el);
        const oben = parseFloat(s.paddingTop) || 0;
        const unten = parseFloat(s.paddingBottom) || 0;
        /* 32 px ist die Grenze zwischen Innenabstand einer Karte und der
           Luft eines Abschnitts. Darunter ist es Polsterung, darueber Takt. */
        if (oben >= 32 || unten >= 32) return { oben, unten };
      }
      el = lauf.nextNode();
    }
    return null;
  };

  const haupt = document.querySelector('main') || document.body;
  for (const el of [...haupt.children].filter((e) => sichtbar(e) && imFluss(e))) {
    const h = huelle(el);
    if (!h) continue;
    out.rhythmus.push(h.oben, h.unten);
    out.takt.push({ oben: Math.round(h.oben), unten: Math.round(h.unten), n: name(el) });
  }

  /* ─── E · FUSSZEILE ─────────────────────────────────────────────────────
     Die Rollen, die eine Fusszeile tragen muss. Gesucht wird die WIRKUNG:
     ein Link auf das Impressum, einer auf den Datenschutz, ein Weg zur
     Einwilligung, ein Sprachwechsel — egal wie das Element heisst. */
  const fuss = document.querySelector('footer');
  if (fuss) {
    const r = fuss.getBoundingClientRect();
    const hrefs = [...fuss.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') || '');
    const text = (fuss.textContent || '').toLowerCase();
    out.fusszeile = {
      hoehe: Math.round(r.height),
      marke: !!fuss.querySelector('svg, img'),
      impressum: hrefs.some((h) => /impressum|legal-notice|kuenstsel/i.test(h)),
      datenschutz: hrefs.some((h) => /datenschutz|privacy|gizlilik/i.test(h)),
      einwilligung: !!fuss.querySelector('button') && /cookie|einwillig|çerez|consent/i.test(text),
      navigation: hrefs.filter((h) => h.startsWith('/') || h.startsWith('#')).length,
    };
  }

  const h1 = document.querySelector('h1');
  out.h1 = h1 ? (h1.textContent || '').trim().replace(/\\s+/g, ' ') : null;

  return out;
})()`

/** Bewegung: zweimal messen, Differenz durch Zeit. */
const BEWEGUNG = `(async () => {
  const bahn = document.querySelector('.animate-marquee-left, .animate-marquee-right');
  if (!bahn) return null;
  const lies = () => {
    const m = new DOMMatrixReadOnly(getComputedStyle(bahn).transform);
    return m.m41;
  };
  const a = lies();
  await new Promise((r) => setTimeout(r, 1000));
  const b = lies();
  return { versatz: Math.abs(b - a) };
})()`

/* ═══════════════════════════════════════════════════════════════════════════ */

async function warteAufServer(frist = 90_000) {
  const ende = Date.now() + frist
  while (Date.now() < ende) {
    try {
      const r = await fetch(`${BASE}/`, { redirect: "manual" })
      if (r.status < 500) return
    } catch {
      /* noch nicht da */
    }
    await new Promise((r) => setTimeout(r, 400))
  }
  throw new Error(`Server kam auf ${BASE} nicht hoch.`)
}

const alsJson = process.argv.includes("--json")

/*
 * Beim Reparieren will man EINE Stelle sehen, nicht 112. Dieselbe Bequemlich-
 * keit wie `npm run shots -- --only=`: der volle Lauf bleibt die Vorgabe.
 *
 *   npm run auftritt-drill -- --nur=start --breite=390
 */
const nurArg = process.argv.find((a) => a.startsWith("--nur="))?.slice(6)
const breiteArg = process.argv.find((a) => a.startsWith("--breite="))?.slice(9)
const SEITEN_LAUF = nurArg ? SEITEN.filter((s) => nurArg.split(",").includes(s.name)) : SEITEN
const BREITEN_LAUF = breiteArg ? breiteArg.split(",").map(Number) : BREITEN
const TEILLAUF = SEITEN_LAUF.length !== SEITEN.length || BREITEN_LAUF.length !== BREITEN.length

/*
 * DER SERVER FAELLT — UND DAS IST BEKANNT.
 *
 * `docs/brand/design-system.md` fuehrt es seit Wochen als Backlog: „a11y und
 * shots verlieren gelegentlich ihren `next start` mitten im Lauf (Exit 0,
 * kein Log)." Dieser Lauf faehrt 112 Seiten und traf es beim ersten Versuch
 * nach 32 — er wuerde ohne Gegenmittel haeufiger scheitern als bestehen.
 *
 * Was NICHT die Loesung waere: den Fehler verschlucken. Ein Lauf, der eine
 * halbe Messung als Erfolg meldet, ist schlimmer als gar keiner.
 *
 * Also: neu starten, dieselbe Seite noch einmal, und MITZAEHLEN. Steht am
 * Ende eine Zahl groesser null, sagt der Lauf sie — der Backlog-Eintrag
 * bekommt damit zum ersten Mal eine gemessene Haeufigkeit statt eines
 * „gelegentlich".
 */
let server = null
let neustarts = 0

function starteServer() {
  server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    cwd: ROOT,
    stdio: "ignore",
    env: { ...process.env, NODE_ENV: "production" },
  })
}

async function serverLebt() {
  try {
    const r = await fetch(`${BASE}/`, { redirect: "manual" })
    return r.status < 500
  } catch {
    return false
  }
}

async function stelleServerSicher() {
  if (await serverLebt()) return
  neustarts++
  server?.kill("SIGKILL")
  starteServer()
  await warteAufServer()
}

starteServer()

const befunde = []
const rollen = new Map()
const takte = new Map()
let abbruch = null
let browser
let gemessen = 0

try {
  await warteAufServer()
  try {
    browser = await chromium.launch({ channel: "chrome" })
  } catch {
    browser = await chromium.launch()
  }

  if (!alsJson) console.log(`\nAuftritt-Drill gegen ${BASE}\n`)

  for (const breite of BREITEN_LAUF) {
    for (const dunkel of [false, true]) {
      const kontext = await browser.newContext({
        viewport: { width: breite, height: 900 },
        deviceScaleFactor: 2,
        colorScheme: dunkel ? "dark" : "light",
        /* Die Abschnitte blenden sich beim Scrollen ein (`reveal.tsx`).
           Ohne `reduce` waeren halbe Seiten unsichtbar und liefen deshalb
           scheinbar nirgends ueber. Die Bewegung des Logo-Streifens wird
           in einem EIGENEN Kontext gemessen, weiter unten. */
        reducedMotion: "reduce",
      })
      await kontext.addInitScript(seed(dunkel))

      for (const seite of SEITEN_LAUF) {
        const page = await kontext.newPage()
        try {
          await page.goto(`${BASE}${seite.pfad}`, { waitUntil: "load" })
        } catch {
          /* Genau der bekannte Ausfall. Einmal neu, dann muss es gehen. */
          await stelleServerSicher()
          await page.goto(`${BASE}${seite.pfad}`, { waitUntil: "load" })
        }
        await page.evaluate(async () => {
          const schritt = window.innerHeight
          for (let y = 0; y < document.body.scrollHeight; y += schritt) {
            window.scrollTo(0, y)
            await new Promise((r) => setTimeout(r, 60))
          }
          window.scrollTo(0, 0)
        })
        await page.waitForTimeout(150)

        const ergebnis = await page.evaluate(SONDE)
        gemessen++
        const ort = { breite, grund: dunkel ? "dunkel" : "hell", seite: seite.name }

        /* A · Radien */
        for (const r of ergebnis.radien) {
          if (!radiusErlaubt(r.radius, r.w, r.h)) {
            befunde.push({
              art: "radius",
              ...ort,
              text: `${r.name} „${r.text}" hat ${r.radius} px — erlaubt sind ${ERLAUBTE_RADIEN.join(" / ")} px oder die volle Pille.`,
            })
          }
        }

        /* B · Kollision */
        for (const k of ergebnis.kollisionen) {
          const flaecheUeber = ueberlappt(k.a, k.b)
          if (flaecheUeber > 0) {
            befunde.push({
              art: "kollision",
              ...ort,
              text: `${k.a.n} „${k.a.t}" liegt auf ${k.b.n} „${k.b.t}" — ${flaecheUeber} px² Ueberdeckung.`,
            })
          }
        }

        /* C · Markenzeichen */
        const flaechen = []
        for (const z of ergebnis.zeichen) {
          const ist = z.w / z.h
          const abweichung = Math.abs(ist - z.soll) / z.soll
          if (abweichung > VERHAELTNIS_TOLERANZ) {
            befunde.push({
              art: "logo-verhaeltnis",
              ...ort,
              text:
                `${z.marke} steht in einem Rechteck von ${ist.toFixed(2)} : 1, die Datei ist ` +
                `${z.soll.toFixed(2)} : 1 (${(abweichung * 100).toFixed(0)} % daneben). ` +
                (z.objectFit === "contain"
                  ? "Das Bild ist dank object-contain nicht verzerrt, aber die Kachel druckt es kleiner als berechnet."
                  : "Das Bild ist damit VERZERRT."),
            })
          }
          if (z.objectFit !== "contain") {
            befunde.push({
              art: "logo-verhaeltnis",
              ...ort,
              text: `${z.marke} rendert mit object-fit: ${z.objectFit}. Wird die Breite je gekappt, verzerrt es.`,
            })
          }
          if (z.basis > 0) {
            const soll = optischeHoehe(z.soll, z.basis)
            if (Math.abs(soll - z.h) > 1.5) {
              befunde.push({
                art: "logo-groesse",
                ...ort,
                text:
                  `${z.marke} ist ${z.h.toFixed(1)} px hoch, die optische Hoehe waere ` +
                  `${soll} px (Basis ${z.basis}). Stylesheet und Formel laufen auseinander.`,
              })
            }
            flaechen.push(flaeche(z.soll, z.h))
          }
          if (dunkel && z.dunkel === "original" && /invert|brightness\(0/.test(z.filter)) {
            befunde.push({
              art: "logo-farbe",
              ...ort,
              text: `${z.marke} ist als „original" deklariert, traegt auf dunklem Grund aber ${z.filter}.`,
            })
          }
          if (z.opazitaet < 0.5) {
            befunde.push({
              art: "logo-kontrast",
              ...ort,
              text: `${z.marke} steht bei Deckkraft ${z.opazitaet} — unter der Sichtbarkeitsgrenze.`,
            })
          }
        }
        if (flaechen.length >= 2) {
          const f = spreizung(flaechen)
          if (f > MASSE_SPREIZUNG) {
            befunde.push({
              art: "logo-groesse",
              ...ort,
              text: `Die Markenzeichen stehen ${f.toFixed(2)} : 1 auseinander (erlaubt ${MASSE_SPREIZUNG}).`,
            })
          }
        }

        /* D · Rhythmus */
        /* Der Hero richtet sich an der Bildschirmhoehe aus, nicht am
           Sektions-Raster — so steht es im Design-System. Seine Luft ist
           deshalb kein Taktwert. */
        /* Der Hero richtet sich an der Bildschirmhoehe aus, nicht am
           Sektions-Raster — so steht es im Design-System. Seine Luft ist
           deshalb kein Taktwert.

           Ebenfalls draussen: Abschnitte, deren Inhalt ueber das eigene
           Rechteck hinausragt (Parallaxe, angeschnittene Bilder). Dort ist
           die „eigene Luft" negativ, und eine negative Luft ist kein
           Taktwert, sondern eine andere Bauart. */
        const ohneHero = ergebnis.takt.slice(1)
        const werte = ohneHero.flatMap((t) => [t.oben, t.unten]).filter((v) => v > 0)
        takte.set(`${seite.name}@${breite}`, { werte: [...new Set(werte)].sort((a, b) => a - b), paare: ergebnis.takt })
        for (const raus of ausserTakt(werte)) {
          befunde.push({
            art: "rhythmus",
            ...ort,
            text:
              `Ein Abschnitt traegt ${raus.px} px (${raus.rem} rem) Luft. ` +
              `Die Taktskala des Hauses kennt ${TAKT_SKALA_REM.join(" / ")} rem — ` +
              `${raus.rem} gehoert zu keiner Rolle.`,
          })
        }

        /* E · Fusszeile */
        const f = ergebnis.fusszeile
        if (!f) {
          befunde.push({ art: "fusszeile", ...ort, text: "Es gibt keine Fusszeile." })
        } else {
          for (const [rolle, da] of [
            ["Marke", f.marke],
            ["Impressum", f.impressum],
            ["Datenschutz", f.datenschutz],
            ["Einwilligung", f.einwilligung],
          ]) {
            if (!da) {
              befunde.push({ art: "fusszeile", ...ort, text: `Der Fusszeile fehlt die Rolle „${rolle}".` })
            }
          }
        }

        /* F · Seitenrolle */
        if (ergebnis.h1) {
          const bisher = rollen.get(ergebnis.h1)
          if (bisher && bisher !== seite.rolle) {
            befunde.push({
              art: "seitenrolle",
              ...ort,
              text: `„${ergebnis.h1}" steht auf zwei Seiten mit verschiedenen Rollen (${bisher} / ${seite.rolle}).`,
            })
          }
          rollen.set(ergebnis.h1, seite.rolle)
        } else {
          befunde.push({ art: "seitenrolle", ...ort, text: "Die Seite hat keine h1 — sie sagt ihre Rolle nicht." })
        }

        await page.close()
      }
      await kontext.close()
    }
    if (!alsJson) {
      const n = befunde.filter((b) => b.breite === breite).length
      console.log(`  ${String(breite).padStart(4)} px   ${n === 0 ? "ok" : `${n} Befund(e)`}`)
    }
  }

  /* ═══ DAS GERAET OHNE ZEIGER ═══════════════════════════════════════════
   *
   * Der Lauf oben faehrt mit Maus. Genau deshalb sieht er den Fehler nicht,
   * um den es hier geht: Die Markenzeichen liegen in Ruhe grau und halb
   * durchsichtig und bekommen ihre Farbe erst beim HOVER. Auf einem Telefon
   * gibt es kein Hover — dort hat noch nie jemand ein Logo dieses Hauses in
   * seiner Farbe gesehen, und niemand hat es gemerkt, weil jede Pruefung
   * mit einem Zeiger lief.
   *
   * `hasTouch` schaltet in Chrome `pointer: coarse`. Was hier gemessen wird,
   * ist der RUHEZUSTAND: kein Graufilter, volle Deckkraft, ohne dass jemand
   * etwas beruehrt.
   */
  const tippen = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
    colorScheme: "light",
    reducedMotion: "reduce",
  })
  await tippen.addInitScript(seed(false))
  const tp = await tippen.newPage()
  await tp.goto(`${BASE}/`, { waitUntil: "load" })
  await tp.waitForTimeout(300)
  const ruhe = await tp.evaluate(`(() => {
    return [...document.querySelectorAll('[data-zeichen]')].slice(0, 8).map((el) => {
      const s = getComputedStyle(el);
      return { marke: el.getAttribute('data-zeichen'), filter: s.filter, deckkraft: Number(s.opacity) };
    });
  })()`)
  for (const z of ruhe) {
    if (/grayscale\((?!0%?\))/.test(z.filter)) {
      befunde.push({
        art: "logo-farbe",
        breite: 390,
        grund: "hell",
        seite: "start (Fingergeraet)",
        text: `${z.marke} liegt auf einem Geraet ohne Zeiger in Ruhe grau (${z.filter}) — dort kommt kein Hover, der die Farbe zurueckholt.`,
      })
    }
    if (z.deckkraft < 0.99) {
      befunde.push({
        art: "logo-kontrast",
        breite: 390,
        grund: "hell",
        seite: "start (Fingergeraet)",
        text: `${z.marke} bleibt auf einem Geraet ohne Zeiger bei Deckkraft ${z.deckkraft}.`,
      })
    }
  }
  if (!alsJson && ruhe.length > 0) {
    console.log(`\n  Ohne Zeiger  ${ruhe.length} Zeichen in Ruhe: ${ruhe.every((z) => z.deckkraft > 0.99) ? "farbig" : "grau"}`)
  }
  await tp.close()
  await tippen.close()

  /* ═══ BEWEGUNG — eigener Kontext, denn hier darf sie NICHT abgeschaltet sein ═══ */
  const bewegt = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" })
  await bewegt.addInitScript(seed(false))
  const bp = await bewegt.newPage()
  await bp.goto(`${BASE}/`, { waitUntil: "load" })
  await bp.waitForTimeout(300)
  const lauf = await bp.evaluate(BEWEGUNG)
  if (lauf) {
    const pxs = lauf.versatz
    if (pxs > BEWEGUNG_MAX_PX_S) {
      befunde.push({
        art: "bewegung",
        breite: 1440,
        grund: "hell",
        seite: "start",
        text: `Der Logo-Streifen laeuft ${pxs.toFixed(0)} px/s — ruhig sind hoechstens ${BEWEGUNG_MAX_PX_S}.`,
      })
    }
    if (!alsJson) console.log(`\n  Bewegung   ${pxs.toFixed(0)} px/s (Grenze ${BEWEGUNG_MAX_PX_S})`)
  }
  await bp.close()
  await bewegt.close()

  /* Und dieselbe Messung mit `reduce` — dort muss sie NULL sein. */
  const ruhig = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    reducedMotion: "reduce",
  })
  await ruhig.addInitScript(seed(false))
  const rp = await ruhig.newPage()
  await rp.goto(`${BASE}/`, { waitUntil: "load" })
  await rp.waitForTimeout(300)
  const still = await rp.evaluate(BEWEGUNG)
  if (still && still.versatz > 1) {
    befunde.push({
      art: "bewegung",
      breite: 1440,
      grund: "hell",
      seite: "start",
      text: `Bei „reduzierte Bewegung" laeuft der Streifen weiter (${still.versatz.toFixed(0)} px/s).`,
    })
  }
  if (!alsJson) console.log(`  Bei reduzierter Bewegung: ${still ? still.versatz.toFixed(0) : 0} px/s`)
  await rp.close()
  await ruhig.close()
} catch (e) {
  /* Ein Absturz darf die bis dahin gemessenen Befunde nicht mitnehmen —
     sonst sucht man beim naechsten Lauf dieselben noch einmal. */
  abbruch = e
} finally {
  await browser?.close()
  server?.kill("SIGTERM")
}

if (process.argv.includes("--takt")) {
  console.log("\nGemessener Takt je Seite (Luft zwischen zwei Abschnitten, auf 8 px gerundet):")
  for (const [wo, t] of takte) {
    console.log(`  ${wo.padEnd(24)} ${t.werte.join(", ")}`)
    if (process.argv.includes("--takt-detail")) {
      for (const p of t.paare) console.log(`      oben ${String(p.oben).padStart(4)}  unten ${String(p.unten).padStart(4)}   ${p.n}`)
    }
  }
  console.log("")
}

if (alsJson) {
  console.log(JSON.stringify(befunde, null, 2))
  process.exit(befunde.length === 0 ? 0 : 1)
}

if (befunde.length > 0) {
  /* Derselbe Befund auf zwoelf Breiten ist EIN Fehler, nicht zwoelf. */
  const gruppen = new Map()
  for (const b of befunde) {
    const schluessel = `${b.art}|${b.text}`
    if (!gruppen.has(schluessel)) gruppen.set(schluessel, { ...b, orte: [] })
    gruppen.get(schluessel).orte.push(`${b.breite}/${b.grund}/${b.seite}`)
  }
  console.log(`\n  ${gruppen.size} Befund(e) auf ${befunde.length} Messstelle(n):\n`)
  for (const g of gruppen.values()) {
    console.log(`  · [${g.art}] ${g.text}`)
    console.log(`      ${g.orte.length > 4 ? `${g.orte.slice(0, 4).join("  ")}  … +${g.orte.length - 4}` : g.orte.join("  ")}`)
  }
  console.log("")
  process.exit(1)
}

if (abbruch) {
  console.error(`\nABGEBROCHEN nach ${gemessen} Messstelle(n): ${abbruch.message?.split("\n")[0]}`)
  console.error("Die bis dahin gefundenen Befunde stehen oben — der Lauf ist NICHT gruen.\n")
  process.exit(1)
}

if (TEILLAUF) {
  console.log(
    `\nTEILLAUF — ${gemessen} Messstelle(n) ohne Befund. ` +
      "Das ist kein Gate-Beweis; dafuer laeuft der Drill ohne --nur/--breite.\n",
  )
  process.exit(0)
}

console.log(
  `\n${gemessen} Messstellen (${BREITEN_LAUF.length} Breiten × 2 Graende × ${SEITEN_LAUF.length} Seiten):\n` +
    "  jeder Radius aus der Rollen-Tabelle · nichts liegt aufeinander ·\n" +
    "  jedes Markenzeichen in seinem Verhaeltnis und seiner optischen Groesse ·\n" +
    "  ein Takt je Seite · die Fusszeile vollstaendig · die Bewegung ruhig.\n\n" +
    "Das sagt NICHT, dass es gut aussieht — nur, dass nichts bricht und nichts verzerrt ist.\n" +
    (neustarts > 0
      ? `\nHinweis: Der Server (next start) fiel ${neustarts}× mitten im Lauf aus und wurde neu gestartet.\n` +
        "Das ist der bekannte Backlog-Eintrag aus dem Design-System, keine Regression dieses Gates.\n"
      : ""),
)
