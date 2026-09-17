import Link from "next/link"

import { UnavailableNote } from "@/components/admin/primitives"

/**
 * Im Control Center gibt es diese Adresse nicht.
 *
 * Der wichtigste Aufrufer ist `notFound()` in `/admin/leads/[id]`: Der
 * Speicher hat geantwortet, und zu dieser Kennung liegt nichts vor. Das ist
 * eine ANDERE Aussage als „Speicher nicht erreichbar" — und sie muss anders
 * aussehen, sonst sucht man an der falschen Stelle.
 *
 * ADM-02 · H11 (17.09.2026) — OHNE NAVIGATION.
 * Next legt die Not-Found-Grenze eines Segments in den Seiten-Payload JEDER
 * Seite darunter — auch der Anmeldung. Mit `AdminShell` stand dort die ganze
 * Navigation samt Bereichsbeschreibungen, lesbar ohne Anmeldung (gemessen:
 * „Anfragen, Pipeline, Beziehungen" im HTML von `/admin/login`). Diese Seite
 * braucht keine Navigation: Sie hat zwei Links.
 */
export default function AdminNotFound() {
  return (
    <main className="bg-background text-foreground min-h-dvh px-6 py-16">
      <div className="mx-auto max-w-2xl">
      <h1 className="type-h3 mb-6">Nicht gefunden</h1>
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
      </div>
    </main>
  )
}
