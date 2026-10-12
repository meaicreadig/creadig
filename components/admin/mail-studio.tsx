"use client"

import { useMemo, useState, useTransition } from "react"

import { AdminField, AdminInput, AdminSelect, AdminTextarea, Surface } from "@/components/admin/primitives"
import type { KampagnenAnlass, KiKampagne } from "@/lib/mailing/ki"
import { anredeFuer, kampagnenHtml, type KampagnenInhalt } from "@/lib/mailing/vorlage"

type Ergebnis = { ok: true; hinweis?: string } | { fehler: string }

const T = {
  de: {
    ki: "KI-Entwurf",
    anlass: "Anlass",
    anlaesse: { einblick: "Fachlicher Einblick", angebot: "Angebot", fall: "Praxisfall", einladung: "Einladung zum Gespräch" },
    stichpunkte: "Stichpunkte",
    stichHint: "Worum geht es? Was soll der Leser danach tun? Fakten, die vorkommen müssen.",
    schreiben: "Entwurf schreiben",
    schreibt: "Schreibt …",
    betreff: "Betreff",
    vorschau: "Vorschautext im Postfach",
    titel: "Überschrift",
    inhalt: "Inhalt",
    inhaltHint: "Leerzeile = neuer Absatz · „## “ = Zwischentitel · „- “ = Liste",
    knopf: "Knopf-Text",
    link: "Knopf-Link",
    speichern: "Speichern",
    gespeichert: "Gespeichert.",
    test: "Test an mich",
    senden: (n: number) => `An ${n} Empfänger senden`,
    sicher: (n: number) => `Wirklich an ${n} senden?`,
    loeschen: "Entwurf löschen",
    desktop: "Desktop",
    mobil: "Mobil",
    postfach: "So erscheint sie im Postfach",
    gesendet: "Versendet",
    geoeffnet: "Geöffnet",
    geklickt: "Geklickt",
    fehler: "Fehler",
    leer: "Keine aktiven Empfänger im Verteiler.",
  },
  tr: {
    ki: "Yapay zekâ taslağı",
    anlass: "Konu türü",
    anlaesse: { einblick: "Uzmanlık bilgisi", angebot: "Teklif", fall: "Örnek vaka", einladung: "Görüşmeye davet" },
    stichpunkte: "Notlar",
    stichHint: "Konu ne? Okuyan sonra ne yapmalı? Mutlaka geçmesi gereken bilgiler.",
    schreiben: "Taslak yaz",
    schreibt: "Yazıyor …",
    betreff: "Konu",
    vorschau: "Gelen kutusu önizleme metni",
    titel: "Başlık",
    inhalt: "İçerik",
    inhaltHint: "Boş satır = yeni paragraf · „## “ = ara başlık · „- “ = liste",
    knopf: "Buton metni",
    link: "Buton linki",
    speichern: "Kaydet",
    gespeichert: "Kaydedildi.",
    test: "Kendime test",
    senden: (n: number) => `${n} alıcıya gönder`,
    sicher: (n: number) => `Gerçekten ${n} kişiye gönderilsin mi?`,
    loeschen: "Taslağı sil",
    desktop: "Masaüstü",
    mobil: "Mobil",
    postfach: "Gelen kutusunda böyle görünür",
    gesendet: "Gönderildi",
    geoeffnet: "Açıldı",
    geklickt: "Tıklandı",
    fehler: "Hata",
    leer: "Listede aktif alıcı yok.",
  },
}

