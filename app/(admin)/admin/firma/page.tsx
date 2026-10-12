import { AdminShell } from "@/components/admin/admin-shell"
import { SectionHeader, Surface } from "@/components/admin/primitives"
import { FIRMA } from "@/lib/firmengehirn"

export const metadata = { title: "Firmengehirn" }

export default function Page() {
  return (
    <AdminShell
      title="Firmengehirn"
      lead="Wer wir sind, was wir anbieten, wie wir sprechen. Jeder KI-Entwurf schreibt auf dieser Grundlage."
    >
      <div className="flex flex-col gap-6">
        <Surface>
          <p className="text-gold-text font-mono text-xs uppercase tracking-widest">{FIRMA.rechtsform}</p>
          <p className="mt-3 text-xl leading-relaxed text-pretty">{FIRMA.satz}</p>
          <p className="text-muted-foreground mt-3 text-sm">
            {FIRMA.inhaber} · {FIRMA.sitz} · {FIRMA.sprachen.join(" · ")}
          </p>
        </Surface>
        <div className="grid gap-6 md:grid-cols-2">
          {FIRMA.abschnitte.map((a) => (
            <Surface key={a.titel}>
              <SectionHeader title={a.titel} />
              <ul className="mt-4 flex flex-col gap-3">
                {a.punkte.map((p) => (
                  <li key={p} className="border-gold/40 border-l-2 pl-3 text-sm leading-relaxed">
                    {p}
                  </li>
                ))}
              </ul>
            </Surface>
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
