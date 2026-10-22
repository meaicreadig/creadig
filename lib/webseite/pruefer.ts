import "server-only"

import { generateText } from "ai"
import { revalidatePath } from "next/cache"

import { neonAbfrage, type Abfrage } from "@/lib/neon-abfrage"
import { SITE_URL } from "@/lib/routes"

import { PFLICHT, SOLL_KURZ, VERBOTEN, WIDERSPRUECHE } from "./soll"

/**
 * Website-Prüfer (Abteilung IT & Sicherheit).
 * Täglich: Erreichbarkeit, Tempo, SEO, Sprachen, Sicherheit, tote Links, Aktualität.
 * Wöchentlich: Google PageSpeed (Leistung/Barrierefreiheit) + Design-Blick der KI auf den echten Bildschirm.
 * Was er selbst darf: Seiten neu aufbauen lassen (Cache). Alles andere → Auftrag an die zuständige Abteilung,
 * Code-Änderungen → Bericht an die Geschäftsleitung mit fertiger Anweisung für die Umsetzung.
 */

export type Bereich = "inhalt" | "technik" | "sicherheit" | "international" | "leistung" | "design"
export type Schwere = "kritisch" | "wichtig" | "hinweis"
export type Erledigung = "behoben" | "abteilung" | "emin"

export type Befund = {
  code: string
  bereich: Bereich
  schwere: Schwere
  titel: string
  detail: string
  url?: string
  erledigung: Erledigung
  an?: string
}

export type Pruefung = {
  id: string
  erstelltAm: string
  noten: Record<Bereich, number>
  gesamt: number
  befunde: Befund[]
  seiten: number
  psi: { leistung: number; barriere: number; praxis: number; seo: number; lcp: string; cls: string } | null
  anweisung: string
}

export const BEREICHE: Bereich[] = ["inhalt", "technik", "sicherheit", "international", "leistung", "design"]

const SPRACHEN = [
  { pfad: "", lang: "de" },
  { pfad: "/en", lang: "en" },
  { pfad: "/tr", lang: "tr" },
  { pfad: "/ar", lang: "ar" },
]

let bereit: Promise<void> | null = null
async function db(): Promise<Abfrage | null> {
  const q = neonAbfrage()
  if (!q) return null
  bereit ??= q(
    `CREATE TABLE IF NOT EXISTS webseite_pruefungen (
      id text PRIMARY KEY, erstellt_at timestamptz NOT NULL DEFAULT now(),
      noten jsonb NOT NULL, gesamt int NOT NULL, befunde jsonb NOT NULL, seiten int NOT NULL,
      psi jsonb, anweisung text NOT NULL DEFAULT ''
    )`,
    [],
  ).then(() => undefined)
  await bereit
  return q
}

function zeile(r: Record<string, unknown>): Pruefung {
  return {
    id: String(r.id),
    erstelltAm: new Date(String(r.erstellt_at)).toISOString(),
    noten: r.noten as Pruefung["noten"],
    gesamt: Number(r.gesamt),
    befunde: (r.befunde as Befund[]) ?? [],
    seiten: Number(r.seiten),
    psi: (r.psi as Pruefung["psi"]) ?? null,
    anweisung: String(r.anweisung ?? ""),
  }
}

export async function ladeLetztePruefung(): Promise<Pruefung | null> {
  const q = await db().catch(() => null)
  if (!q) return null
  const r = (await q(`SELECT * FROM webseite_pruefungen ORDER BY erstellt_at DESC LIMIT 1`, []))[0]
  return r ? zeile(r) : null
}

export async function ladeVerlauf(n = 14): Promise<{ id: string; gesamt: number }[]> {
  const q = await db().catch(() => null)
  if (!q) return []
  const rows = await q(`SELECT id, gesamt FROM webseite_pruefungen ORDER BY erstellt_at DESC LIMIT $1`, [n])
  return rows.map((r) => ({ id: String(r.id), gesamt: Number(r.gesamt) })).reverse()
}

/* ---------- Abruf ---------- */

type Seite = { url: string; status: number; ms: number; html: string; kopf: Headers | null }

