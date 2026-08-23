"use client"

import { useLocale } from "@/components/locale-provider"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { Logo } from "@/components/brand/logo"
import { SignatureMotif } from "@/components/brand/signature-motif"
import { contact, navLinks, productWorks, socialProfiles } from "@/lib/site-data"
import { openConsentSettings } from "@/lib/consent"

export function SiteFooter() {
  const { t } = useLocale()

  return (
    <footer className="section-dark relative overflow-hidden">
      <SignatureMotif
        direction="down"
        density={0.45}
        className="motif-band pointer-events-none absolute inset-0 h-full w-full"
      />

      <div className="section-gutter relative pt-24 pb-10 md:pt-32">
        {/* Riesige Wortmarke */}
        <div className="border-line border-b pb-14">
          <Link href="/" className="inline-block" aria-label="creaDIG — nach oben">
            <Logo variant="auto" className="h-[clamp(1.4rem,3vw,2.5rem)]" />
          </Link>
          <p className="type-lead text-muted-foreground mt-6 max-w-xl text-pretty">
            {t.footer.tagline}
          </p>
        </div>

        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="eyebrow text-gold-text">{t.footer.navLabel}</p>
            <ul className="mt-6 flex flex-col gap-3.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-400"
                  >
                    {t.nav[link.labelKey]}
                  </Link>
                </li>
              ))}
              {/*
                Zwei Ziele, die in der Hauptnavigation bewusst fehlen: Kontakt
                traegt dort der Gold-CTA, die Zertifizierungen liegen als
                Abschnitt auf /unternehmen. Im Footer sind beide direkt
                erreichbar — ein Footer darf vollstaendig sein, eine Leiste
                nicht.
              */}
              <li>
                <Link
                  href="/kontakt"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-400"
                >
                  {t.nav.kontakt}
                </Link>
              </li>
              <li>
                <Link
                  href="/unternehmen#zertifizierungen"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-400"
                >
                  {t.nav.zertifikate}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-gold-text">{t.footer.productsLabel}</p>
            <ul className="mt-6 flex flex-col gap-3.5">
              {/*
                Vorher standen hier vier Namen, von denen genau einer ein Link
                war (nach draussen zu meai.run). Seit PHASE A hat jedes Produkt
                eine eigene Welt — der Footer fuehrt dorthin, nicht mehr an
                der Seite vorbei.
              */}
              {productWorks.map((product) => (
                <li key={product.slug} className="text-muted-foreground text-sm">
                  <Link
                    href={`/produkte/${product.slug}`}
                    className="hover:text-foreground transition-colors duration-400"
                  >
                    {product.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-gold-text">{t.footer.legalLabel}</p>
            <ul className="mt-6 flex flex-col gap-3.5">
              <li>
                <Link
                  href="/impressum"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-400"
                >
                  {t.footer.imprint}
                </Link>
              </li>
              <li>
                <Link
                  href="/datenschutz"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-400"
                >
                  {t.footer.privacy}
                </Link>
              </li>
              {/*
                BF-A4 — die Erklaerung zur Barrierefreiheit gehoert dorthin,
                wo Menschen sie suchen: in die Fusszeile, neben Impressum und
                Datenschutz. Anders als die beiden ist sie aber `index,follow`
                — sie ist kein Pflichttext, sondern ein Beleg.
              */}
              <li>
                <Link
                  href="/barrierefreiheit"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-400"
                >
                  {t.accessibility.eyebrow}
                </Link>
              </li>
              <li>
                <Link
                  href="/termin"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-400"
                >
                  {t.contact.appointmentTitle}
                </Link>
              </li>
              {/* Widerruf/Anpassung der Einwilligung — jederzeit erreichbar. */}
              <li>
                <button
                  type="button"
                  onClick={openConsentSettings}
                  className="text-muted-foreground hover:text-foreground text-left text-sm transition-colors duration-400"
                >
                  {t.consent.settingsLabel}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-gold-text">{t.nav.kontakt}</p>
            <ul className="mt-6 flex flex-col gap-3.5">
              <li>
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground font-mono text-sm transition-colors duration-400"
                >
                  {contact.whatsapp}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-400"
                >
                  {contact.email}
                </a>
              </li>
              <li>
                <address className="type-small text-muted-foreground not-italic">
                  {contact.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </li>
            </ul>

            {/*
              Vorher standen hier drei Kaestchen mit „IG / LI / YT" — sie sahen
              aus wie Links, fuehrten aber nirgendwohin. Ein toter Link ist
              schlechter als kein Link: er verspricht eine Praesenz, die es
              nicht gibt. Der Block erscheint erst mit echten URLs
              (lib/site-data.ts -> socialProfiles) und speist dann zugleich
              `sameAs` in die Organisations-Daten.
            */}
            {socialProfiles.length > 0 && (
              <>
                <p className="eyebrow text-gold-text mt-8">{t.footer.socialLabel}</p>
                <ul className="mt-4 flex gap-2">
                  {socialProfiles.map((profile) => (
                    <li key={profile.url}>
                      <a
                        href={profile.url}
                        target="_blank"
                        rel="noopener noreferrer me"
                        aria-label={profile.name}
                        className="border-line text-muted-foreground hover:border-gold hover:text-gold-text flex size-9 items-center justify-center border text-meta transition-colors duration-400"
                      >
                        {profile.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <div className="border-line flex flex-col gap-3 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-meta">
            © 2026 creaDIG. {t.footer.rights}
          </p>
          <p className="text-muted-foreground text-meta">
            {contact.locations} · {contact.markets}
          </p>
        </div>
      </div>
    </footer>
  )
}
