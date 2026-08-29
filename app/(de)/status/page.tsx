import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { collect } from "@/lib/material-status"

/*
 * MP-G — beim Umzug von `collect()` nach `lib/material-status.ts` waren
 * diese beiden Zeilen kurz weg. Sie sind kein Beiwerk: `force-dynamic`
 * verhindert, dass die Innenansicht zur Bauzeit eingefroren und ausgeliefert
 * wird, `noindex` hält sie aus den Suchergebnissen.
 */
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Materialstand",
  robots: { index: false, follow: false },
}

export default async function StatusPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const key = typeof params.key === "string" ? params.key : ""
  const secret = process.env.SELFTEST_SECRET

  /*
    In der Entwicklung immer erreichbar, im Betrieb nur mit dem Schluessel.
    Ohne gesetztes Geheimnis gibt es die Seite im Betrieb gar nicht — lieber
    keine Statusseite als eine offene Innenansicht.
  */
  if (process.env.NODE_ENV === "production" && (!secret || key !== secret)) {
    notFound()
  }

  const { open, done } = collect()

  return (
    <main className="section-gutter pt-32 pb-24 md:pt-40">
      <p className="eyebrow text-gold-text">Interne Ansicht · nicht öffentlich</p>
      <h1 className="type-h1 mt-6 text-balance">Materialstand</h1>
      <p className="type-lead text-muted-foreground mt-6 max-w-2xl text-pretty">
        Abgeleitet aus denselben Daten, aus denen die Seite gebaut wird. Diese Seite ändert
        nichts und erfindet nichts — sie sagt, was leer ist.
      </p>

      <section className="mt-16">
        <h2 className="type-h3">
          Offen <span className="text-muted-foreground">({open.length})</span>
        </h2>
        {open.length === 0 ? (
          <p className="type-body text-muted-foreground mt-6">Nichts offen.</p>
        ) : (
          <ul className="mt-8 flex flex-col">
            {open.map((item) => (
              <li key={item.label} className="border-line border-t py-5">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-subhead text-lg">{item.label}</span>
                  <span className="border-gold/50 text-gold-text eyebrow border px-2 py-0.5">
                    offen
                  </span>
                </div>
                <p className="type-small text-muted-foreground mt-2 text-pretty">{item.detail}</p>
                {item.owner !== "—" && (
                  <p className="text-meta text-muted-foreground mt-2">{item.owner}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-20">
        <h2 className="type-h3">
          Steht <span className="text-muted-foreground">({done.length})</span>
        </h2>
        <ul className="mt-8 flex flex-col">
          {done.map((item) => (
            <li key={item.label} className="border-line border-t py-4">
              <span className="text-subhead">{item.label}</span>
              <span className="type-small text-muted-foreground ml-3">{item.detail}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
