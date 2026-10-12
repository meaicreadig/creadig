import Link from "next/link"
import { notFound } from "next/navigation"

import { AdminShell } from "@/components/admin/admin-shell"
import { MailStudio } from "@/components/admin/mail-studio"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { aktiveEmpfaenger, kampagne } from "@/lib/mailing/store"
import { siteUrl } from "@/lib/termine/mail"

import { kiEntwurf, loeschen, speichern, testSenden, versenden } from "../actions"

export const dynamic = "force-dynamic"

export default async function KampagnenSeite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { sprache } = await adminSprachKontext()
  const tr = sprache === "tr"
  const [k, aktive] = await Promise.all([kampagne(id).catch(() => null), aktiveEmpfaenger().catch(() => [])])
  if (!k) notFound()

  const zurueck = (
    <Link href="/admin/marketing/mail" className="text-meta text-muted-foreground hover:text-foreground underline underline-offset-4">
      {tr ? "← Tüm kampanyalar" : "← Alle Kampagnen"}
    </Link>
  )

  return (
    <AdminShell
      title={k.subject || (tr ? "Yeni kampanya" : "Neue Kampagne")}
      lead={
        k.status === "versendet"
          ? tr
            ? "Bu kampanya gönderildi ve kilitli."
            : "Diese Kampagne ist versendet und gesperrt."
          : tr
            ? "Notlarını yaz, yapay zekâ taslağı çıkarsın. Önce kendine test gönder, sonra listeye."
            : "Stichpunkte eingeben, die KI schreibt den Entwurf. Erst Test an dich, dann an den Verteiler."
      }
      meta={zurueck}
    >
      <MailStudio
        id={k.id}
        sprache={tr ? "tr" : "de"}
        siteUrl={siteUrl()}
        start={{ subject: k.subject, preheader: k.preheader, headline: k.headline, body: k.body, ctaText: k.ctaText, ctaUrl: k.ctaUrl }}
        gesperrt={k.status === "versendet"}
        aktive={aktive.length}
        statistik={{ gesendet: k.gesendet, fehler: k.fehler, geoeffnet: k.geoeffnet, geklickt: k.geklickt }}
        aktionen={{ kiEntwurf, speichern, testSenden, versenden, loeschen }}
      />
    </AdminShell>
  )
}
