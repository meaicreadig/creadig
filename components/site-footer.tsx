"use client"

import { useLocale } from "@/components/locale-provider"
import { LocaleLink as Link } from "@/components/ui/locale-link"
import { Logo } from "@/components/brand/logo"
import { contact, navLinks, productWorks, serviceLayers, socialProfiles } from "@/lib/site-data"
import { openConsentSettings } from "@/lib/consent"
import { checkCopy } from "@/lib/betriebscheck"
import { rechnerText } from "@/lib/rechner-text"
import { handwerkCopy } from "@/lib/branchen"
import { ArrowUpRight } from "lucide-react"

/**
 * Sichtbarkeit des `/status`-Links (MP10-2.10). Ausfuehrliche Begruendung
 * unten an der Stelle, an der er gerendert wird.
 */
const STATUS_LINK_VISIBLE =
  process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_STATUS_PUBLIC === "1"

/*
 * ===========================================================================
 * DIE FUSSZEILE ALS SCHLUSS, NICHT ALS ZWEITE SITEMAP
 * ===========================================================================
 *
 * Gemessen an der alten Fassung, bei 1440 px:
 *
 *   1174 px hoch. Spalte 1 endete bei y=1017, die drei daneben bei y=617 —
 *   ein Schwanz von 400 px, weil die fuenf Ebenen als ZWEITES Menue unter
 *   „Seite" haengen. Rechts daneben: eine halbe Seite schwarzes Nichts.
 *
 *   Die Wortmarke stand mit 1,46 : 1 auf dem dunklen Grund. Das ist keine
 *   Geschmacksfrage — „crea" war schlicht nicht lesbar.
 *
 *   Unter RECHTLICHES stand „Kostenlose Erstberatung". Das ist kein
 *   Rechtstext, das ist der Verkaufsweg: der einzige Ort, an dem ein Leser
 *   am Ende der Seite sagen kann „ja, sprechen wir" — abgelegt zwischen
 *   Impressum und Cookie-Einstellungen.
 *
 * Vier Ebenen statt vier Spalten:
 *
 *   1 · Markenabschluss   Wortmarke, Satz, und der Schritt, der folgt.
 *   2 · Die fuenf Ebenen  EINE waagerechte Signatur, kein zweites Menue.
 *   3 · Verzeichnis       vier Gruppen, die gemeinsam enden.
 *   4 · Rechtszeile       leise, vollstaendig, erreichbar.
 *
 * Nichts ist verschwunden. Jeder Link von vorher ist noch da — er steht nur
 * dort, wo jemand ihn sucht.
 */
