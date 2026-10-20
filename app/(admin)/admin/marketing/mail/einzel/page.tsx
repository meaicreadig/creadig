import Link from "next/link"

import { AdminShell } from "@/components/admin/admin-shell"
import { EinzelmailStudio } from "@/components/admin/einzelmail-studio"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import type { Einzelmail } from "@/lib/mailing/eml"
import { siteUrl } from "@/lib/termine/mail"

import { ladeFreigabe } from "@/lib/assistent/store"
import { alsEinzelmail } from "@/lib/assistent/versand"

import { einzelmailFuerFreigabe, einzelmailSenden, kiEinzelmail } from "../actions"

export const dynamic = "force-dynamic"

const VISEC_ENTWURF = `vor Kurzem habe ich mit Herrn Baser über Ihre offene Stelle gesprochen. Dabei wurde eines klar: Sie brauchen dafür nicht zwingend eine neue Fachkraft – Sie brauchen **Abläufe, die verlässlich laufen**.

Genau das baue ich: ein Grundsystem für Ihren Betrieb, das die Aufgaben rund um diese Position trägt. Auf Wunsch übernehme ich auch die Pflege und die laufende Arbeit gleich mit.

- [layers] Keine Fachkraft nötig: Das System ist so gebaut, dass Ihr Team es ohne Spezialwissen nutzt.
- [shield] Pflege aus einer Hand: Wartung, Anpassungen und laufende Arbeit kann ich komplett übernehmen.
- [user] Ein fester Ansprechpartner: Sie sprechen direkt mit mir – nicht mit einer Hotline.

> Weniger Personalsuche. Mehr Ruhe im Betrieb.

Herr Baser meinte, ich solle mich direkt bei Ihnen melden. In 20–30 Minuten zeige ich Ihnen unverbindlich, wie das bei Ihnen konkret aussieht – gern auch bei Ihnen vor Ort.`

function adresse(von: string): string {
  return von.match(/<([^>]+)>/)?.[1]?.trim() || (von.includes("@") ? von.trim() : "")
}

export default async function EinzelmailSeite({ searchParams }: { searchParams: Promise<{ freigabe?: string }> }) {
  const { sprache } = await adminSprachKontext()
  const tr = sprache === "tr"
  const basis = siteUrl()
  const { freigabe: freigabeId } = await searchParams
  const freigabe = freigabeId ? await ladeFreigabe(freigabeId).catch(() => null) : null
  const ausAssistent = freigabe?.art === "mail" && freigabe.status === "offen" ? freigabe : null

  const von = process.env.MAIL_FROM?.trim() || process.env.LEAD_FROM?.trim() || ""

  const start: Einzelmail = ausAssistent
    ? alsEinzelmail(ausAssistent.empfaenger ?? "", ausAssistent.betreff || ausAssistent.titel, ausAssistent.inhalt)
    : {
    an: "info@vi-sec.de",
    subject: "Nach unserem Gespräch mit Herrn Baser – Ihre offene Stelle",
    preheader: "Herr Baser hat mich gebeten, mich bei Ihnen zu melden – kurz und persönlich.",
    kennung: "Auf Empfehlung von Herrn Baser",
    headline: "Ihre Abläufe laufen – **ohne dass Sie erst eine Stelle besetzen.**",
    anrede: "Sehr geehrte Damen und Herren,",
    body: VISEC_ENTWURF,
    ctaHinweis: "Wählen Sie direkt einen passenden Termin – oder schreiben Sie mir in einer Minute.",
    ctaText: "Termin wählen",
    ctaUrl: `${basis}/termin`,
    zweitText: "Kontaktformular",
    zweitUrl: `${basis}/kontakt`,
    gruss: "Mit freundlichen Grüßen",
    absender: "Emin Akyol",
    telefon: "0176 41965356",
    kontaktMail: adresse(process.env.MAIL_REPLY_TO?.trim() || von),
  }

  return (
    <AdminShell
      title={tr ? "Mail Studio · Yeni e-posta" : "Mail Studio · Neue Mail"}
      lead={
        tr
          ? "creaDIG tasarımında. Ne istediğini yaz, yapay zekâ yazsın; canlı gör ve gönder. Gönderilen her e-posta listeye düşer ve otomatik takip edilir."
          : "Im creaDIG-Design. Sag, was du willst – die KI schreibt. Live ansehen und senden. Jede gesendete Mail landet in der Liste und wird automatisch nachgefasst."
      }
      meta={
        <Link
          href={ausAssistent ? "/admin/assistent" : "/admin/marketing/mail"}
          className="text-meta text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          {ausAssistent ? (tr ? "← Asistan" : "← Assistent") : "← Mail Studio"}
        </Link>
      }
    >
      <EinzelmailStudio
        key={ausAssistent?.id ?? "frei"}
        sprache={tr ? "tr" : "de"}
        siteUrl={basis}
        von={von}
        start={start}
        aktionen={{
          kiEinzelmail,
          einzelmailSenden: ausAssistent ? einzelmailFuerFreigabe.bind(null, ausAssistent.id) : einzelmailSenden,
        }}
      />
    </AdminShell>
  )
}