export function MailStudio({
  id,
  sprache,
  siteUrl,
  start,
  gesperrt,
  aktive,
  statistik,
  aktionen,
}: {
  id: string
  sprache: "de" | "tr"
  siteUrl: string
  start: KampagnenInhalt
  gesperrt: boolean
  aktive: number
  statistik: { gesendet: number; fehler: number; geoeffnet: number; geklickt: number }
  aktionen: {
    kiEntwurf: (anlass: KampagnenAnlass, stichpunkte: string) => Promise<KiKampagne>
    speichern: (id: string, k: KampagnenInhalt) => Promise<Ergebnis>
    testSenden: (id: string, k: KampagnenInhalt) => Promise<Ergebnis>
    versenden: (id: string, k: KampagnenInhalt) => Promise<Ergebnis>
    loeschen: (id: string) => Promise<void>
  }
}) {
  const t = T[sprache]
  const [k, setK] = useState<KampagnenInhalt>(start)
  const [anlass, setAnlass] = useState<KampagnenAnlass>("einladung")
  const [stich, setStich] = useState("")
  const [meldung, setMeldung] = useState<{ text: string; fehler: boolean } | null>(null)
  const [bestaetigen, setBestaetigen] = useState(false)
  const [breite, setBreite] = useState<"desktop" | "mobil">("desktop")
  const [laeuft, starte] = useTransition()

  const html = useMemo(
    () => kampagnenHtml(k, { siteUrl, abmeldeUrl: `${siteUrl}/mail/abmelden/vorschau`, anrede: anredeFuer("Max Mustermann") }),
    [k, siteUrl],
  )

  const feld = (name: keyof KampagnenInhalt) => (e: { target: { value: string } }) => {
    setK((v) => ({ ...v, [name]: e.target.value }))
    setBestaetigen(false)
  }

  function ausfuehren(fn: () => Promise<Ergebnis>, ok?: string) {
    setMeldung(null)
    starte(async () => {
      const r = await fn()
      setMeldung("fehler" in r ? { text: r.fehler, fehler: true } : { text: r.hinweis ?? ok ?? "", fehler: false })
    })
  }

  function kiSchreiben() {
    setMeldung(null)
    starte(async () => {
      const r = await aktionen.kiEntwurf(anlass, stich)
      if ("fehler" in r) setMeldung({ text: r.fehler, fehler: true })
      else setK((v) => ({ ...v, ...r.inhalt }))
    })
  }

  const knopf = "rounded-md px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-40"

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex min-w-0 flex-col gap-5">
        {gesperrt ? (
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [t.gesendet, statistik.gesendet],
              [t.geoeffnet, statistik.geoeffnet],
              [t.geklickt, statistik.geklickt],
              [t.fehler, statistik.fehler],
            ].map(([l, w]) => (
              <Surface key={String(l)} padding="sm">
                <dt className="text-meta text-muted-foreground">{l}</dt>
                <dd className="font-display mt-1 text-2xl font-semibold tabular-nums">{w}</dd>
              </Surface>
            ))}
          </dl>
        ) : (
          <Surface className="border-gold/60 border">
            <div className="flex flex-col gap-4">
              <h2 className="text-subhead text-gold-text text-sm">{t.ki}</h2>
              <AdminField label={t.anlass} htmlFor="ki-anlass">
                <AdminSelect id="ki-anlass" value={anlass} onChange={(e) => setAnlass(e.target.value as KampagnenAnlass)}>
                  {(Object.keys(t.anlaesse) as KampagnenAnlass[]).map((a) => (
                    <option key={a} value={a}>
                      {t.anlaesse[a]}
                    </option>
                  ))}
                </AdminSelect>
              </AdminField>
              <AdminField label={t.stichpunkte} htmlFor="ki-stich">
                <AdminTextarea id="ki-stich" rows={4} value={stich} onChange={(e) => setStich(e.target.value)} placeholder={t.stichHint} />
              </AdminField>
              <button type="button" onClick={kiSchreiben} disabled={laeuft || stich.trim().length < 10} className={`bg-primary text-primary-foreground self-start ${knopf}`}>
                {laeuft ? t.schreibt : t.schreiben}
              </button>
            </div>
          </Surface>
        )}

        <fieldset disabled={gesperrt} className="flex flex-col gap-4">
          <AdminField label={t.betreff} htmlFor="k-betreff">
            <AdminInput id="k-betreff" value={k.subject} onChange={feld("subject")} maxLength={120} />
          </AdminField>
          <AdminField label={t.vorschau} htmlFor="k-pre">
            <AdminInput id="k-pre" value={k.preheader} onChange={feld("preheader")} maxLength={160} />
          </AdminField>
          <AdminField label={t.titel} htmlFor="k-titel">
            <AdminInput id="k-titel" value={k.headline} onChange={feld("headline")} maxLength={140} />
          </AdminField>
          <AdminField label={t.inhalt} htmlFor="k-body">
            <AdminTextarea id="k-body" rows={12} value={k.body} onChange={feld("body")} />
            <p className="text-meta text-muted-foreground mt-1.5">{t.inhaltHint}</p>
          </AdminField>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
            <AdminField label={t.knopf} htmlFor="k-knopf">
              <AdminInput id="k-knopf" value={k.ctaText} onChange={feld("ctaText")} maxLength={40} />
            </AdminField>
            <AdminField label={t.link} htmlFor="k-link">
              <AdminInput id="k-link" type="url" value={k.ctaUrl} onChange={feld("ctaUrl")} placeholder="https://" />
            </AdminField>
          </div>
        </fieldset>

        {!gesperrt && (
          <div className="border-line flex flex-wrap items-center gap-3 border-t pt-4">
            <button type="button" disabled={laeuft} onClick={() => ausfuehren(() => aktionen.speichern(id, k), t.gespeichert)} className={`border-line border ${knopf}`}>
              {t.speichern}
            </button>
            <button type="button" disabled={laeuft} onClick={() => ausfuehren(() => aktionen.testSenden(id, k))} className={`border-line border ${knopf}`}>
              {t.test}
            </button>
            <button
              type="button"
              disabled={laeuft || aktive === 0}
              onClick={() => {
                if (!bestaetigen) return setBestaetigen(true)
                setBestaetigen(false)
                ausfuehren(() => aktionen.versenden(id, k))
              }}
              className={`bg-primary text-primary-foreground ${knopf} ${bestaetigen ? "ring-gold ring-2 ring-offset-2 ring-offset-background" : ""}`}
            >
              {bestaetigen ? t.sicher(aktive) : t.senden(aktive)}
            </button>
            <button type="button" disabled={laeuft} onClick={() => starte(() => aktionen.loeschen(id))} className="text-meta text-muted-foreground hover:text-destructive ml-auto underline underline-offset-4">
              {t.loeschen}
            </button>
          </div>
        )}
        {aktive === 0 && !gesperrt && <p className="text-meta text-muted-foreground">{t.leer}</p>}
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
            <p className="truncate text-sm font-semibold">creaDIG · {k.subject || "—"}</p>
            <p className="text-meta text-muted-foreground truncate">{k.preheader || k.body.slice(0, 90)}</p>
          </Surface>
          <div className="border-line overflow-hidden rounded-md border">
            <iframe
              title={t.postfach}
              srcDoc={html}
              sandbox=""
              className={`mx-auto block h-[640px] w-full transition-[max-width] ${breite === "mobil" ? "max-w-[390px]" : "max-w-full"}`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
