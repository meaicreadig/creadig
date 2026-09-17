import Link from "next/link"

import { UnavailableNote } from "@/components/admin/primitives"
import { adminSprachKontext } from "@/lib/admin-i18n/server"

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
export default async function AdminNotFound() {
  const { t } = await adminSprachKontext()
  return (
    <main className="bg-background text-foreground min-h-dvh px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="type-h3 mb-6">{t.nichtGefunden.titel}</h1>
        <UnavailableNote title={t.nichtGefunden.hinweisTitel}>{t.nichtGefunden.hinweis}</UnavailableNote>
        <div className="mt-6 flex flex-wrap gap-6">
          <Link href="/admin" className="text-gold-text text-sm underline underline-offset-4">
            {t.nichtGefunden.zurUebersicht}
          </Link>
        </div>
      </div>
    </main>
  )
}