async function hole(url: string, ms = 15000): Promise<Seite> {
  const start = Date.now()
  try {
    const r = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(ms),
      headers: { "user-agent": "creaDIG-Websitepruefer/1.0", "accept-language": "de" },
      cache: "no-store",
    })
    const typ = r.headers.get("content-type") ?? ""
    const html = typ.includes("html") || typ.includes("xml") || typ.includes("text") ? await r.text() : ""
    return { url, status: r.status, ms: Date.now() - start, html, kopf: r.headers }
  } catch {
    return { url, status: 0, ms: Date.now() - start, html: "", kopf: null }
  }
}

const meta = (html: string, name: string) =>
  html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`, "i"))?.[1] ??
  html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`, "i"))?.[1] ??
  null

const sichtbarerText = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()

const DEUTSCHE_WOERTER = /\b(und|der|die|das|mit|für|nicht|Ihre|wir|unsere|Sie)\b/g

/* ---------- Prüfung ---------- */

export async function pruefeWebseite(o: { tief?: boolean } = {}): Promise<Pruefung> {
  const basis = SITE_URL.replace(/\/$/, "")
  const host = new URL(basis).host
  const befunde: Omit<Befund, "erledigung">[] = []
  const neu = (b: Omit<Befund, "erledigung">) => befunde.push(b)

  /* Sitemap = die öffentliche Wahrheit, welche Seiten es gibt. */
  const [sitemap, robots] = await Promise.all([hole(`${basis}/sitemap.xml`), hole(`${basis}/robots.txt`)])
  const sitemapUrls = [...sitemap.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
  if (sitemap.status !== 200 || !sitemapUrls.length)
    neu({ code: "sitemap", bereich: "technik", schwere: "kritisch", titel: "Sitemap fehlt oder ist leer", detail: `${basis}/sitemap.xml antwortet mit ${sitemap.status}. Google findet neue Seiten dann nur zufällig.`, an: "entwicklung" })
  if (robots.status !== 200)
    neu({ code: "robots", bereich: "technik", schwere: "wichtig", titel: "robots.txt fehlt", detail: `Antwort ${robots.status}.`, an: "entwicklung" })
  else if (!/sitemap:/i.test(robots.html))
    neu({ code: "robots-sitemap", bereich: "technik", schwere: "hinweis", titel: "robots.txt nennt die Sitemap nicht", detail: "Eine Zeile „Sitemap: …/sitemap.xml“ hilft Suchmaschinen.", an: "entwicklung" })

  const sprachSeiten = SPRACHEN.map((s) => `${basis}${s.pfad || "/"}`)
  /* Täglich ein anderes Fenster aus der Sitemap — in einer Woche ist jede Seite einmal dran. */
  const rest = sitemapUrls.filter((u) => !sprachSeiten.includes(u) && !sprachSeiten.includes(`${u}/`))
  const fenster = 30
  const versatz = rest.length > fenster ? (Math.floor(Date.now() / 86400000) * fenster) % rest.length : 0
  const weitere = [...rest, ...rest].slice(versatz, versatz + Math.min(fenster, rest.length))
  /* Rechtstexte stehen nicht in der Sitemap, müssen aber jeden Tag stimmen. */
  const recht = ["/impressum", "/datenschutz", "/tr/impressum", "/tr/datenschutz"].map((p) => `${basis}${p}`).filter((u) => !weitere.includes(u))
  const seiten = await Promise.all([...sprachSeiten, ...weitere, ...recht].map((u) => hole(u)))
  const start = seiten[0]

  /* Sicherheit: echte Antwort-Header der Startseite. */
  if (start.kopf) {
    const k = start.kopf
    const fehlt = [
      ["strict-transport-security", "HSTS (erzwingt HTTPS)"],
      ["x-content-type-options", "nosniff"],
      ["referrer-policy", "Referrer-Policy"],
    ].filter(([h]) => !k.get(h))
    if (fehlt.length)
      neu({ code: "header", bereich: "sicherheit", schwere: "wichtig", titel: "Sicherheits-Header fehlen", detail: fehlt.map((f) => f[1]).join(", "), an: "it" })
    if (!k.get("content-security-policy") && !k.get("content-security-policy-report-only"))
      neu({ code: "csp", bereich: "sicherheit", schwere: "wichtig", titel: "Keine Content-Security-Policy", detail: "Ohne CSP kann eingeschleuster Code leichter ausgeführt werden.", an: "it" })
    if (k.get("x-powered-by"))
      neu({ code: "powered-by", bereich: "sicherheit", schwere: "hinweis", titel: "Server verrät seine Technik", detail: `x-powered-by: ${k.get("x-powered-by")}`, an: "it" })
  }
  const http = await fetch(`http://${host}/`, { redirect: "manual", signal: AbortSignal.timeout(8000) }).catch(() => null)
  if (http && !(http.status >= 300 && http.status < 400 && (http.headers.get("location") ?? "").startsWith("https://")))
    neu({ code: "https", bereich: "sicherheit", schwere: "kritisch", titel: "HTTP leitet nicht auf HTTPS um", detail: `http://${host}/ antwortet mit ${http.status}.`, an: "it" })

  /* Je Seite: Erreichbarkeit, Tempo, SEO-Grundlagen, Barrierefreiheit. */
  for (const s of seiten) {
    const pfad = s.url.replace(basis, "") || "/"
    if (s.status !== 200) {
      neu({ code: `status:${pfad}`, bereich: "technik", schwere: "kritisch", titel: `Seite nicht erreichbar: ${pfad}`, detail: `Antwort ${s.status || "keine (Zeitüberschreitung)"}.`, url: s.url, an: "entwicklung" })
      continue
    }
    if (s.ms > 2500)
      neu({ code: `langsam:${pfad}`, bereich: "leistung", schwere: s.ms > 5000 ? "wichtig" : "hinweis", titel: `Langsame Antwort: ${pfad}`, detail: `${(s.ms / 1000).toFixed(1)} s bis die Seite da ist (Ziel unter 1 s).`, url: s.url, an: "entwicklung" })
    if (s.html.length > 900_000)
      neu({ code: `schwer:${pfad}`, bereich: "leistung", schwere: "hinweis", titel: `Sehr große Seite: ${pfad}`, detail: `${Math.round(s.html.length / 1024)} KB HTML.`, url: s.url, an: "entwicklung" })
    const titel = s.html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? ""
    if (!titel) neu({ code: `titel:${pfad}`, bereich: "inhalt", schwere: "wichtig", titel: `Kein Seitentitel: ${pfad}`, detail: "Google zeigt dann irgendeinen Text.", url: s.url, an: "marketing" })
    else if (titel.length > 70) neu({ code: `titel-lang:${pfad}`, bereich: "inhalt", schwere: "hinweis", titel: `Seitentitel zu lang: ${pfad}`, detail: `${titel.length} Zeichen – Google schneidet ab ca. 60 ab: „${titel.slice(0, 80)}“`, url: s.url, an: "marketing" })
    const beschreibung = meta(s.html, "description")
    if (!beschreibung) neu({ code: `desc:${pfad}`, bereich: "inhalt", schwere: "wichtig", titel: `Keine Beschreibung für Google: ${pfad}`, detail: "Ohne meta description entscheidet Google selbst, was im Suchergebnis steht.", url: s.url, an: "marketing" })
    else if (beschreibung.length > 170) neu({ code: `desc-lang:${pfad}`, bereich: "inhalt", schwere: "hinweis", titel: `Beschreibung zu lang: ${pfad}`, detail: `${beschreibung.length} Zeichen (Ziel 120–160).`, url: s.url, an: "marketing" })
    if (!meta(s.html, "og:image")) neu({ code: `og:${pfad}`, bereich: "inhalt", schwere: "hinweis", titel: `Kein Vorschaubild beim Teilen: ${pfad}`, detail: "LinkedIn/WhatsApp zeigen dann eine leere Karte.", url: s.url, an: "entwicklung" })
    if (/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(s.html) && sitemapUrls.includes(s.url))
      neu({ code: `noindex:${pfad}`, bereich: "technik", schwere: "kritisch", titel: `Seite in Sitemap, aber für Google gesperrt: ${pfad}`, detail: "noindex widerspricht der Sitemap.", url: s.url, an: "entwicklung" })
    const h1 = (s.html.match(/<h1[\s>]/gi) ?? []).length
    if (h1 !== 1) neu({ code: `h1:${pfad}`, bereich: "inhalt", schwere: "hinweis", titel: `${h1 === 0 ? "Keine" : h1} Hauptüberschrift(en): ${pfad}`, detail: "Genau eine H1 je Seite ist für Google und Screenreader am klarsten.", url: s.url, an: "entwicklung" })
    const ohneAlt = (s.html.match(/<img(?![^>]*\balt=)[^>]*>/gi) ?? []).length
    if (ohneAlt) neu({ code: `alt:${pfad}`, bereich: "design", schwere: "hinweis", titel: `${ohneAlt} Bild(er) ohne Beschreibung: ${pfad}`, detail: "Fehlender alt-Text schadet Barrierefreiheit (BFSG ab 2025) und SEO.", url: s.url, an: "entwicklung" })
    const kanon = s.html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? s.html.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)?.[1]
    const eigeneSprache = SPRACHEN.find((sp) => sp.pfad && (pfad === sp.pfad || pfad.startsWith(`${sp.pfad}/`)))?.pfad ?? ""
    if (kanon && eigeneSprache && !kanon.replace(basis, "").startsWith(eigeneSprache))
      neu({ code: `canonical-sprache:${pfad}`, bereich: "international", schwere: "wichtig", titel: `Kanonische Adresse zeigt auf eine andere Sprache: ${pfad}`, detail: `canonical = ${kanon}. Google hält die Seite dann für ein Duplikat und zeigt sie nicht.`, url: s.url, an: "entwicklung" })
    if (!kanon)
      neu({ code: `canonical:${pfad}`, bereich: "technik", schwere: "hinweis", titel: `Keine kanonische Adresse: ${pfad}`, detail: "Hilft Google, doppelte Seiten zu vermeiden.", url: s.url, an: "entwicklung" })
  }

  /* International: jede Sprache da, richtig ausgezeichnet, wirklich übersetzt, vollständig. */
  const deText = sichtbarerText(start.html).length
  SPRACHEN.forEach((sp, i) => {
    const s = seiten[i]
    if (s.status !== 200) return
    const pfad = sp.pfad || "/"
    const lang = s.html.match(/<html[^>]*\blang=["']([^"']+)["']/i)?.[1] ?? ""
    if (!lang.toLowerCase().startsWith(sp.lang))
      neu({ code: `lang:${pfad}`, bereich: "international", schwere: "wichtig", titel: `Falsche Sprachkennung auf ${pfad}`, detail: `<html lang="${lang || "–"}"> statt "${sp.lang}". Google und Vorleseprogramme lesen die Seite dann falsch.`, url: s.url, an: "entwicklung" })
    if (sp.lang === "ar" && !/<html[^>]*\bdir=["']rtl["']/i.test(s.html))
      neu({ code: "rtl", bereich: "international", schwere: "wichtig", titel: "Arabisch läuft nicht von rechts nach links", detail: 'dir="rtl" fehlt im <html>-Tag.', url: s.url, an: "entwicklung" })
    const alternativen = (s.html.match(/hreflang=["'][a-z-]+["']/gi) ?? []).length
    if (alternativen < SPRACHEN.length - 1)
      neu({ code: `hreflang:${pfad}`, bereich: "international", schwere: "wichtig", titel: `Sprachverweise unvollständig auf ${pfad}`, detail: `${alternativen} hreflang-Verweise, erwartet mindestens ${SPRACHEN.length}. Sonst zeigt Google in der Türkei/Golf die deutsche Seite.`, url: s.url, an: "entwicklung" })
    if (i > 0) {
      const text = sichtbarerText(s.html)
      if (deText && text.length < deText * 0.55)
        neu({ code: `kurz:${pfad}`, bereich: "international", schwere: "wichtig", titel: `Sprachversion ${sp.lang.toUpperCase()} deutlich dünner als Deutsch`, detail: `${text.length} Zeichen sichtbarer Text gegenüber ${deText} auf Deutsch – Inhalte fehlen.`, url: s.url, an: "kommunikation" })
      if (sp.lang !== "de") {
        const treffer = (text.match(DEUTSCHE_WOERTER) ?? []).length
        if (treffer > 12)
          neu({ code: `deutsch:${pfad}`, bereich: "international", schwere: "wichtig", titel: `Deutsche Reste in der ${sp.lang.toUpperCase()}-Version`, detail: `${treffer} deutsche Füllwörter gefunden – Teile sind nicht übersetzt.`, url: s.url, an: "kommunikation" })
      }
    }
  })

  /* Soll-Abgleich: sagt die Seite noch, was creaDIG heute ist? (lib/webseite/soll.ts) */
  const texte = seiten.filter((s) => s.status === 200).map((s) => ({ s, text: sichtbarerText(s.html) }))
  for (const r of VERBOTEN) {
    const treffer = texte.filter((t) => r.muster.test(t.text)).map((t) => t.s.url.replace(basis, "") || "/")
    if (treffer.length)
      neu({ code: `soll:${r.code}`, bereich: "inhalt", schwere: r.schwere, titel: `${r.titel} (${treffer.length} Seite${treffer.length > 1 ? "n" : ""})`, detail: `${r.detail} Seiten: ${treffer.slice(0, 8).join(", ")}`, url: `${basis}${treffer[0] === "/" ? "" : treffer[0]}`, an: r.an })
  }
  for (const w of WIDERSPRUECHE) {
    const a = texte.find((t) => w.a.test(t.text))
    const b = texte.find((t) => w.b.test(t.text))
    if (a && b)
      neu({ code: `soll:${w.code}`, bereich: "inhalt", schwere: "kritisch", titel: w.titel, detail: `${w.detail} Beispiel: ${a.s.url} gegen ${b.s.url}`, url: a.s.url, an: w.an })
  }
  for (const p of PFLICHT) {
    const s = await hole(`${basis}${p.pfad}`)
    if (s.status !== 200 || !p.muster.test(sichtbarerText(s.html)))
      neu({ code: `soll:${p.code}`, bereich: "inhalt", schwere: "wichtig", titel: `Fehlt auf der Seite: ${p.titel}`, detail: `${p.pfad} antwortet ${s.status} oder enthält das Erwartete nicht.`, url: `${basis}${p.pfad}`, an: p.an })
  }

  /* Tote interne Links (Startseiten aller Sprachen). */
  const links = new Set<string>()
  for (const s of seiten.slice(0, SPRACHEN.length))
    for (const m of s.html.matchAll(/href=["'](\/[^"'#?]*)["']/g))
      if (!/^\/(_next|api|admin|fonts|images|brand|works)\//.test(m[1]) && !/\.(png|jpe?g|svg|webp|ico|pdf|xml|txt|css|js)$/i.test(m[1])) links.add(m[1])
  const geprueft = new Set(seiten.map((s) => s.url.replace(basis, "") || "/"))
  const offen = [...links].filter((l) => !geprueft.has(l)).slice(0, 40)
  const linkStatus = await Promise.all(
    offen.map(async (l) => {
      const r = await fetch(`${basis}${l}`, { method: "HEAD", redirect: "follow", signal: AbortSignal.timeout(8000) }).catch(() => null)
      return { l, status: r?.status ?? 0 }
    }),
  )
  const tot = linkStatus.filter((x) => x.status >= 400 || x.status === 0)
  if (tot.length)
    neu({ code: "tote-links", bereich: "technik", schwere: "wichtig", titel: `${tot.length} tote Link(s) auf der Webseite`, detail: tot.map((t) => `${t.l} (${t.status || "keine Antwort"})`).join(", "), an: "entwicklung" })

  /* Aktualität. */
  const jahr = new Date().getFullYear()
  const copyright = start.html.match(/(?:©|&copy;)\s*(?:\d{4}\s*[–-]\s*)?(\d{4})/)
  if (copyright && Number(copyright[1]) < jahr)
    neu({ code: "jahr", bereich: "inhalt", schwere: "hinweis", titel: "Veraltetes Jahr im Fußbereich", detail: `© ${copyright[1]} – wirkt, als würde die Seite nicht gepflegt.`, an: "entwicklung" })
  const { veroeffentlichteInsights } = await import("@/lib/artikel/store")
  const artikel = await veroeffentlichteInsights().catch(() => [])
  const neuster = artikel
    .map((a) => new Date(a.date))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0]
  const tageAlt = neuster ? Math.floor((Date.now() - neuster.getTime()) / 86400000) : null
  if (tageAlt === null || tageAlt > 7)
    neu({ code: "frische", bereich: "inhalt", schwere: "wichtig", titel: tageAlt === null ? "Noch kein eigener Fachartikel online" : `Letzter Fachartikel vor ${tageAlt} Tagen`, detail: "Google und Besucher sehen eine stille Seite. Ziel: mindestens ein Artikel je Woche unter /insights.", an: "kommunikation" })
  const fehlendeArtikel = artikel
    .map((a) => a.slug)
    .filter((slug) => sitemapUrls.length > 0 && !sitemapUrls.some((u) => u.includes(slug)))
  if (fehlendeArtikel.length)
    neu({ code: "artikel-sitemap", bereich: "technik", schwere: "wichtig", titel: `${fehlendeArtikel.length} veröffentlichte Artikel fehlen in der Sitemap`, detail: fehlendeArtikel.slice(0, 5).join(", ") })

  /* Wöchentlich tief: Google PageSpeed + Design-Blick. */
  let psi: Pruefung["psi"] = null
  if (o.tief) {
    const r = await pageSpeed(basis)
    if (r) {
      psi = r.werte
      const p = r.werte
      if (p.leistung < 80) neu({ code: "psi-leistung", bereich: "leistung", schwere: p.leistung < 50 ? "kritisch" : "wichtig", titel: `Google-Leistungsnote mobil: ${p.leistung}/100`, detail: `LCP ${p.lcp}, CLS ${p.cls}. Unter 80 verliert man Besucher und Platzierung.`, an: "entwicklung" })
      if (p.barriere < 90) neu({ code: "psi-barriere", bereich: "design", schwere: "wichtig", titel: `Barrierefreiheit: ${p.barriere}/100`, detail: "Ab 28.06.2025 gilt das Barrierefreiheitsstärkungsgesetz für viele digitale Angebote.", an: "entwicklung" })
      if (p.seo < 90) neu({ code: "psi-seo", bereich: "technik", schwere: "hinweis", titel: `Google-SEO-Note: ${p.seo}/100`, detail: "Technische SEO-Grundlagen unvollständig.", an: "entwicklung" })
      if (p.praxis < 90) neu({ code: "psi-praxis", bereich: "sicherheit", schwere: "hinweis", titel: `Best Practices: ${p.praxis}/100`, detail: "Konsole-Fehler, unsichere Bibliotheken oder veraltete APIs.", an: "it" })
      if (r.bild) for (const d of await designBlick(r.bild)) neu(d)
    }
  }

  /* Selbst reparieren, was erlaubt ist; Rest zuordnen. */
  /* Stille Seite: kein Auftrag an eine Abteilung (der endete nur in Plänen), sondern gleich ein Entwurf aus dem Redaktionsplan. */
  let entwurf: string | null = null
  if (befunde.some((b) => b.code === "frische")) {
    const { schreibeNaechstenPlanArtikel } = await import("@/lib/artikel/plan")
    entwurf = (await schreibeNaechstenPlanArtikel().catch((e) => ({ ergebnis: `Entwurf gescheitert: ${e instanceof Error ? e.message : e}` }))).ergebnis
  }

  const fertig: Befund[] = befunde.map((b) => {
    if (b.code === "frische" && entwurf)
      return { ...b, erledigung: "emin", an: "geschaeftsfuehrung", detail: `${b.detail} ${entwurf} – Freigabe unter /admin/bulletin.` }
    if (b.code === "artikel-sitemap") {
      try {
        revalidatePath("/sitemap.xml")
        revalidatePath("/insights")
        revalidatePath("/tr/insights")
        return { ...b, erledigung: "behoben", detail: `${b.detail} – Sitemap und Insights neu aufgebaut.` }
      } catch {
        /* außerhalb eines Request-Kontexts nicht möglich → Abteilung */
      }
    }
    const brauchtCode = b.an === "entwicklung" || b.an === "it"
    return { ...b, an: b.an ?? "entwicklung", erledigung: brauchtCode ? "emin" : "abteilung" }
  })

  const noten = Object.fromEntries(
    BEREICHE.map((ber) => {
      const abzug = fertig
        .filter((b) => b.bereich === ber && b.erledigung !== "behoben")
        .reduce((s, b) => s + (b.schwere === "kritisch" ? 25 : b.schwere === "wichtig" ? 10 : 3), 0)
      return [ber, Math.max(0, 100 - abzug)]
    }),
  ) as Record<Bereich, number>
  if (psi) noten.leistung = Math.round((noten.leistung + psi.leistung) / 2)
  const gesamt = Math.round(BEREICHE.reduce((s, b) => s + noten[b], 0) / BEREICHE.length)

  return {
    id: new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" }),
    erstelltAm: new Date().toISOString(),
    noten,
    gesamt,
    befunde: fertig.sort((a, b) => rang(a.schwere) - rang(b.schwere)),
    seiten: seiten.length,
    psi,
    anweisung: umsetzungsAnweisung(fertig.filter((b) => b.erledigung === "emin" && b.code !== "frische")),
  }
}

const rang = (s: Schwere) => (s === "kritisch" ? 0 : s === "wichtig" ? 1 : 2)

/** Fertiger Auftragstext für die Code-Umsetzung (z. B. in v0 einfügen). */
function umsetzungsAnweisung(liste: Befund[]): string {
  if (!liste.length) return ""
  return [
    "Bitte auf creadig.de beheben (Website-Prüfer, Stand heute):",
    ...liste.slice(0, 15).map((b, i) => `${i + 1}. [${b.schwere}] ${b.titel}${b.url ? ` (${b.url})` : ""} – ${b.detail}`),
    "Markenschriften und Design nicht verändern, nur die genannten Punkte beheben.",
  ].join("\n")
}

async function pageSpeed(url: string): Promise<{ werte: NonNullable<Pruefung["psi"]>; bild: string | null } | null> {
  const api = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed")
  api.searchParams.set("url", url)
  api.searchParams.set("strategy", "mobile")
  for (const c of ["performance", "accessibility", "best-practices", "seo"]) api.searchParams.append("category", c)
  if (process.env.PAGESPEED_API_KEY) api.searchParams.set("key", process.env.PAGESPEED_API_KEY)
  try {
    const r = await fetch(api, { signal: AbortSignal.timeout(90000), cache: "no-store" })
    if (!r.ok) return null
    const j = (await r.json()) as {
      lighthouseResult?: {
        categories?: Record<string, { score: number | null }>
        audits?: Record<string, { displayValue?: string; details?: { data?: string } }>
      }
    }
    const lh = j.lighthouseResult
    if (!lh?.categories) return null
    const n = (k: string) => Math.round((lh.categories?.[k]?.score ?? 0) * 100)
    return {
      werte: {
        leistung: n("performance"),
        barriere: n("accessibility"),
        praxis: n("best-practices"),
        seo: n("seo"),
        lcp: lh.audits?.["largest-contentful-paint"]?.displayValue ?? "–",
        cls: lh.audits?.["cumulative-layout-shift"]?.displayValue ?? "–",
      },
      bild: lh.audits?.["final-screenshot"]?.details?.data ?? null,
    }
  } catch {
    return null
  }
}

/** Ein kritischer Blick wie von einer Design-Agentur auf den echten Handy-Bildschirm – einmal pro Woche. */
async function designBlick(bild: string): Promise<Omit<Befund, "erledigung">[]> {
  try {
    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4.6",
      maxOutputTokens: 700,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Das ist die Startseite von creadig.de auf dem Handy. So soll creaDIG wirken:
${SOLL_KURZ}
Marke (Blau, Schrift) NICHT infrage stellen.
Bewerte wie eine internationale Top-Agentur: Wirkt die Seite auf den ersten Blick hochwertig, klar und vertrauenswürdig? Ist sofort klar, was creaDIG verkauft und was der nächste Schritt ist? Lesbarkeit, Abstände, Kontrast, Bildsprache.
Nenne höchstens 3 konkrete Schwächen, die man ändern sollte (keine Lobreden). Antworte NUR mit JSON: [{"titel":"kurz","detail":"was genau und wie besser","schwere":"wichtig|hinweis"}]`,
            },
            { type: "image", image: bild },
          ],
        },
      ],
    })
    const roh = text.match(/\[[\s\S]*\]/)?.[0]
    const liste = roh ? (JSON.parse(roh) as { titel: string; detail: string; schwere?: string }[]) : []
    return liste.slice(0, 3).map((d, i) => ({
      code: `design:${i}`,
      bereich: "design" as const,
      schwere: d.schwere === "wichtig" ? ("wichtig" as const) : ("hinweis" as const),
      titel: String(d.titel).slice(0, 120),
      detail: String(d.detail).slice(0, 500),
      an: "entwicklung",
    }))
  } catch {
    return []
  }
}

/* ---------- Agentenlauf ---------- */

export async function websiteRunde(o: { manuell?: boolean } = {}): Promise<{ ergebnis: string; anzahl: number }> {
  const letzte = await ladeLetztePruefung()
  const letzteTief = letzte?.psi ? new Date(letzte.erstelltAm).getTime() : 0
  const tief = o.manuell || !letzte?.psi || Date.now() - letzteTief > 6.5 * 86400000
  const p = await pruefeWebseite({ tief })
  if (!p.psi && letzte?.psi && !tief) p.psi = letzte.psi

  const q = await db()
  if (q)
    await q(
      `INSERT INTO webseite_pruefungen (id, noten, gesamt, befunde, seiten, psi, anweisung)
       VALUES ($1,$2::jsonb,$3,$4::jsonb,$5,$6::jsonb,$7)
       ON CONFLICT (id) DO UPDATE SET erstellt_at = now(), noten = EXCLUDED.noten, gesamt = EXCLUDED.gesamt,
         befunde = EXCLUDED.befunde, seiten = EXCLUDED.seiten, psi = COALESCE(EXCLUDED.psi, webseite_pruefungen.psi), anweisung = EXCLUDED.anweisung`,
      [p.id, JSON.stringify(p.noten), p.gesamt, JSON.stringify(p.befunde), p.seiten, p.psi ? JSON.stringify(p.psi) : null, p.anweisung],
    )

  /* Aufträge: inhaltliche Punkte an die Abteilungen, Code-Punkte gebündelt als Bericht an die Geschäftsführung.
     Quelle je Befund + Woche → derselbe Mangel erzeugt nicht jeden Tag einen neuen Auftrag. */
  const { legeAuftragAn } = await import("@/lib/koordination/koordinator")
  const woche = p.id.slice(0, 8) + String(Math.ceil(Number(p.id.slice(8, 10)) / 7))
  let auftraege = 0
  for (const b of p.befunde.filter((x) => x.erledigung === "abteilung" && x.schwere !== "hinweis")) {
    const id = await legeAuftragAn({
      von: "it",
      an: b.an ?? "kommunikation",
      titel: `Webseite: ${b.titel}`,
      inhalt: `${b.detail}${b.url ? `\nSeite: ${b.url}` : ""}\nGefunden vom Website-Prüfer. Liefere einen fertigen Text/Vorschlag zur Umsetzung.`,
      quelle: `webseite:${woche}:${b.code}`,
    }).catch(() => null)
    if (id) auftraege++
  }
  const emin = p.befunde.filter((b) => b.erledigung === "emin" && b.schwere !== "hinweis")
  if (emin.length) {
    const id = await legeAuftragAn({
      von: "it",
      an: "geschaeftsfuehrung",
      titel: `Webseiten-Bericht: Note ${p.gesamt}/100, ${emin.length} Punkte brauchen Code`,
      inhalt: [
        ...emin.filter((b) => b.code === "frische").map((b) => `Redaktion: ${b.detail}`),
        p.anweisung ? `Diese Punkte darf der Prüfer nicht selbst ändern (Code/Server):\n${p.anweisung}` : "",
      ].filter(Boolean).join("\n\n"),
      quelle: `webseite:${woche}:bericht`,
    }).catch(() => null)
    if (id) auftraege++
  }

  const behoben = p.befunde.filter((b) => b.erledigung === "behoben").length
  const kritisch = p.befunde.filter((b) => b.schwere === "kritisch").length
  return {
    ergebnis: `Webseite ${p.gesamt}/100 · ${p.seiten} Seiten geprüft${kritisch ? ` · ${kritisch} kritisch` : ""}${behoben ? ` · ${behoben} selbst behoben` : ""}${auftraege ? ` · ${auftraege} Aufträge verteilt` : ""}${p.psi ? ` · Google mobil ${p.psi.leistung}` : ""}`,
    anzahl: p.befunde.length,
  }
}
