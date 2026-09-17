import { randomUUID } from "node:crypto"
import Link from "next/link"

import { AnfrageErfassenFormular } from "@/components/admin/anfrage-erfassen-formular"
import { VertriebShell } from "@/components/admin/vertrieb-shell"
import { adminSprachKontext } from "@/lib/admin-i18n/server"
import { leadStoreConfigured } from "@/lib/lead-store"
import { ROLLEN_KEYS } from "@/lib/rollen"
import { MANUELLE_QUELLEN } from "@/lib/vertrieb"

/**
 * ADM-03 · A03 — Anfrage von Hand erfassen.
 *
 * Der Idempotenzschlüssel entsteht HIER, beim Rendern: Wer dasselbe Formular
 * zweimal absendet (Doppelklick, Zurück, Netzwackler), erzeugt eine Anfrage.
 * Ein neues Formular (neuer Aufruf) bekommt einen neuen Schlüssel.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const { t } = await adminSprachKontext()
  return { title: t.erfassen.titel }
}

export default async function AnfrageErfassen() {
  const { t, sprache } = await adminSprachKontext()
  const verfuegbar = leadStoreConfigured()
  return (
    <VertriebShell title={t.erfassen.titel} lead={t.erfassen.lead} available={verfuegbar}>
      <Link href="/admin/vertrieb/anfragen" className="text-gold-text text-sm underline underline-offset-4">
        {t.anfrage.alle}
      </Link>
      <div className="mt-8">
        <AnfrageErfassenFormular
          idempotenz={randomUUID()}
          sprache={sprache}
          quellen={MANUELLE_QUELLEN.map((q) => ({ wert: q, name: t.begriffe.quelle[q] ?? q }))}
          rollen={ROLLEN_KEYS.map((r) => ({ wert: r, name: t.begriffe.rolle[r] ?? r }))}
          t={{
            erfassen: t.erfassen,
            anfrage: {
              nichtGespeichert: t.anfrage.nichtGespeichert,
              name: t.anfrage.name,
              betrieb: t.anfrage.betrieb,
              email: t.anfrage.email,
              telefon: t.anfrage.telefon,
              nachricht: t.anfrage.nachricht,
              verantwortlich: t.anfrage.verantwortlich,
            },
            formular: t.formular,
            niemand: t.begriffe.niemand,
          }}
        />
      </div>
    </VertriebShell>
  )
}
