import Link from "next/link"

import { AdminShell } from "@/components/admin/admin-shell"
import { UnavailableNote } from "@/components/admin/primitives"

/**
 * Im Control Center gibt es diese Adresse nicht.
 *
 * Der wichtigste Aufrufer ist `notFound()` in `/admin/leads/[id]`: Der
 * Speicher hat geantwortet, und zu dieser Kennung liegt nichts vor. Das ist
 * eine ANDERE Aussage als „Speicher nicht erreichbar" — und sie muss anders
 * aussehen, sonst sucht man an der falschen Stelle.
 */
export default function AdminNotFound() {
  return (
    <AdminShell title="Nicht gefunden">
      <UnavailableNote title="Diese Adresse gibt es hier nicht">
        Die Datenquelle hat geantwortet — zu dieser Kennung liegt nur nichts
        vor. Möglich ist ein alter Link, eine getippte Kennung oder ein
        Datensatz, den es nicht mehr gibt.
      </UnavailableNote>

      <div className="mt-6 flex flex-wrap gap-6">
        <Link href="/admin" className="text-gold-text text-sm underline underline-offset-4">
          Zu Heute
        </Link>
        <Link href="/admin/material" className="text-gold-text text-sm underline underline-offset-4">
          Zum Materialstand
        </Link>
      </div>
    </AdminShell>
  )
}
