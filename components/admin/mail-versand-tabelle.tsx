import Link from "next/link"
import { Check, Clock, CornerDownRight, Reply, Undo2 } from "lucide-react"

import { Pill } from "@/components/admin/primitives"
import type { VersandZeile } from "@/lib/assistent/versand"

type Sprache = "de" | "tr"

const T = {
  de: {
    datum: "Gesendet",
    an: "An",
    inhalt: "Betreff & Inhalt",
    status: "Stand",
    leer: "Noch keine Mail gesendet. Schreib die erste – jede gesendete Mail erscheint hier, und das System fasst automatisch nach.",
    beantwortet: "Antwort erhalten",
    wartet: (d: string) => `Wartet · Nachfassen ${d}`,
    nachfassOffen: "Nachfass-Mail wartet auf dich",
    nachgefasst: "Nachgefasst",
    beendet: "Keine Antwort · Kette beendet",
    antwortKnopf: "Antwort erhalten",
    rueckgaengig: "Rückgängig",
    freigeben: "Ansehen & senden",
    quelle: { studio: "Mail Studio", assistent: "Assistent", nachfassen: "Nachfassen" },
    stufe: (n: number) => `${n}. Nachfassen`,
  },
  tr: {
    datum: "Gönderildi",
    an: "Kime",
    inhalt: "Konu ve içerik",
    status: "Durum",
    leer: "Henüz e-posta gönderilmedi. İlkini yaz – gönderilen her e-posta burada görünür ve sistem otomatik takip eder.",
    beantwortet: "Yanıt geldi",
    wartet: (d: string) => `Bekliyor · takip ${d}`,
    nachfassOffen: "Takip e-postası seni bekliyor",
    nachgefasst: "Takip edildi",
    beendet: "Yanıt yok · zincir bitti",
    antwortKnopf: "Yanıt geldi",
    rueckgaengig: "Geri al",
    freigeben: "Gör ve gönder",
    quelle: { studio: "Mail Studio", assistent: "Asistan", nachfassen: "Takip" },
    stufe: (n: number) => `${n}. takip`,
  },
}

export function MailVersandTabelle({
  zeilen,
  sprache,
  intl,
  antwortAktion,
  rueckgaengigAktion,
}: {
  zeilen: VersandZeile[]
  sprache: Sprache
  intl: string
  antwortAktion: (formData: FormData) => Promise<void>
  rueckgaengigAktion: (formData: FormData) => Promise<void>
}) {
  const t = T[sprache]
  const tag = new Intl.DateTimeFormat(intl, { day: "2-digit", month: "short", timeZone: "Europe/Berlin" })
  const uhr = new Intl.DateTimeFormat(intl, { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" })
  const kurz = new Intl.DateTimeFormat(intl, { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Berlin" })

  if (zeilen.length === 0) {
    return <p className="bg-card text-muted-foreground rounded-3xl p-6 text-sm leading-relaxed">{t.leer}</p>
  }

  return (
    <div className="bg-card overflow-hidden rounded-3xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="text-meta text-muted-foreground">
              <th scope="col" className="px-5 pb-2 pt-5 font-normal">{t.datum}</th>
              <th scope="col" className="px-3 pb-2 pt-5 font-normal">{t.an}</th>
              <th scope="col" className="px-3 pb-2 pt-5 font-normal">{t.inhalt}</th>
              <th scope="col" className="px-5 pb-2 pt-5 text-right font-normal">{t.status}</th>
            </tr>
          </thead>
          <tbody>
            {zeilen.map((z) => {
              const d = new Date(z.gesendetAt)
              return (
                <tr key={z.id} className="hover:bg-muted/40 align-top transition-colors">
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="block font-medium tabular-nums">{tag.format(d)}</span>
                    <span className="text-meta text-muted-foreground tabular-nums">{uhr.format(d)}</span>
                  </td>
                  <td className="max-w-[14rem] px-3 py-4">
                    <span className="block truncate font-medium" title={z.an}>{z.an.split("@")[0]}</span>
                    <span className="text-meta text-muted-foreground block truncate">@{z.an.split("@")[1] ?? ""}</span>
                  </td>
                  <td className="px-3 py-4">
                    <span className="flex items-center gap-2">
                      {z.quelle === "nachfassen" && <CornerDownRight className="text-primary size-4 shrink-0" aria-hidden="true" />}
                      <span className="line-clamp-1 font-medium">{z.betreff}</span>
                    </span>
                    <span className="text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{z.kurz}</span>
                    <span className="text-meta text-primary mt-1.5 block">
                      {z.quelle === "nachfassen" ? t.stufe(z.stufe) : t.quelle[z.quelle]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col items-end gap-2">
                      <StatusPill z={z} t={t} kurz={kurz} />
                      {z.status.art === "nachfass_offen" && (
                        <Link
                          href={`/admin/marketing/mail/einzel?freigabe=${z.status.nachfassId}`}
                          className="bg-primary text-primary-foreground rounded-full px-3.5 py-1.5 text-xs font-medium"
                        >
                          {t.freigeben}
                        </Link>
                      )}
                      {z.status.art === "beantwortet" && (
                        <form action={rueckgaengigAktion}>
                          <input type="hidden" name="id" value={z.id} />
                          <button className="text-muted-foreground hover:bg-muted inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors">
                            <Undo2 className="size-3.5" aria-hidden="true" />
                            {t.rueckgaengig}
                          </button>
                        </form>
                      )}
                      {z.status.art !== "beantwortet" && (
                        <form action={antwortAktion}>
                          <input type="hidden" name="id" value={z.id} />
                          <button className="text-primary hover:bg-primary/10 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors">
                            <Reply className="size-3.5" aria-hidden="true" />
                            {t.antwortKnopf}
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusPill({ z, t, kurz }: { z: VersandZeile; t: (typeof T)["de"]; kurz: Intl.DateTimeFormat }) {
  const s = z.status
  if (s.art === "beantwortet")
    return (
      <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
        <Check className="size-3.5" aria-hidden="true" />
        {t.beantwortet}
      </span>
    )
  if (s.art === "wartet")
    return (
      <span className="text-muted-foreground inline-flex items-center gap-1.5 whitespace-nowrap text-xs">
        <Clock className="size-3.5" aria-hidden="true" />
        {t.wartet(kurz.format(new Date(s.nachfassAm)))}
      </span>
    )
  if (s.art === "nachfass_offen") return <Pill severity="attention">{t.nachfassOffen}</Pill>
  if (s.art === "nachgefasst") return <Pill>{t.nachgefasst}</Pill>
  return <Pill severity="critical">{t.beendet}</Pill>
}
