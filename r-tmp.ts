import { writeFileSync } from "node:fs"
import { kampagnenHtml } from "/vercel/share/v0-project/lib/mailing/vorlage"

const body = `vor Kurzem habe ich mit Herrn Baser über Ihre offene Stelle gesprochen. Dabei wurde klar: Sie brauchen **Abläufe, die verlässlich laufen**.

- [layers] Keine Fachkraft nötig: Das System ist so gebaut, dass Ihr Team es ohne Spezialwissen nutzt.
- [shield] Pflege aus einer Hand: Wartung und Anpassungen übernehme ich.
- [user] Ein fester Ansprechpartner: Sie sprechen direkt mit mir.

> Weniger Personalsuche. Mehr Ruhe im Betrieb.

In 20–30 Minuten zeige ich Ihnen, wie das konkret aussieht.`

writeFileSync(
  "/vercel/share/v0-project/public/mail-vorschau-tmp.html",
  kampagnenHtml(
    { subject: "Nach unserem Gespräch mit Herrn Baser", preheader: "x", headline: "Ihre Abläufe laufen – **ohne neue Stelle.**", body, ctaText: "Termin wählen", ctaUrl: "/termin" },
    {
      siteUrl: "http://localhost:3000",
      bildSrc: (p: string) => p,
      anrede: "Sehr geehrte Damen und Herren,",
      zweitLink: { text: "Kontaktformular", url: "/kontakt" },
      kennung: "Auf Empfehlung von Herrn Baser",
      telefon: "0176 41965356",
      email: "info@creadig.de",
      gruss: "Mit freundlichen Grüßen",
    } as never,
  ),
)
