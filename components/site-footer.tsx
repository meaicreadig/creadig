"use client"

import { useLocale } from "@/components/locale-provider"
import Link from "next/link"
import { Logo } from "@/components/brand/logo"
import { contact, navLinks, ownProducts } from "@/lib/site-data"
import { openConsentSettings } from "@/lib/consent"

export function SiteFooter() {
  const { t } = useLocale()

  return (
    <footer className="section-dark relative overflow-hidden">
      <div aria-hidden="true" className="triangle-mesh absolute inset-0 opacity-[0.12]" />

      <div className="relative mx-auto w-full max-w-[100rem] px-6 pt-24 pb-10 md:px-10 md:pt-32 lg:px-16">
        {/* Riesige Wortmarke */}
        <div className="border-line border-b pb-14">
          <a href="/#top" className="inline-block" aria-label="creaDIG — nach oben">
            <Logo variant="auto" className="h-[clamp(1.9rem,4vw,3.1rem)]" />
          </a>
          <p className="text-muted-foreground mt-6 max-w-xl text-base text-pretty md:text-lg">
            {t.footer.tagline}
          </p>
        </div>

        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="eyebrow text-gold">{t.footer.navLabel}</p>
            <ul className="mt-6 flex flex-col gap-3.5">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={`/#${link.id}`}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-400"
                  >
                    {t.nav[link.labelKey]}
                  </a>
                </li>
              ))}
              {/* Nicht in der Hauptnavigation, aber im Footer erreichbar. */}
              <li>
                <a
                  href="/#zertifizierungen"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-400"
                >
                  {t.nav.zertifikate}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-gold">{t.footer.productsLabel}</p>
            <ul className="mt-6 flex flex-col gap-3.5">
              {ownProducts.map((product) => (
                <li key={product.name} className="text-muted-foreground text-sm">
                  {product.name === "meAI" ? (
                    <a
                      href="https://meai.run"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors duration-400"
                    >
                      meAI — meai.run
                    </a>
                  ) : (
                    product.name
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-gold">{t.footer.legalLabel}</p>
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
            <p className="eyebrow text-gold">{t.nav.kontakt}</p>
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
              <li className="text-muted-foreground text-sm">{contact.locations}</li>
            </ul>

            <p className="eyebrow text-gold mt-8">{t.footer.socialLabel}</p>
            {/* TODO: Echte Social-Profile verlinken. */}
            <div className="mt-4 flex gap-2">
              {["IG", "LI", "YT"].map((slot) => (
                <span
                  key={slot}
                  className="border-line text-line-strong hover:border-gold hover:text-gold flex size-9 items-center justify-center border font-mono text-[0.625rem] transition-colors duration-400"
                >
                  {slot}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-line flex flex-col gap-3 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground font-mono text-[0.6875rem] tracking-wide">
            © 2026 creaDIG. {t.footer.rights}
          </p>
          <p className="text-line-strong font-mono text-[0.6875rem] tracking-wide">
            {contact.locations}
          </p>
        </div>
      </div>
    </footer>
  )
}
