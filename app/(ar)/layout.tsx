import { SiteShell, shellMetadata, viewport } from "@/components/site-shell"

/**
 * Wurzel-Layout des englischen Baums (Gate 3).
 *
 * Es setzt `<html lang="en">` im Server-HTML. Der Grund ist derselbe wie im
 * tuerkischen Baum: Ein Crawler sieht das Server-HTML, und eine englische
 * Seite unter deutschem `lang` wird als Dublette der deutschen aussortiert.
 * Dazu kommt die Silbentrennung — Browser trennen nach der Sprache, die im
 * Dokument steht, nicht nach der, in der der Text geschrieben ist.
 */
export const metadata = shellMetadata("ar")
export { viewport }

export default function ArLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="ar">{children}</SiteShell>
}
