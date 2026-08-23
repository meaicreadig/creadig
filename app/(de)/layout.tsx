import { SiteShell, shellMetadata, viewport } from "@/components/site-shell"

/**
 * Wurzel-Layout des deutschen Baums (GROW-1).
 *
 * Deutsch bleibt ohne Präfix: `/`, `/leistungen`, `/produkte`. Die Gruppe
 * `(de)` taucht in keiner Adresse auf — Klammern sind für Next eine reine
 * Ordnungshilfe. Sie ist trotzdem nötig, weil zwei Wurzel-Layouts nur
 * nebeneinander existieren können, wenn jedes in einer eigenen Gruppe liegt
 * und `app/layout.tsx` entfällt.
 */
export const metadata = shellMetadata("de")
export { viewport }

export default function DeLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="de">{children}</SiteShell>
}
