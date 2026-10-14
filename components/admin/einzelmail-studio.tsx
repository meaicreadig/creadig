"use client"

import { useMemo, useState, useTransition } from "react"

import { AdminField, AdminInput, AdminTextarea, Surface } from "@/components/admin/primitives"
import { baueEml, einzelmailHtml, type Einzelmail } from "@/lib/mailing/eml"
import type { KiEinzelmail } from "@/lib/mailing/ki"

type Ergebnis = { ok: true; hinweis?: string } | { fehler: string }

const T = {
  de: {
    ki: "Sag der KI, was du willst",
    kiHint: "In deinen Worten – z. B. „kürzer“, „förmlicher“, „erwähne, dass ich aus Osnabrück bin“. Strg/⌘ + Enter schickt ab.",
    schreiben: "Schreiben / anpassen",
    schreibt: "Schreibt …",
    verlauf: "Bisher gesagt",
    an: "Empfänger",
    betreff: "Betreff",
    vorschau: "Vorschautext im Postfach",
    titel: "Überschrift",
    anrede: "Anrede",
    inhalt: "Inhalt",
    inhaltHint: "Leerzeile = neuer Absatz · „## “ = Zwischentitel · „- “ = Liste",
    knopf: "Haupt-Knopf",
    zweit: "Zweiter Knopf",
    link: "Link",
    gruss: "Grußformel",
    eml: ".eml herunterladen",
    senden: "Direkt senden",
    sicher: (an: string) => `Wirklich an ${an} senden?`,
    leeren: "Neu beginnen",
    desktop: "Desktop",
    mobil: "Mobil",
    postfach: "So kommt sie an",
    geladen: "Datei geladen – mit Outlook oder Apple Mail öffnen und absenden.",
  },
  tr: {
    ki: "Yapay zekâya ne istediğini söyle",
    kiHint: "Kendi cümlenle – örn. „daha kısa“, „daha resmî“, „Osnabrück’ten olduğumu ekle“. Ctrl/⌘ + Enter gönderir.",
    schreiben: "Yaz / düzenle",
    schreibt: "Yazıyor …",
    verlauf: "Şimdiye kadar söylenen",
    an: "Alıcı",
    betreff: "Konu",
    vorschau: "Gelen kutusu önizleme metni",
    titel: "Başlık",
    anrede: "Hitap",
    inhalt: "İçerik",
    inhaltHint: "Boş satır = yeni paragraf · „## “ = ara başlık · „- “ = liste",
    knopf: "Ana buton",
    zweit: "İkinci buton",
    link: "Link",
    gruss: "Kapanış",
    eml: ".eml indir",
    senden: "Direkt gönder",
    sicher: (an: string) => `Gerçekten ${an} adresine gönderilsin mi?`,
    leeren: "Baştan başla",
    desktop: "Masaüstü",
    mobil: "Mobil",
    postfach: "Karşı tarafa böyle ulaşır",
    geladen: "Dosya indi – Outlook veya Apple Mail ile aç ve gönder.",
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

  const html = useMemo(() => einzelmailHtml(m, siteUrl), [m, siteUrl])

  const feld = (name: keyof Einzelmail) => (e: { target: { value: string } }) => {
    setM((v) => ({ ...v, [name]: e.target.value }))
    setBestaetigen(false)
  }

  function kiSchreiben() {
    const text = anweisung.trim()
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

  function herunterladen() {
    const datei = new Blob([baueEml(m, html, von)], { type: "message/rfc822" })
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

  const knopf = "rounded-md px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-40"

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex min-w-0 flex-col gap-5">
        <Surface className="border-gold/60 border">
          <div className="flex flex-col gap-3">
            <label htmlFor="ki-anweisung" className="text-subhead text-gold-text text-sm">
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
              rows={4}
              value={anweisung}
              onChange={(e) => setAnweisung(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter" || !(e.metaKey || e.ctrlKey)) return
                if (e.nativeEvent.isComposing || e.keyCode === 229) return
                e.preventDefault()
                kiSchreiben()
              }}
            />
            <p className="text-meta text-muted-foreground leading-relaxed">{t.kiHint}</p>
            <button type="button" onClick={kiSchreiben} disabled={laeuft || anweisung.trim().length < 5} className={`bg-primary text-primary-foreground self-start ${knopf}`}>
              {laeuft ? t.schreibt : t.schreiben}
            </button>
          </div>
        </Surface>

        <div className="flex flex-col gap-4">
          <AdminField label={t.an} htmlFor="e-an">
            <AdminInput id="e-an" type="email" value={m.an} onChange={feld("an")} autoComplete="off" />
          </AdminField>
          <AdminField label={t.betreff} htmlFor="e-betreff">
            <AdminInput id="e-betreff" value={m.subject} onChange={feld("subject")} maxLength={140} />
          </AdminField>
          <AdminField label={t.vorschau} htmlFor="e-pre">
            <AdminInput id="e-pre" value={m.preheader} onChange={feld("preheader")} maxLength={160} />
          </AdminField>
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminField label={t.titel} htmlFor="e-titel">
              <AdminInput id="e-titel" value={m.headline} onChange={feld("headline")} maxLength={140} />
            </AdminField>
            <AdminField label={t.anrede} htmlFor="e-anrede">
              <AdminInput id="e-anrede" value={m.anrede} onChange={feld("anrede")} maxLength={120} />
            </AdminField>
          </div>
          <AdminField label={t.inhalt} htmlFor="e-body">
            <AdminTextarea id="e-body" rows={11} value={m.body} onChange={feld("body")} />
            <p className="text-meta text-muted-foreground mt-1.5">{t.inhaltHint}</p>
          </AdminField>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
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
          <AdminField label={t.gruss} htmlFor="e-gruss">
            <AdminInput id="e-gruss" value={m.gruss} onChange={feld("gruss")} maxLength={60} />
          </AdminField>
        </div>

        <div className="border-line flex flex-wrap items-center gap-3 border-t pt-4">
          <button type="button" onClick={herunterladen} disabled={!m.subject || !m.body.trim()} className={`bg-primary text-primary-foreground ${knopf}`}>
            {t.eml}
          </button>
          <button
            type="button"
            onClick={senden}
            disabled={laeuft || !m.an}
            className={`border-line border ${knopf} ${bestaetigen ? "ring-gold ring-2 ring-offset-2 ring-offset-background" : ""}`}
          >
            {bestaetigen ? t.sicher(m.an) : t.senden}
          </button>
          <button
            type="button"
            onClick={() => {
              setM({ ...start, an: "", subject: "", preheader: "", headline: "", anrede: "", body: "" })
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

      <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-meta text-muted-foreground">{t.postfach}</p>
            <div role="group" className="border-line flex rounded-md border p-0.5">
              {(["desktop", "mobil"] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  aria-pressed={breite === b}
                  onClick={() => setBreite(b)}
                  className={`rounded-sm px-3 py-1 text-xs ${breite === b ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                >
                  {b === "desktop" ? t.desktop : t.mobil}
                </button>
              ))}
            </div>
          </div>
          <Surface padding="sm">
            <p className="truncate text-sm font-semibold">Muhammed Emin Akyol · {m.subject || "—"}</p>
            <p className="text-meta text-muted-foreground truncate">{m.preheader || m.body.slice(0, 90)}</p>
          </Surface>
          <div className="border-line overflow-hidden rounded-md border">
            <iframe
              title={t.postfach}
              srcDoc={html}
              sandbox=""
              className={`mx-auto block h-[680px] w-full transition-[max-width] ${breite === "mobil" ? "max-w-[390px]" : "max-w-full"}`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
