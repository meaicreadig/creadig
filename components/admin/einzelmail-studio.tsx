"use client"

import { useMemo, useState, useTransition, type ReactNode } from "react"

import { AdminField, AdminInput, AdminTextarea } from "@/components/admin/primitives"
import { baueEml, einzelmailHtml, type EingebettetesBild, type Einzelmail } from "@/lib/mailing/eml"
import type { KiEinzelmail } from "@/lib/mailing/ki"
import { cidFuer, mailBildPfade, MAIL_SCHRIFTEN, schriftPfad } from "@/lib/mailing/vorlage"

type Ergebnis = { ok: true; hinweis?: string } | { fehler: string }

const T = {
  de: {
    ki: "Sag der KI, was du willst",
    kiHint: "In deinen Worten – „kürzer“, „selbstbewusster“, „erwähne, dass ich vor Ort komme“. Strg/⌘ + Enter schickt ab.",
    platz: "z. B. Mach den Einstieg stärker und betone, dass ich die Pflege übernehme …",
    schreiben: "Umschreiben",
    schreibt: "Schreibt …",
    vorschlaege: ["Selbstbewusster", "Kürzer", "Förmlicher", "Mehr Nutzen für den Kunden"],
    verlauf: "Bisher gesagt",
    gruppen: { kopf: "Betreff & Kopf", inhalt: "Inhalt", knoepfe: "Termin & Kontakt", absender: "Unterschrift & Kontaktleiste" },
    an: "Empfänger",
    betreff: "Betreff",
    vorschau: "Vorschautext im Postfach",
    kennung: "Kleine Zeile über der Überschrift",
    titel: "Überschrift",
    titelHint: "**Wort** wird gold hervorgehoben",
    anrede: "Anrede",
    inhalt: "Text",
    inhaltHint: "Leerzeile = Absatz · „## “ = Zwischentitel · „- Titel: Text“ = Vorteil · „> “ = Kernaussage · **fett**",
    hinweis: "Satz über den Knöpfen",
    knopf: "Haupt-Knopf",
    zweit: "Zweiter Knopf",
    link: "Link",
    gruss: "Grußformel",
    telefon: "Telefon",
    mail: "E-Mail",
    eml: ".eml herunterladen",
    senden: "Direkt senden",
    sicher: (an: string) => `Wirklich an ${an} senden?`,
    leeren: "Neu beginnen",
    desktop: "Desktop",
    mobil: "Mobil",
    von: "Von",
    geladen: "Datei geladen – in Outlook oder Apple Mail öffnen und absenden. Logo ist eingebettet.",
  },
  tr: {
    ki: "Yapay zekâya ne istediğini söyle",
    kiHint: "Kendi cümlenle – „daha kısa“, „daha özgüvenli“, „yerinde geleceğimi ekle“. Ctrl/⌘ + Enter gönderir.",
    platz: "örn. Girişi daha güçlü yap ve bakımı benim üstlendiğimi vurgula …",
    schreiben: "Yeniden yaz",
    schreibt: "Yazıyor …",
    vorschlaege: ["Daha özgüvenli", "Daha kısa", "Daha resmî", "Müşteriye faydayı öne çıkar"],
    verlauf: "Şimdiye kadar söylenen",
    gruppen: { kopf: "Konu & başlık", inhalt: "İçerik", knoepfe: "Randevu & iletişim", absender: "İmza & iletişim şeridi" },
    an: "Alıcı",
    betreff: "Konu",
    vorschau: "Gelen kutusu önizleme metni",
    kennung: "Başlığın üstündeki küçük satır",
    titel: "Başlık",
    titelHint: "**kelime** altın renkte vurgulanır",
    anrede: "Hitap",
    inhalt: "Metin",
    inhaltHint: "Boş satır = paragraf · „## “ = ara başlık · „- Başlık: metin“ = avantaj · „> “ = ana mesaj · **kalın**",
    hinweis: "Butonların üstündeki cümle",
    knopf: "Ana buton",
    zweit: "İkinci buton",
    link: "Link",
    gruss: "Kapanış",
    telefon: "Telefon",
    mail: "E-posta",
    eml: ".eml indir",
    senden: "Direkt gönder",
    sicher: (an: string) => `Gerçekten ${an} adresine gönderilsin mi?`,
    leeren: "Baştan başla",
    desktop: "Masaüstü",
    mobil: "Mobil",
    von: "Kimden",
    geladen: "Dosya indi – Outlook veya Apple Mail ile aç ve gönder. Logo gömülü.",
  },
}

