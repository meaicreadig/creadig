import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { DokumentBlatt } from "@/components/finanz/auftraege/dokument-blatt"
import { KundenAntwort } from "@/components/finanz/auftraege/kunden-antwort"
import { DruckKnopf } from "@/components/finanz/auftraege/knoepfe"
import { finanzDb } from "@/lib/finanz/store"
import { formatDatum, formatEuro, heuteBerlin, positionNetto, steuerModus } from "@/lib/finanz/auftraege/rechnen"
import { bezahltCent, ladeDokumentPerToken, ladeFirma, markiereGeoeffnet } from "@/lib/finanz/auftraege/store"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Ihr Dokument", robots: { index: false, follow: false } }

const HINWEIS = {
  de: {
    angenommen: (n: string, am: string) => `Angenommen von ${n} am ${am}. Vielen Dank für Ihr Vertrauen.`,
    abgelehnt: "Sie haben dieses Angebot abgelehnt. Danke für Ihre Rückmeldung.",
    aenderung: "Ihr Änderungswunsch liegt uns vor. Sie erhalten in Kürze eine überarbeitete Fassung.",
    ersetzt: "Zu diesem Angebot gibt es eine neuere Fassung. Bitte nutzen Sie den Link aus der neuesten Mail.",
    abgelaufen: "Die Gültigkeit dieses Angebots ist abgelaufen. Melden Sie sich gern – wir erneuern es.",
    bezahlt: (am: string) => `Bezahlt am ${am}. Vielen Dank.`,
    teilbezahlt: (bezahlt: string, offen: string) => `Vielen Dank für Ihre Teilzahlung von ${bezahlt}. Noch offen: ${offen}.`,
    storniert: "Diese Rechnung wurde storniert.",
    zahlen: "Bitte überweisen Sie den Betrag mit der Rechnungsnummer als Verwendungszweck.",
    drucken: "Drucken / PDF",
  },
  en: {
    angenommen: (n: string, am: string) => `Accepted by ${n} on ${am}. Thank you for your trust.`,
    abgelehnt: "You declined this quotation. Thank you for letting us know.",
    aenderung: "We have received your change request. A revised version will follow shortly.",
    ersetzt: "There is a newer version of this quotation. Please use the link from the latest email.",
    abgelaufen: "This quotation has expired. Get in touch – we are happy to renew it.",
    bezahlt: (am: string) => `Paid on ${am}. Thank you.`,
    teilbezahlt: (bezahlt: string, offen: string) => `Thank you for your partial payment of ${bezahlt}. Still outstanding: ${offen}.`,
    storniert: "This invoice has been cancelled.",
    zahlen: "Please transfer the amount using the invoice number as payment reference.",
    drucken: "Print / PDF",
  },
  tr: {
    angenommen: (n: string, am: string) => `${am} tarihinde ${n} tarafından kabul edildi. Güveniniz için teşekkür ederiz.`,
    abgelehnt: "Bu teklifi reddettiniz. Geri bildiriminiz için teşekkür ederiz.",
    aenderung: "Değişiklik talebiniz bize ulaştı. Kısa süre içinde güncellenmiş bir teklif göndereceğiz.",
    ersetzt: "Bu teklifin daha yeni bir versiyonu var. Lütfen son e-postadaki bağlantıyı kullanın.",
    abgelaufen: "Bu teklifin geçerlilik süresi doldu. Bize ulaşın – memnuniyetle yenileriz.",
    bezahlt: (am: string) => `${am} tarihinde ödendi. Teşekkür ederiz.`,
    teilbezahlt: (bezahlt: string, offen: string) => `${bezahlt} tutarındaki kısmi ödemeniz için teşekkür ederiz. Kalan tutar: ${offen}.`,
    storniert: "Bu fatura iptal edilmiştir.",
    zahlen: "Lütfen tutarı fatura numarasını açıklama olarak belirterek havale ediniz.",
    drucken: "Yazdır / PDF",
  },
}

export default async function KundenDokument({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  if (!/^[A-Za-z0-9_-]{20,}$/.test(token)) notFound()
  const db = await finanzDb().catch(() => null)
  if (!db) notFound()
  const d = await ladeDokumentPerToken(db, token)
  if (!d || d.status === "entwurf" || d.status === "verworfen") notFound()

  if (d.status === "versendet") await markiereGeoeffnet(db, d.id)

  const { firma, ustPflichtig } = await ladeFirma(db)
  const modus = d.steuerModus ?? steuerModus(d.kunde, ustPflichtig)
  const t = HINWEIS[d.sprache]
  const datum = (iso: string | null) => (iso ? formatDatum(iso.slice(0, 10), d.sprache) : "")
  const abgelaufen = d.art === "angebot" && !!d.gueltigBis && d.gueltigBis < heuteBerlin()
  const offen = d.art === "angebot" && d.status === "versendet" && !abgelaufen

  let hinweis: string | null = null
  if (d.art === "angebot") {
    if (d.status === "angenommen") hinweis = t.angenommen(d.antwortName ?? "", datum(d.beantwortetAt))
    else if (d.status === "abgelehnt") hinweis = t.abgelehnt
    else if (d.status === "aenderung") hinweis = t.aenderung
    else if (d.status === "ersetzt") hinweis = t.ersetzt
    else if (abgelaufen) hinweis = t.abgelaufen
  } else if (d.status === "bezahlt") hinweis = t.bezahlt(datum(d.bezahltAm))
  else if (d.status === "teilbezahlt" && d.summen) {
    const bezahlt = await bezahltCent(db, d.id)
    hinweis = t.teilbezahlt(formatEuro(bezahlt, d.sprache), formatEuro(d.summen.bruttoCent - bezahlt, d.sprache))
  } else if (d.status === "storniert") hinweis = t.storniert
  else if (d.art === "rechnung") hinweis = t.zahlen

  const optionale = d.positionen
    .map((p, index) => ({ p, index }))
    .filter(({ p }) => p.optional)
    .map(({ p, index }) => ({ index, titel: p.titel, betrag: formatEuro(positionNetto(p), d.sprache) }))

  return (
    <main className="bg-background flex min-h-dvh flex-col items-center gap-6 px-4 py-8 sm:py-14 print:p-0">
      <div className="flex w-full max-w-4xl flex-col gap-6">
        {hinweis && (
          <p role="status" className="bg-card text-foreground rounded-3xl px-6 py-5 leading-relaxed shadow-sm print:hidden">
            {hinweis}
          </p>
        )}
        <DokumentBlatt d={d} firma={firma} modus={modus} />
        {offen && <KundenAntwort token={token} sprache={d.sprache} optionale={optionale} />}
        <div className="flex justify-center print:hidden">
          <DruckKnopf label={t.drucken} />
        </div>
      </div>
    </main>
  )
}
