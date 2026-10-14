import Link from "next/link"

import { AdminShell } from "@/components/admin/admin-shell"
import { EinzelmailStudio } from "@/components/admin/einzelmail-studio"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import type { Einzelmail } from "@/lib/mailing/eml"
import { siteUrl } from "@/lib/termine/mail"

import { einzelmailSenden, kiEinzelmail } from "../actions"

export const dynamic = "force-dynamic"

const VISEC_ENTWURF = `vor Kurzem habe ich mit Herrn Baser über Ihre offene Stelle gesprochen. Dabei wurde eines klar: Sie brauchen dafür nicht zwingend eine neue Fachkraft – Sie brauchen **Abläufe, die verlässlich laufen**.

Genau das baue ich: ein Grundsystem für Ihren Betrieb, das die Aufgaben rund um diese Position trägt. Auf Wunsch übernehme ich auch die Pflege und die laufende Arbeit gleich mit.

- Keine Fachkraft nötig: Das System ist so gebaut, dass Ihr Team es ohne Spezialwissen nutzt.
- Pflege aus einer Hand: Wartung, Anpassungen und laufende Arbeit kann ich komplett übernehmen.
- Ein fester Ansprechpartner: Sie sprechen direkt mit mir – nicht mit einer Hotline.

> Weniger Personalsuche. Mehr Ruhe im Betrieb.

Herr Baser meinte, ich solle mich direkt bei Ihnen melden. In 20–30 Minuten zeige ich Ihnen unverbindlich, wie das bei Ihnen konkret aussieht – gern auch bei Ihnen vor Ort.`

function adresse(von: string): string {
  return von.match(/<([^>]+)>/)?.[1]?.trim() || (von.includes("@") ? von.trim() : "")
}

export default async function EinzelmailSeite() {
  const { sprache } = await adminSprachKontext()
  const tr = sprache === "tr"
  const basis = siteUrl()

  const von = process.env.MAIL_FROM?.trim() || process.env.LEAD_FROM?.trim() || ""

  const start: Einzelmail = {
    an: "info@vi-sec.de",
    subject: "Ihre offene Stelle – es geht auch ohne neue Fachkraft",
    preheader: "Nach meinem Gespräch mit Herrn Baser: ein System, das die Arbeit trägt",
    kennung: "Persönlich für VI-SEC",
    headline: "Ihre Abläufe laufen – **ohne dass Sie erst eine Stelle besetzen.**",
    anrede: "Sehr geehrte Damen und Herren,",
    body: VISEC_ENTWURF,
    ctaHinweis: "Wählen Sie direkt einen passenden Termin – oder schreiben Sie mir in einer Minute.",
    ctaText: "Termin wählen",
    ctaUrl: `${basis}/termin`,
    zweitText: "Kontaktformular",
    zweitUrl: `${basis}/kontakt`,
    gruss: "Mit freundlichen Grüßen",
    telefon: "0176 41965356",
    kontaktMail: adresse(process.env.MAIL_REPLY_TO?.trim() || von),
  }

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
