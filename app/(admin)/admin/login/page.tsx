import { AdminLoginForm } from "@/components/admin/admin-login-form"
import { Logo } from "@/components/brand/logo"
import { hatKonten } from "@/lib/admin-konten"
import { SprachUmschalter } from "@/components/admin/sprach-umschalter"
import { adminSprachKontext } from "@/lib/admin-i18n/server"

/**
 * Die Anmeldung. Eine Seite, ein Feld.
 *
 * Sie verrät nichts: kein Nutzername, kein Hinweis auf die Firma, kein
 * „Willkommen zurück". Wer hier landet, ohne es zu suchen, sieht ein
 * Passwortfeld und weiß nicht, wofür.
 *
 * Ohne `ADMIN_PASSWORD` und `ADMIN_SESSION_SECRET` kommt niemand bis hierher:
 * `middleware.ts` antwortet dann auf allem unter `/admin` mit 404.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const { t } = await adminSprachKontext()
  return { title: t.login.titel }
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  /* ADM-01 — Sprache schon VOR der Anmeldung wählbar (A01). */
  const { sprache, t } = await adminSprachKontext()
  const expired = params.abgelaufen === "1"
  /* ADM-02 · H2 — eine widerrufene Sitzung ist kein Ablauf und kein Fehler. */
  const revoked = params.widerrufen === "1"

  return (
    <main className="bg-background text-foreground grid min-h-dvh place-items-center px-6 py-16">
      <div className="border-line bg-surface w-full max-w-md rounded-2xl border p-8 shadow-2xl sm:p-10">
        <div className="flex justify-end">
          <SprachUmschalter
            aktuell={sprache}
            label={t.sprache.umschalterLabel}
            namen={{ de: { kurz: "DE", name: "Deutsch" }, tr: { kurz: "TR", name: "Türkçe" } }}
          />
        </div>
        <div className="border-line mt-6 flex flex-col gap-5 border-b pb-8">
          <Logo variant="light" className="h-8 w-auto self-start" priority />
          <span className="flex items-center gap-3">
            <span aria-hidden="true" className="bg-gold h-px w-8" />
            <h1 className="text-gold-text font-mono text-xs tracking-[0.32em] uppercase">{t.shell.produkt}</h1>
          </span>
        </div>
        {!(await hatKonten()) && (
          <p className="type-small text-muted-foreground mt-3 text-pretty">{t.login.ersteAnmeldung}</p>
        )}
        {expired && (
          <p
            role="status"
            className="border-gold/45 text-foreground/80 type-small mt-6 border-s-2 ps-4 text-pretty"
          >
            {t.login.abgelaufen}
          </p>
        )}
        {revoked && (
          <p
            role="status"
            className="border-gold/45 text-foreground/80 type-small mt-6 border-s-2 ps-4 text-pretty"
          >
            {t.login.widerrufen}
          </p>
        )}
        <AdminLoginForm texte={t.login} />
      </div>
    </main>
  )
}
