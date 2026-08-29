import { AdminLoginForm } from "@/components/admin/admin-login-form"

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

export const metadata = { title: "Anmeldung" }

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const expired = params.abgelaufen === "1"

  return (
    <main className="bg-background text-foreground grid min-h-dvh place-items-center px-6 py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow text-gold-text">creaDIG</p>
        <h1 className="type-h3 mt-2">Control Center</h1>
        {expired && (
          <p
            role="status"
            className="border-gold/45 text-foreground/80 type-small mt-6 border-l-2 pl-4 text-pretty"
          >
            Die Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.
          </p>
        )}
        <AdminLoginForm />
      </div>
    </main>
  )
}