export function SiteFooter() {
  const { t, locale } = useLocale()

  /* Dieselbe Klasse an jedem Verzeichnis-Link — vorher stand sie zwoelfmal
     ausgeschrieben, und beim naechsten Eintrag haette jemand eine vergessen. */
  const linkKlasse =
    "text-muted-foreground hover:text-foreground text-sm transition-colors duration-[var(--dur-2)]"

  /* Die Rechtszeile als Daten. Sie ist eine Zeile, keine Spalte — deshalb
     entsteht sie aus einer Liste und nicht aus fuenf gleichen <li>. */
  const rechtliches: { key: string; label: string; href?: string; onClick?: () => void }[] = [
    { key: "impressum", label: t.footer.imprint, href: "/impressum" },
    { key: "datenschutz", label: t.footer.privacy, href: "/datenschutz" },
    { key: "barrierefreiheit", label: t.accessibility.eyebrow, href: "/barrierefreiheit" },
    { key: "cookies", label: t.consent.settingsLabel, onClick: openConsentSettings },
    /* Es gibt keine Route `app/(tr)/tr/status/` — auf Tuerkisch zeigte der
       Link auf eine 404. Bis die Seite zweisprachig ist: nur im deutschen Baum. */
    ...(STATUS_LINK_VISIBLE && locale === "de"
      ? [{ key: "status", label: t.footer.statusLabel, href: "/status" }]
      : []),
  ]

  return (
    <footer className="section-dark relative overflow-hidden">
      <div className="section-gutter relative pt-24 pb-10 md:pt-28">
        {/* ---- 1 · Markenabschluss ------------------------------------- */}
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Link href="/" className="inline-block" aria-label="creaDIG — nach oben">
              {/*
                `variant="light"` und nicht `"auto"`.
                `auto` schaltet am DARK-MODE, dieser Grund ist aber in beiden
                Modi dunkel (`.section-dark` und `.dark .section-dark`). Im
                hellen Modus rendert `auto` deshalb die anthrazitfarbene
                Wortmarke #3A3A3A auf #201e1b: 1,46 : 1. Das Asset fuer dunkle
                Flaechen lag daneben und war auf `display:none` gestellt —
                #FBFBF9, 16,05 : 1. Kein CSS-Filter, kein Umfaerben: die
                offizielle Fassung, die es schon gibt.
              */}
              <Logo variant="light" className="h-[clamp(1.6rem,3.4vw,2.75rem)]" />
            </Link>
            <p className="type-lead text-muted-foreground mt-7 max-w-xl text-pretty">
              {t.footer.tagline}
            </p>
          </div>

          {/*
            Der Schritt, der folgt — dort, wo vorher eine halbe Seite leer war.
            Er erfindet keinen Weg: `/termin?art=systemgespraech` ist dieselbe
            Adresse, auf die die Preistabelle und die Kopfleiste zeigen.
          */}
          <div className="border-line lg:col-span-5 lg:border-s lg:ps-10">
            <p className="eyebrow text-gold-text">{t.contact.appointmentTitle}</p>
            <Link
              href="/termin?art=systemgespraech"
              className="text-subhead hover:text-gold-text group mt-4 inline-flex items-baseline gap-3 text-xl transition-colors duration-[var(--dur-2)] md:text-2xl"
            >
              {t.nav.cta}
              <ArrowUpRight
                className="size-5 shrink-0 transition-transform duration-[var(--dur-2)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100"
                strokeWidth={1.5}
              />
            </Link>
            <ul className="mt-6 flex flex-col gap-2">
              <li>
                <a href={`mailto:${contact.email}`} className={linkKlasse}>
                  {contact.email}
                </a>
              </li>
              <li>
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkKlasse} font-mono`}
                >
                  {/*
                    `dir="ltr"` ist hier kein Zierrat. Im arabischen Baum
                    gehoert die Zeile zu einem RTL-Absatz, und der
                    Bidi-Algorithmus schiebt das fuehrende „+" ans andere
                    Ende: Aus „+41 76 504 58 79" wurde gerendert
                    „79 58 504 76 41+". Die Ziffernfolge blieb lesbar, die
                    Landesvorwahl stand hinten — eine Telefonnummer, die man
                    so nicht abtippen kann. Eine Nummer ist immer LTR,
                    unabhaengig vom Satz, in dem sie steht.
                  */}
                  <bdi dir="ltr">{contact.whatsapp}</bdi>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ---- 2 · Die fünf Ebenen als Signatur ------------------------- */}
        {/*
          Vorher ein zweites senkrechtes Menue unter „Seite" — fuenf Eintraege,
          die die erste Spalte 400 px laenger machten als die anderen drei.
          Als Zeile sind es dieselben fuenf Ziele, aber sie sagen jetzt etwas:
          01 traegt 02 traegt 03 — das Haus in einer Zeile, am Ende der Seite.
        */}
        <nav aria-label={t.footer.layersLabel} className="border-line mt-16 border-t pt-7">
          <p className="eyebrow text-muted-foreground">{t.footer.layersLabel}</p>
          <ul className="mt-5 flex flex-wrap items-baseline gap-x-8 gap-y-4">
            {serviceLayers.map((layer) => (
              <li key={layer.key}>
                <Link
                  href={`/leistungen#ebene-${layer.key}`}
                  className="group hover:text-foreground text-muted-foreground inline-flex items-baseline gap-2.5 transition-colors duration-[var(--dur-2)]"
                >
                  <span className="text-meta text-gold-text">{layer.level}</span>
                  <span className="text-sm">{t.services.layers[layer.key].name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ---- 3 · Das Verzeichnis --------------------------------------

            GATE 04 · WEB-0033 — VIER SPALTEN, DIE AUF DEM TELEFON VIER
            ABSCHNITTE WURDEN.

            Das Raster begann erst ab `sm` (640 px) zweispaltig. Darunter —
            also auf jedem Telefon — standen die vier Verzeichnisspalten
            untereinander: Seite, Produkte, Werkzeuge, Kontakt. Gemessen am
            11.09.2026: Footer 1.887 px auf 390 Pixeln, bei 968 px auf dem
            Schreibtisch. Der Abschluss war auf dem Telefon fast doppelt so
            hoch wie am Rechner — und er steht unter JEDER Seite.

            Zwei Spalten ab null. Dieselbe Entscheidung, die `ManagedOperations`
            fuer seine sieben Begriffe schon getroffen hat („Zwei Spalten ab
            null, drei ab sm"): Kurze Linklisten brauchen keine volle Breite,
            sie brauchen ein Paar.

            Was NICHT passiert ist: kein Link entfernt, keine Rubrik
            eingeklappt, kein Accordion. Die 28 Ziele bleiben erreichbar — sie
            stehen nur nicht mehr in einer Kolonne.
        ------------------------------------------------------------------ */}
        <div className="border-line mt-12 grid grid-cols-2 gap-x-8 gap-y-10 border-t pt-12 lg:grid-cols-4 lg:gap-10">
          <div>
            <p className="eyebrow text-gold-text">{t.footer.navLabel}</p>
            <ul className="mt-6 flex flex-col gap-3.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkKlasse}>
                    {t.nav[link.labelKey]}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/kontakt" className={linkKlasse}>
                  {t.nav.kontakt}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-gold-text">{t.footer.productsLabel}</p>
            <ul className="mt-6 flex flex-col gap-3.5">
              {/*
                Seit PHASE A hat jedes Produkt eine eigene Welt — der Footer
                fuehrt dorthin, nicht an der Seite vorbei.
              */}
              {productWorks.map((product) => (
                <li key={product.slug}>
                  <Link href={`/produkte/${product.slug}`} className={linkKlasse}>
                    {product.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {/*
              Diese vier standen unter „Seite" und haben sie doppelt so lang
              gemacht. Sie sind keine Kapitel: Der Betriebscheck ist ein
              Werkzeug, „Branche · Handwerk" ein Einstieg fuer Kampagne und
              Suche, Systeme und Managed Betrieb sind Angebote unterhalb der
              Hauptnavigation. Als eigene Gruppe sind sie auffindbar — und die
              vier Spalten enden gemeinsam.
            */}
            <p className="eyebrow text-gold-text">{t.footer.toolsLabel}</p>
            <ul className="mt-6 flex flex-col gap-3.5">
              <li>
                <Link href="/betriebscheck" className={linkKlasse}>
                  {checkCopy.eyebrow[locale]}
                </Link>
              </li>
              <li>
                <Link href="/aufwandsrechner" className={linkKlasse}>
                  {rechnerText.name[locale]}
                </Link>
              </li>
              <li>
                <Link href="/branchen/handwerk" className={linkKlasse}>
                  {handwerkCopy.eyebrow[locale]}
                </Link>
              </li>
              <li>
                <Link href="/systeme" className={linkKlasse}>
                  {t.nav.systeme}
                </Link>
              </li>
              <li>
                <Link href="/betrieb" className={linkKlasse}>
                  {t.nav.betrieb}
                </Link>
              </li>
              {/*
                Karriere steht hier und NICHT in der Hauptnavigation.

                Die Leiste trägt fünf kommerzielle Ziele plus Sprache, Thema,
                WhatsApp und den Gold-CTA; ein sechstes Wort hätte den Preis
                auf der Kundenseite bezahlt, für einen Bereich, der heute
                keine offene Stelle führt. Im Footer ist er in jeder Sprache
                auf jeder Seite erreichbar — und die Übersicht selbst sagt im
                ersten Absatz, dass es ein Talent Pool ist.

                (Die Hauptnavigation kommt ohnehin aus `lib/site-data.ts`.
                Die Datei gehört gerade einem anderen Arbeitszug; sie wird
                hier nicht angefasst.)
              */}
              <li>
                <Link href="/karriere" className={linkKlasse}>
                  {t.footer.karriereLabel}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="eyebrow text-gold-text">{t.nav.kontakt}</p>
            <address className="type-small text-muted-foreground mt-6 not-italic">
              {contact.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>

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
                        className="border-line text-muted-foreground hover:border-gold hover:text-gold-text text-meta flex size-11 items-center justify-center rounded-sm border transition-colors duration-[var(--dur-2)]"
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

        {/* ---- 4 · Die Rechtszeile -------------------------------------- */}
        {/*
          Leiser als die Navigation, aber vollstaendig und in einer Reihe —
          nicht als Spalte mit derselben Schriftgroesse wie „Leistungen".
          „Kostenlose Erstberatung" stand bis hierher hier drin; sie ist kein
          Rechtstext, sondern der Schritt oben rechts.

          Die Erklaerung zur Barrierefreiheit bleibt sichtbar und an derselben
          Stelle, an der Menschen sie suchen. Kleiner heisst nicht versteckt:
          eigener Text, eigener Link, 44 px Trefferflaeche ueber die Polsterung.
        */}
        <div className="border-line mt-14 flex flex-col gap-5 border-t pt-8">
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            {rechtliches.map((eintrag) => (
              <li key={eintrag.key}>
                {eintrag.href ? (
                  <Link
                    href={eintrag.href}
                    className="text-muted-foreground hover:text-foreground text-meta inline-block py-3 transition-colors duration-[var(--dur-2)]"
                  >
                    {eintrag.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={eintrag.onClick}
                    className="text-muted-foreground hover:text-foreground text-meta inline-block py-3 text-start transition-colors duration-[var(--dur-2)]"
                  >
                    {eintrag.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-meta">© 2026 creaDIG. {t.footer.rights}</p>
            <p className="text-muted-foreground text-meta">
              {contact.locations} · {contact.markets}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