function dateiname(betreff: string): string {
  const s = betreff
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
  return `${s || "creadig-mail"}.eml`
}

async function bildBase64(pfad: string): Promise<string | undefined> {
  try {
    const res = await fetch(pfad)
    if (!res.ok) return undefined
    const bytes = new Uint8Array(await res.arrayBuffer())
    let bin = ""
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
    return btoa(bin)
  } catch {
    return undefined
  }
}

async function alleBilder(): Promise<EingebettetesBild[]> {
  const bilder = await Promise.all(
    mailBildPfade().map(async (pfad) => {
      const base64 = await bildBase64(pfad)
      return base64 ? { cid: cidFuer(pfad), name: pfad.split("/").pop() ?? "bild.png", base64 } : null
    }),
  )
  return bilder.filter((b): b is EingebettetesBild => b !== null)
}

async function alleSchriften(): Promise<Map<string, string>> {
  const paare = await Promise.all(
    MAIL_SCHRIFTEN.map(async (datei) => [datei, await bildBase64(schriftPfad(datei))] as const),
  )
  return new Map(paare.filter((p): p is readonly [(typeof MAIL_SCHRIFTEN)[number], string] => Boolean(p[1])))
}

const vorschauBild = (pfad: string) => pfad
const vorschauSchrift = (datei: string) => schriftPfad(datei)

function Gruppe({ titel, offen, children }: { titel: string; offen?: boolean; children: ReactNode }) {
  return (
    <details open={offen} className="group border-line border-b last:border-b-0">
      <summary className="hover:text-gold-text flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-sm font-semibold">
        {titel}
        <span aria-hidden className="text-muted-foreground transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="flex flex-col gap-4 pb-5">{children}</div>
    </details>
  )
}

