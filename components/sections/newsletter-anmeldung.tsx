"use client"

import { useState } from "react"

import { useLocale } from "@/components/locale-provider"
import { LocaleLink as Link } from "@/components/ui/locale-link"

/**
 * Newsletter-Anmeldung mit Double-Opt-in (lib/mailing/anmeldung.ts).
 * Die Einwilligung ist eine eigene, nicht vorangekreuzte Checkbox – nie an einen
 * Download oder eine Anfrage gekoppelt. Der Text hier muss mit
 * EINWILLIGUNG_TEXT übereinstimmen; gespeichert wird die Server-Fassung.
 */
const T = {
  de: {
    titel: "Neue Beiträge per E-Mail",
    lead: "Praxis aus echten Projekten – Websites, Abläufe, Barrierefreiheit. Höchstens zweimal im Monat, kein Verkaufsdruck.",
    feld: "E-Mail-Adresse",
    zustimmung: "Ja, ich möchte neue Beiträge und Hinweise von creaDIG per E-Mail erhalten (höchstens zweimal im Monat). Abmeldung jederzeit über den Link in jeder Mail.",
    datenschutz: "Details in der Datenschutzerklärung.",
    knopf: "Anmelden",
    ok: "Fast geschafft: Bitte bestätigen Sie den Link in der Mail, die wir Ihnen gerade geschickt haben.",
    fehler: "Das hat nicht geklappt. Bitte prüfen Sie die Adresse oder versuchen Sie es später noch einmal.",
    fehlt: "Bitte setzen Sie das Häkchen, damit wir Ihnen schreiben dürfen.",
  },
  tr: {
    titel: "Yeni yazılar e-postayla",
    lead: "Gerçek projelerden pratik bilgiler – web siteleri, iş akışları, erişilebilirlik. Ayda en fazla iki kez, satış baskısı yok.",
    feld: "E-posta adresi",
    zustimmung: "Evet, creaDIG'in yeni yazılarını ve duyurularını e-postayla almak istiyorum (ayda en fazla iki kez). Her e-postadaki bağlantıyla istediğim zaman çıkabilirim.",
    datenschutz: "Ayrıntılar gizlilik politikasında.",
    knopf: "Kaydol",
    ok: "Neredeyse tamam: Size az önce gönderdiğimiz e-postadaki bağlantıyı onaylayın.",
    fehler: "Olmadı. Adresi kontrol edin ya da daha sonra tekrar deneyin.",
    fehlt: "Size yazabilmemiz için lütfen kutucuğu işaretleyin.",
  },
  en: {
    titel: "New articles by e-mail",
    lead: "Practice from real projects – websites, workflows, accessibility. At most twice a month, no sales pressure.",
    feld: "E-mail address",
    zustimmung: "Yes, I would like to receive new articles and notes from creaDIG by e-mail (at most twice a month). Unsubscribe any time via the link in every e-mail.",
    datenschutz: "Details in the privacy policy.",
    knopf: "Subscribe",
    ok: "Almost done: please confirm the link in the e-mail we just sent you.",
    fehler: "That didn't work. Please check the address or try again later.",
    fehlt: "Please tick the box so we may write to you.",
  },
}

export function NewsletterAnmeldung({ quelle }: { quelle: string }) {
  const { locale } = useLocale()
  const sprache = locale === "tr" || locale === "en" ? locale : "de"
  const t = T[sprache]
  const [email, setEmail] = useState("")
  const [zustimmung, setZustimmung] = useState(false)
  const [falle, setFalle] = useState("")
  const [stand, setStand] = useState<"offen" | "sendet" | "ok" | "fehler" | "fehlt">("offen")

  async function senden(e: React.FormEvent) {
    e.preventDefault()
    if (!zustimmung) return setStand("fehlt")
    setStand("sendet")
    const r = await fetch("/api/mail/anmelden", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, sprache, quelle, zustimmung, website: falle }),
    }).catch(() => null)
    setStand(r?.ok ? "ok" : "fehler")
  }

  return (
    <section aria-labelledby="newsletter-titel" className="section-seam">
      <div className="section-shell">
        <div className="border-line max-w-2xl border-t pt-8">
          <h2 id="newsletter-titel" className="type-h4">{t.titel}</h2>
          <p className="type-body text-muted-foreground mt-3 text-pretty">{t.lead}</p>
          {stand === "ok" ? (
            <p className="type-body mt-6" role="status">{t.ok}</p>
          ) : (
            <form onSubmit={senden} className="mt-6 flex flex-col gap-4" noValidate>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium">{t.feld}</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-line bg-background rounded-md border px-4 py-3"
                />
              </label>
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={falle} onChange={(e) => setFalle(e.target.value)} className="hidden" name="website" />
              <label className="flex items-start gap-3 text-sm">
                <input type="checkbox" checked={zustimmung} onChange={(e) => setZustimmung(e.target.checked)} className="mt-1 size-4 shrink-0" />
                <span className="text-muted-foreground text-pretty">
                  {t.zustimmung}{" "}
                  <Link href="/datenschutz" className="underline">
                    {t.datenschutz}
                  </Link>
                </span>
              </label>
              {stand === "fehler" || stand === "fehlt" ? (
                <p className="text-destructive text-sm" role="alert">{stand === "fehlt" ? t.fehlt : t.fehler}</p>
              ) : null}
              <button type="submit" disabled={stand === "sendet"} className="bg-primary text-primary-foreground self-start rounded-md px-5 py-3 font-semibold disabled:opacity-60">
                {t.knopf}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
