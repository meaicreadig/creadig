import { Logo } from "@/components/brand/logo"
import { FinanzAnmeldung } from "@/components/finanz/anmeldung"
import { finanzBasis } from "@/lib/finanz/basis"

export const dynamic = "force-dynamic"
export const metadata = { title: "Anmelden" }

export default async function FinanzLogin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const p = await searchParams
  const basis = await finanzBasis()
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="bg-card flex w-full max-w-md flex-col gap-8 rounded-[2rem] p-8 shadow-xl sm:p-10">
        <div className="flex items-center gap-3">
          <Logo variant="dark" className="h-6" />
          <span className="bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide">Finanz</span>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Dein Geld. Klar vor Augen.</h1>
          <p className="text-muted-foreground leading-relaxed">Melde dich an, um deine Finanzabteilung zu öffnen.</p>
        </div>
        <FinanzAnmeldung ziel={basis || "/"} hinweis={p.abgelaufen === "1" ? "Deine Sitzung ist abgelaufen." : undefined} />
      </div>
    </main>
  )
}