export function EinzelmailStudio({
  sprache,
  siteUrl,
  von,
  start,
  aktionen,
}: {
  sprache: "de" | "tr"
  siteUrl: string
  von: string
  start: Einzelmail
  aktionen: {
    kiEinzelmail: (anweisung: string, entwurf: Einzelmail) => Promise<KiEinzelmail>
    einzelmailSenden: (m: Einzelmail) => Promise<Ergebnis>
  }
}) {
  const t = T[sprache]
  const [m, setM] = useState<Einzelmail>(start)
  const [anweisung, setAnweisung] = useState("")
  const [verlauf, setVerlauf] = useState<string[]>([])
  const [meldung, setMeldung] = useState<{ text: string; fehler: boolean } | null>(null)
  const [bestaetigen, setBestaetigen] = useState(false)
  const [breite, setBreite] = useState<"desktop" | "mobil">("desktop")
  const [laeuft, starte] = useTransition()

  const html = useMemo(() => einzelmailHtml(m, siteUrl, vorschauBild, vorschauSchrift), [m, siteUrl])

  const feld = (name: keyof Einzelmail) => (e: { target: { value: string } }) => {
    setM((v) => ({ ...v, [name]: e.target.value }))
    setBestaetigen(false)
  }

  function kiSchreiben(text = anweisung.trim()) {
    if (text.length < 5 || laeuft) return
    setMeldung(null)
    starte(async () => {
      const r = await aktionen.kiEinzelmail(text, m)
      if ("fehler" in r) {
        setMeldung({ text: r.fehler, fehler: true })
        return
      }
      setM((v) => ({
        ...v,
        ...Object.fromEntries(Object.entries(r.inhalt).filter(([, w]) => w)),
      }))
      setVerlauf((v) => [...v, text])
      setAnweisung("")
    })
  }

  async function herunterladen() {
    const [bilder, schriften] = await Promise.all([alleBilder(), alleSchriften()])
    const vorhanden = new Set(bilder.map((b) => b.cid))
    const emlHtml = einzelmailHtml(
      m,
      siteUrl,
      (pfad) => (vorhanden.has(cidFuer(pfad)) ? `cid:${cidFuer(pfad)}` : `${siteUrl}${pfad}`),
      (datei) => {
        const b64 = schriften.get(datei as (typeof MAIL_SCHRIFTEN)[number])
        return b64 ? `data:font/woff2;base64,${b64}` : `${siteUrl}${schriftPfad(datei)}`
      },
    )
    const datei = new Blob([baueEml(m, emlHtml, von, bilder)], { type: "message/rfc822" })
    const url = URL.createObjectURL(datei)
    const a = document.createElement("a")
    a.href = url
    a.download = dateiname(m.subject)
    a.click()
    URL.revokeObjectURL(url)
    setMeldung({ text: t.geladen, fehler: false })
  }

  function senden() {
    if (!bestaetigen) return setBestaetigen(true)
    setBestaetigen(false)
    setMeldung(null)
    starte(async () => {
      const r = await aktionen.einzelmailSenden(m)
      setMeldung("fehler" in r ? { text: r.fehler, fehler: true } : { text: r.hinweis ?? "", fehler: false })
    })
  }

  const knopf = "rounded-md px-4 py-2.5 text-sm font-semibold transition-opacity disabled:opacity-40"

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <section aria-label="Vorschau" className="min-w-0 xl:sticky xl:top-6 xl:self-start">
        <div className="border-line bg-card overflow-hidden rounded-xl border shadow-sm">
          <div className="border-line flex items-center justify-between gap-4 border-b px-5 py-3">
            <div className="flex items-center gap-1.5" aria-hidden>
              <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
              <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
              <span className="bg-gold size-2.5 rounded-full" />
            </div>
            <div role="group" className="bg-muted/60 flex rounded-md p-0.5">
              {(["desktop", "mobil"] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  aria-pressed={breite === b}
                  onClick={() => setBreite(b)}
                  className={`rounded-sm px-3 py-1 text-xs font-medium ${breite === b ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}
                >
                  {b === "desktop" ? t.desktop : t.mobil}
                </button>
              ))}
            </div>
          </div>
          <div className="border-line flex flex-col gap-1 border-b px-5 py-4">
            <p className="truncate text-base font-semibold">{m.subject || "—"}</p>
            <p className="text-muted-foreground truncate text-sm">
              <span className="text-foreground">{t.von}:</span> Muhammed Emin Akyol{m.an ? ` → ${m.an}` : ""}
            </p>
            <p className="text-muted-foreground truncate text-xs">{m.preheader}</p>
          </div>
          <div className="bg-[#F1EFE9]">
            <iframe
              title="Vorschau"
              srcDoc={html}
              sandbox="allow-same-origin"
              className={`mx-auto block h-[760px] w-full transition-[max-width] duration-300 ${breite === "mobil" ? "max-w-[390px]" : "max-w-full"}`}
            />
          </div>
        </div>
      </section>

      <div className="flex min-w-0 flex-col gap-6">
        <section className="border-gold/50 bg-card flex flex-col gap-3 rounded-xl border p-5">
          <label htmlFor="ki-anweisung" className="text-gold-text text-sm font-semibold">
            {t.ki}
          </label>
          {verlauf.length > 0 && (
            <ul aria-label={t.verlauf} className="flex flex-col gap-1.5">
              {verlauf.map((v, i) => (
                <li key={i} className="bg-muted/50 text-muted-foreground rounded-md px-3 py-1.5 text-sm leading-relaxed">
                  {v}
                </li>
              ))}
            </ul>
          )}
          <AdminTextarea
            id="ki-anweisung"
            rows={3}
            value={anweisung}
            placeholder={t.platz}
            onChange={(e) => setAnweisung(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter" || !(e.metaKey || e.ctrlKey)) return
              if (e.nativeEvent.isComposing || e.keyCode === 229) return
              e.preventDefault()
              kiSchreiben()
            }}
          />
          <div className="flex flex-wrap gap-2">
            {t.vorschlaege.map((v) => (
              <button
                key={v}
                type="button"
                disabled={laeuft}
                onClick={() => kiSchreiben(v)}
                className="border-line hover:border-gold hover:text-gold-text rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-40"
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-meta text-muted-foreground max-w-sm leading-relaxed">{t.kiHint}</p>
            <button type="button" onClick={() => kiSchreiben()} disabled={laeuft || anweisung.trim().length < 5} className={`bg-primary text-primary-foreground ${knopf}`}>
              {laeuft ? t.schreibt : t.schreiben}
            </button>
          </div>
        </section>

        <section className="border-line bg-card rounded-xl border px-5">
          <Gruppe titel={t.gruppen.kopf} offen>
            <AdminField label={t.an} htmlFor="e-an">
              <AdminInput id="e-an" type="email" value={m.an} onChange={feld("an")} autoComplete="off" />
            </AdminField>
            <AdminField label={t.betreff} htmlFor="e-betreff">
              <AdminInput id="e-betreff" value={m.subject} onChange={feld("subject")} maxLength={140} />
            </AdminField>
            <AdminField label={t.vorschau} htmlFor="e-pre">
              <AdminInput id="e-pre" value={m.preheader} onChange={feld("preheader")} maxLength={160} />
            </AdminField>
            <AdminField label={t.kennung} htmlFor="e-kennung">
              <AdminInput id="e-kennung" value={m.kennung} onChange={feld("kennung")} maxLength={60} />
            </AdminField>
            <AdminField label={t.titel} htmlFor="e-titel">
              <AdminInput id="e-titel" value={m.headline} onChange={feld("headline")} maxLength={140} />
              <p className="text-meta text-muted-foreground mt-1.5">{t.titelHint}</p>
            </AdminField>
          </Gruppe>
          <Gruppe titel={t.gruppen.inhalt}>
            <AdminField label={t.anrede} htmlFor="e-anrede">
              <AdminInput id="e-anrede" value={m.anrede} onChange={feld("anrede")} maxLength={120} />
            </AdminField>
            <AdminField label={t.inhalt} htmlFor="e-body">
              <AdminTextarea id="e-body" rows={14} value={m.body} onChange={feld("body")} />
              <p className="text-meta text-muted-foreground mt-1.5 leading-relaxed">{t.inhaltHint}</p>
            </AdminField>
            <AdminField label={t.gruss} htmlFor="e-gruss">
              <AdminInput id="e-gruss" value={m.gruss} onChange={feld("gruss")} maxLength={60} />
            </AdminField>
          </Gruppe>
          <Gruppe titel={t.gruppen.knoepfe}>
            <AdminField label={t.hinweis} htmlFor="e-hinweis">
              <AdminInput id="e-hinweis" value={m.ctaHinweis} onChange={feld("ctaHinweis")} maxLength={160} />
            </AdminField>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <AdminField label={t.knopf} htmlFor="e-knopf">
                <AdminInput id="e-knopf" value={m.ctaText} onChange={feld("ctaText")} maxLength={40} />
              </AdminField>
              <AdminField label={t.link} htmlFor="e-link">
                <AdminInput id="e-link" type="url" value={m.ctaUrl} onChange={feld("ctaUrl")} placeholder="https://" />
              </AdminField>
              <AdminField label={t.zweit} htmlFor="e-zweit">
                <AdminInput id="e-zweit" value={m.zweitText} onChange={feld("zweitText")} maxLength={40} />
              </AdminField>
              <AdminField label={t.link} htmlFor="e-zweit-link">
                <AdminInput id="e-zweit-link" type="url" value={m.zweitUrl} onChange={feld("zweitUrl")} placeholder="https://" />
              </AdminField>
            </div>
          </Gruppe>
          <Gruppe titel={t.gruppen.absender}>
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label={t.telefon} htmlFor="e-tel">
                <AdminInput id="e-tel" value={m.telefon} onChange={feld("telefon")} maxLength={40} />
              </AdminField>
              <AdminField label={t.mail} htmlFor="e-mail">
                <AdminInput id="e-mail" type="email" value={m.kontaktMail} onChange={feld("kontaktMail")} maxLength={200} />
              </AdminField>
            </div>
          </Gruppe>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={herunterladen} disabled={!m.subject || !m.body.trim()} className={`bg-primary text-primary-foreground ${knopf}`}>
            {t.eml}
          </button>
          <button
            type="button"
            onClick={senden}
            disabled={laeuft || !m.an}
            className={`border-line border ${knopf} ${bestaetigen ? "ring-gold ring-offset-background ring-2 ring-offset-2" : ""}`}
          >
            {bestaetigen ? t.sicher(m.an) : t.senden}
          </button>
          <button
            type="button"
            onClick={() => {
              setM({ ...start, an: "", subject: "", preheader: "", kennung: "", headline: "", anrede: "", body: "" })
              setVerlauf([])
              setMeldung(null)
            }}
            className="text-meta text-muted-foreground hover:text-foreground ml-auto underline underline-offset-4"
          >
            {t.leeren}
          </button>
        </div>
        <p role="status" aria-live="polite" className={`text-sm ${meldung?.fehler ? "text-destructive" : "text-gold-text"}`}>
          {meldung?.text}
        </p>
      </div>
    </div>
  )
}
