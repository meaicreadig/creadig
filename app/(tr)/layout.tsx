import { SiteShell, shellMetadata, viewport } from "@/components/site-shell"

/**
 * Wurzel-Layout des türkischen Baums (GROW-1).
 *
 * Es setzt `<html lang="tr">` — und zwar im Server-HTML, nicht erst nach der
 * Hydration. Das ist mehr als ein Suchmaschinen-Signal: `text-transform:
 * uppercase` macht aus dem türkischen i nach deutscher Regel ein I statt İ.
 * „İletişim" wurde damit zu „ILETISIM" — ein anderes Wort.
 */
export const metadata = shellMetadata("tr")
export { viewport }

export default function TrLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="tr">{children}</SiteShell>
}
