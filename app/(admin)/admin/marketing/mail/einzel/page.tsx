import Link from "next/link"

import { AdminShell } from "@/components/admin/admin-shell"
import { EinzelmailStudio } from "@/components/admin/einzelmail-studio"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import type { Einzelmail } from "@/lib/mailing/eml"
import { siteUrl } from "@/lib/termine/mail"

import { einzelmailSenden, kiEinzelmail } from "../actions"

export const dynamic = "force-dynamic"

const VISEC_ENTWURF = `vor Kurzem hatte ich ein persönliches Gespräch mit Herrn Baser. Dabei ging es um Ihre offene Stelle – und darum, dass eine neue Fachkraft allein wenig bringt, wenn die Abläufe und Strukturen dahinter fehlen.

Genau das baue ich auf: ein Grundsystem, das die Abläufe rund um diese Position trägt. So startet die neue Fachkraft von Anfang an in geordnete Prozesse, statt sich alles erst selbst zusammensuchen zu müssen.

Herr Baser meinte, ich solle Ihnen kurz schreiben, damit wir einen Termin finden. Gerne zeige ich Ihnen in 20–30 Minuten unverbindlich, wie das bei Ihnen konkret aussehen könnte – gern auch bei Ihnen vor Ort in Osnabrück.

Sie können direkt über den Knopf einen passenden Termin wählen oder mir über das Kontaktformular schreiben.`

export default async function EinzelmailSeite() {
  const { sprache } = await adminSprachKontext()
  const tr = sprache === "tr"
  const basis = siteUrl()

  const start: Einzelmail = {
    an: "info@vi-sec.de",
    subject: "Termin nach meinem Gespräch mit Herrn Baser",
    preheader: "Kurz vorgestellt: ein Grundsystem für Ihre neue Fachkraft",
    headline: "Ein Grundsystem für Ihre neue Fachkraft",
    anrede: "Sehr geehrte Damen und Herren,",
    body: VISEC_ENTWURF,
    ctaText: "Termin wählen",
    ctaUrl: `${basis}/termin`,
    zweitText: "Kontaktformular",
    zweitUrl: `${basis}/kontakt`,
    gruss: "Mit freundlichen Grüßen",
  }

  const von = process.env.MAIL_FROM?.trim() || process.env.LEAD_FROM?.trim() || ""

  return (
    <AdminShell
      title={tr ? "Kişisel e-posta" : "Persönliche Mail"}
      lead={
        tr
          ? "Tek bir kişiye, creaDIG tasarımında. Ne istediğini yaz, yapay zekâ yazsın ve düzenlesin; canlı gör, .eml olarak indir ya da direkt gönder."
          : "An eine Person, im creaDIG-Design. Sag, was du willst – die KI schreibt und passt an. Live ansehen, als .eml laden oder direkt senden."
      }
      meta={
        <Link href="/admin/marketing/mail" className="text-meta text-muted-foreground hover:text-foreground underline underline-offset-4">
          {tr ? "← E-posta pazarlama" : "← E-Mail-Marketing"}
        </Link>
      }
    >
      <EinzelmailStudio sprache={tr ? "tr" : "de"} siteUrl={basis} von={von} start={start} aktionen={{ kiEinzelmail, einzelmailSenden }} />
    </AdminShell>
  )
}
